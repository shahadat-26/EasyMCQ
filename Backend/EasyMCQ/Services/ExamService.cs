using EasyMCQ.Data;
using EasyMCQ.DTOs;
using EasyMCQ.Models;
using Microsoft.EntityFrameworkCore;

namespace EasyMCQ.Services
{
    public interface IExamService
    {
        Task<ExamDto?> CreateExamAsync(CreateExamDto dto, int teacherId);
        Task<List<ExamDto>> GetCourseExamsAsync(int courseId, int userId, UserRole userRole);
        Task<ExamDetailsDto?> GetExamDetailsAsync(int examId, int studentId);
        Task<bool> StartExamAsync(int examId, int studentId);
        Task<ExamResultDto?> SubmitExamAsync(int examId, int studentId, SubmitExamDto dto);
        Task<ExamResultDto?> GetExamResultAsync(int examId, int studentId);
        Task<bool> PublishExamAsync(int examId, int teacherId);
        Task<List<StudentExamResultDto>?> GetAllExamResultsAsync(int examId, int teacherId);
        Task<List<StudentExamResultDto>> GetStudentCourseResultsAsync(int studentId, int courseId);
        Task<CourseStatisticsDto?> GetCourseStatisticsAsync(int courseId, int teacherId);
    }

    public class ExamService : IExamService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public ExamService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ExamDto?> CreateExamAsync(CreateExamDto dto, int teacherId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);

            if (course == null)
                return null;

            var exam = new Exam
            {
                Title = dto.Title,
                Description = dto.Description,
                CourseId = dto.CourseId,
                ScheduledStartTime = dto.ScheduledStartTime,
                ScheduledEndTime = dto.ScheduledEndTime,
                DurationInMinutes = dto.DurationInMinutes,
                PassingMarks = dto.PassingMarks,
                TotalMarks = dto.Questions.Sum(q => q.Marks)
            };

            int questionOrder = 1;
            foreach (var questionDto in dto.Questions)
            {
                var question = new Question
                {
                    Text = questionDto.Text,
                    Marks = questionDto.Marks,
                    OrderNumber = questionOrder++
                };

                int optionOrder = 1;
                foreach (var optionDto in questionDto.Options)
                {
                    question.Options.Add(new Option
                    {
                        Text = optionDto.Text,
                        IsCorrect = optionDto.IsCorrect,
                        OrderNumber = optionOrder++
                    });
                }

                exam.Questions.Add(question);
            }

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            var enrolledStudents = await _context.Enrollments
                .Where(e => e.CourseId == dto.CourseId && e.IsActive)
                .Select(e => e.StudentId)
                .ToListAsync();

            foreach (var studentId in enrolledStudents)
            {
                await _notificationService.CreateNotificationAsync(
                    studentId,
                    "New Exam Created",
                    $"A new exam '{exam.Title}' has been created in course '{course.Name}'",
                    NotificationType.ExamCreated
                );
            }

            return await GetExamDtoAsync(exam.Id, 0, UserRole.Teacher);
        }

        public async Task<List<ExamDto>> GetCourseExamsAsync(int courseId, int userId, UserRole userRole)
        {
            var examsQuery = _context.Exams
                .Include(e => e.Course)
                .Include(e => e.Questions)
                .Where(e => e.CourseId == courseId);

            if (userRole == UserRole.Student)
            {
                examsQuery = examsQuery.Where(e => e.IsPublished);
            }

            var exams = await examsQuery.ToListAsync();
            var examDtos = new List<ExamDto>();

            foreach (var exam in exams)
            {
                var dto = await GetExamDtoAsync(exam.Id, userId, userRole);
                if (dto != null)
                    examDtos.Add(dto);
            }

            return examDtos;
        }

        public async Task<ExamDetailsDto?> GetExamDetailsAsync(int examId, int studentId)
        {
            var studentExam = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(se => se.ExamId == examId && se.StudentId == studentId);

            if (studentExam == null || studentExam.Status != ExamStatus.InProgress)
                return null;

            var exam = studentExam.Exam;
            var now = DateTime.Now;
            var examEndTime = studentExam.StartedAt!.Value.AddMinutes(exam.DurationInMinutes);

            if (now > examEndTime)
            {
                await AutoSubmitExamAsync(studentExam);
                return null;
            }

            return new ExamDetailsDto
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                CourseId = exam.CourseId,
                ScheduledStartTime = exam.ScheduledStartTime,
                ScheduledEndTime = exam.ScheduledEndTime,
                DurationInMinutes = exam.DurationInMinutes,
                TotalMarks = exam.TotalMarks,
                PassingMarks = exam.PassingMarks,
                Questions = exam.Questions.OrderBy(q => q.OrderNumber).Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Marks = q.Marks,
                    OrderNumber = q.OrderNumber,
                    Options = q.Options.OrderBy(o => o.OrderNumber).Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Text = o.Text,
                        OrderNumber = o.OrderNumber
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<bool> StartExamAsync(int examId, int studentId)
        {
            var exam = await _context.Exams
                .Include(e => e.Course)
                .ThenInclude(c => c.Enrollments)
                .FirstOrDefaultAsync(e => e.Id == examId && e.IsPublished);

            if (exam == null)
                return false;

            var isEnrolled = exam.Course.Enrollments.Any(e => e.StudentId == studentId && e.IsActive);
            if (!isEnrolled)
                return false;

            // Use local time for comparison since frontend sends local time
            var now = DateTime.Now;
            if (now < exam.ScheduledStartTime || now > exam.ScheduledEndTime)
                return false;

            var existingStudentExam = await _context.StudentExams
                .FirstOrDefaultAsync(se => se.ExamId == examId && se.StudentId == studentId);

            if (existingStudentExam != null)
            {
                if (existingStudentExam.Status != ExamStatus.NotStarted)
                    return false;

                existingStudentExam.StartedAt = DateTime.Now;
                existingStudentExam.Status = ExamStatus.InProgress;
            }
            else
            {
                var studentExam = new StudentExam
                {
                    StudentId = studentId,
                    ExamId = examId,
                    StartedAt = DateTime.Now,
                    Status = ExamStatus.InProgress
                };
                _context.StudentExams.Add(studentExam);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ExamResultDto?> SubmitExamAsync(int examId, int studentId, SubmitExamDto dto)
        {
            var studentExam = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e.Questions)
                .ThenInclude(q => q.Options)
                .Include(se => se.StudentAnswers)
                .FirstOrDefaultAsync(se => se.ExamId == examId && se.StudentId == studentId);

            if (studentExam == null || studentExam.Status != ExamStatus.InProgress)
                return null;

            _context.StudentAnswers.RemoveRange(studentExam.StudentAnswers);

            int totalScore = 0;
            foreach (var answer in dto.Answers)
            {
                var question = studentExam.Exam.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null)
                    continue;

                var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId);
                bool isCorrect = selectedOption?.IsCorrect ?? false;
                int marksObtained = isCorrect ? question.Marks : 0;
                totalScore += marksObtained;

                studentExam.StudentAnswers.Add(new StudentAnswer
                {
                    QuestionId = answer.QuestionId,
                    SelectedOptionId = answer.SelectedOptionId,
                    IsCorrect = isCorrect,
                    MarksObtained = marksObtained
                });
            }

            studentExam.TotalScore = totalScore;
            studentExam.IsPassed = totalScore >= studentExam.Exam.PassingMarks;
            studentExam.Status = ExamStatus.Submitted;
            studentExam.SubmittedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(
                studentId,
                "Exam Submitted",
                $"Your exam '{studentExam.Exam.Title}' has been submitted. Score: {totalScore}/{studentExam.Exam.TotalMarks}",
                NotificationType.ExamCompleted
            );

            return await GetExamResultAsync(examId, studentId);
        }

        public async Task<ExamResultDto?> GetExamResultAsync(int examId, int studentId)
        {
            var studentExam = await _context.StudentExams
                .Include(se => se.Exam)
                .Include(se => se.StudentAnswers)
                .ThenInclude(sa => sa.Question)
                .ThenInclude(q => q.Options)
                .Include(se => se.StudentAnswers)
                .ThenInclude(sa => sa.SelectedOption)
                .FirstOrDefaultAsync(se => se.ExamId == examId && se.StudentId == studentId);

            if (studentExam == null || studentExam.Status != ExamStatus.Submitted)
                return null;

            var questionResults = new List<QuestionResultDto>();
            foreach (var answer in studentExam.StudentAnswers)
            {
                var correctOption = answer.Question.Options.FirstOrDefault(o => o.IsCorrect);
                questionResults.Add(new QuestionResultDto
                {
                    QuestionId = answer.QuestionId,
                    QuestionText = answer.Question.Text,
                    Marks = answer.Question.Marks,
                    ObtainedMarks = answer.MarksObtained,
                    SelectedAnswer = answer.SelectedOption?.Text ?? "Not Answered",
                    CorrectAnswer = correctOption?.Text ?? "N/A",
                    IsCorrect = answer.IsCorrect
                });
            }

            return new ExamResultDto
            {
                ExamId = examId,
                ExamTitle = studentExam.Exam.Title,
                TotalMarks = studentExam.Exam.TotalMarks,
                ObtainedMarks = studentExam.TotalScore,
                PassingMarks = studentExam.Exam.PassingMarks,
                IsPassed = studentExam.IsPassed,
                SubmittedAt = studentExam.SubmittedAt!.Value,
                QuestionResults = questionResults
            };
        }

        public async Task<bool> PublishExamAsync(int examId, int teacherId)
        {
            var exam = await _context.Exams
                .Include(e => e.Course)
                .ThenInclude(c => c.Enrollments)
                .FirstOrDefaultAsync(e => e.Id == examId && e.Course.TeacherId == teacherId);

            if (exam == null || exam.IsPublished)
                return false;

            exam.IsPublished = true;
            await _context.SaveChangesAsync();

            var enrolledStudents = exam.Course.Enrollments
                .Where(e => e.IsActive)
                .Select(e => e.StudentId)
                .ToList();

            foreach (var studentId in enrolledStudents)
            {
                var studentExam = new StudentExam
                {
                    StudentId = studentId,
                    ExamId = examId,
                    Status = ExamStatus.NotStarted
                };
                _context.StudentExams.Add(studentExam);

                await _notificationService.CreateNotificationAsync(
                    studentId,
                    "Exam Published",
                    $"Exam '{exam.Title}' is now available. Scheduled from {exam.ScheduledStartTime:g} to {exam.ScheduledEndTime:g}",
                    NotificationType.ExamScheduled
                );
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<ExamDto?> GetExamDtoAsync(int examId, int userId, UserRole userRole)
        {
            var exam = await _context.Exams
                .Include(e => e.Course)
                .Include(e => e.Questions)
                .FirstOrDefaultAsync(e => e.Id == examId);

            if (exam == null)
                return null;

            var dto = new ExamDto
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                CourseId = exam.CourseId,
                CourseName = exam.Course.Name,
                ScheduledStartTime = exam.ScheduledStartTime,
                ScheduledEndTime = exam.ScheduledEndTime,
                DurationInMinutes = exam.DurationInMinutes,
                TotalMarks = exam.TotalMarks,
                PassingMarks = exam.PassingMarks,
                IsPublished = exam.IsPublished,
                TotalQuestions = exam.Questions.Count
            };

            if (userRole == UserRole.Student)
            {
                var studentExam = await _context.StudentExams
                    .FirstOrDefaultAsync(se => se.ExamId == examId && se.StudentId == userId);

                if (studentExam != null)
                {
                    dto.StudentStatus = studentExam.Status;
                    dto.StudentScore = studentExam.TotalScore;
                }

                var now = DateTime.Now;
                dto.CanStart = exam.IsPublished &&
                             now >= exam.ScheduledStartTime &&
                             now <= exam.ScheduledEndTime &&
                             (studentExam == null || studentExam.Status == ExamStatus.NotStarted);
            }

            return dto;
        }

        private async Task AutoSubmitExamAsync(StudentExam studentExam)
        {
            studentExam.Status = ExamStatus.TimeUp;
            studentExam.SubmittedAt = DateTime.Now;
            await _context.SaveChangesAsync();
        }

        public async Task<List<StudentExamResultDto>?> GetAllExamResultsAsync(int examId, int teacherId)
        {
            var exam = await _context.Exams
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == examId && e.Course.TeacherId == teacherId);

            if (exam == null)
                return null;

            var studentExams = await _context.StudentExams
                .Include(se => se.Student)
                .Where(se => se.ExamId == examId)
                .ToListAsync();

            var results = new List<StudentExamResultDto>();

            foreach (var studentExam in studentExams)
            {
                results.Add(new StudentExamResultDto
                {
                    StudentId = studentExam.StudentId,
                    StudentName = studentExam.Student.Name,
                    StudentEmail = studentExam.Student.Email,
                    ExamId = examId,
                    ExamTitle = exam.Title,
                    TotalMarks = exam.TotalMarks,
                    ObtainedMarks = studentExam.TotalScore,
                    PassingMarks = exam.PassingMarks,
                    IsPassed = studentExam.IsPassed,
                    SubmittedAt = studentExam.SubmittedAt,
                    Status = studentExam.Status.ToString()
                });
            }

            return results.OrderByDescending(r => r.ObtainedMarks).ToList();
        }

        public async Task<List<StudentExamResultDto>> GetStudentCourseResultsAsync(int studentId, int courseId)
        {
            var exams = await _context.Exams
                .Where(e => e.CourseId == courseId && e.IsPublished)
                .ToListAsync();

            var results = new List<StudentExamResultDto>();

            foreach (var exam in exams)
            {
                var studentExam = await _context.StudentExams
                    .FirstOrDefaultAsync(se => se.ExamId == exam.Id && se.StudentId == studentId);

                if (studentExam != null)
                {
                    var student = await _context.Users.FindAsync(studentId);
                    results.Add(new StudentExamResultDto
                    {
                        StudentId = studentId,
                        StudentName = student?.Name ?? "",
                        StudentEmail = student?.Email ?? "",
                        ExamId = exam.Id,
                        ExamTitle = exam.Title,
                        TotalMarks = exam.TotalMarks,
                        ObtainedMarks = studentExam.TotalScore,
                        PassingMarks = exam.PassingMarks,
                        IsPassed = studentExam.IsPassed,
                        SubmittedAt = studentExam.SubmittedAt,
                        Status = studentExam.Status.ToString()
                    });
                }
            }

            return results.OrderBy(r => r.SubmittedAt).ToList();
        }

        public async Task<CourseStatisticsDto?> GetCourseStatisticsAsync(int courseId, int teacherId)
        {
            var course = await _context.Courses
                .Include(c => c.Enrollments)
                .ThenInclude(e => e.Student)
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);

            if (course == null)
                return null;

            var exams = await _context.Exams
                .Where(e => e.CourseId == courseId)
                .ToListAsync();

            var statistics = new CourseStatisticsDto
            {
                CourseId = courseId,
                CourseName = course.Name,
                TotalStudents = course.Enrollments.Count(e => e.IsActive),
                TotalExams = exams.Count
            };

            foreach (var exam in exams)
            {
                var studentExams = await _context.StudentExams
                    .Where(se => se.ExamId == exam.Id)
                    .ToListAsync();

                var attempted = studentExams.Where(se => se.Status != ExamStatus.NotStarted).ToList();

                statistics.ExamStatistics.Add(new ExamStatisticsDto
                {
                    ExamId = exam.Id,
                    ExamTitle = exam.Title,
                    TotalStudents = statistics.TotalStudents,
                    StudentsAttempted = attempted.Count,
                    StudentsPassed = attempted.Count(se => se.IsPassed),
                    StudentsFailed = attempted.Count(se => !se.IsPassed && se.Status == ExamStatus.Submitted),
                    AverageScore = attempted.Any() ? attempted.Average(se => se.TotalScore) : 0,
                    PassPercentage = attempted.Any() ? (attempted.Count(se => se.IsPassed) * 100.0 / attempted.Count) : 0,
                    HighestScore = attempted.Any() ? attempted.Max(se => se.TotalScore) : 0,
                    LowestScore = attempted.Any() ? attempted.Min(se => se.TotalScore) : 0
                });
            }

            foreach (var enrollment in course.Enrollments.Where(e => e.IsActive))
            {
                var studentExams = await _context.StudentExams
                    .Include(se => se.Exam)
                    .Where(se => se.StudentId == enrollment.StudentId && se.Exam.CourseId == courseId)
                    .ToListAsync();

                var attempted = studentExams.Where(se => se.Status == ExamStatus.Submitted || se.Status == ExamStatus.TimeUp).ToList();

                var studentPerf = new StudentPerformanceDto
                {
                    StudentId = enrollment.StudentId,
                    StudentName = enrollment.Student.Name,
                    StudentEmail = enrollment.Student.Email,
                    TotalExamsAttempted = attempted.Count,
                    TotalExamsPassed = attempted.Count(se => se.IsPassed),
                    AverageScore = attempted.Any() ? attempted.Average(se => se.TotalScore) : 0,
                    OverallPercentage = attempted.Any() ? attempted.Average(se => (se.TotalScore * 100.0 / se.Exam.TotalMarks)) : 0
                };

                foreach (var se in attempted)
                {
                    studentPerf.ExamResults.Add(new StudentExamResultDto
                    {
                        StudentId = enrollment.StudentId,
                        StudentName = enrollment.Student.Name,
                        StudentEmail = enrollment.Student.Email,
                        ExamId = se.ExamId,
                        ExamTitle = se.Exam.Title,
                        TotalMarks = se.Exam.TotalMarks,
                        ObtainedMarks = se.TotalScore,
                        PassingMarks = se.Exam.PassingMarks,
                        IsPassed = se.IsPassed,
                        SubmittedAt = se.SubmittedAt,
                        Status = se.Status.ToString()
                    });
                }

                statistics.StudentPerformances.Add(studentPerf);
            }

            return statistics;
        }
    }
}