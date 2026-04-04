using EasyMCQ.Data;
using EasyMCQ.DTOs;
using EasyMCQ.Models;
using Microsoft.EntityFrameworkCore;

namespace EasyMCQ.Services
{
    public interface ICourseService
    {
        Task<CourseDto?> CreateCourseAsync(CreateCourseDto dto, int teacherId);
        Task<List<CourseDto>> GetTeacherCoursesAsync(int teacherId);
        Task<List<CourseDto>> GetAvailableCoursesAsync(int studentId);
        Task<List<CourseDto>> GetEnrolledCoursesAsync(int studentId);
        Task<bool> EnrollStudentAsync(int studentId, int courseId);
        Task<List<StudentProgressDto>> GetCourseStudentsAsync(int courseId, int teacherId);
        Task<CourseDetailsDto?> GetCourseDetailsAsync(int courseId, int userId);
    }

    public class CourseService : ICourseService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public CourseService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<CourseDto?> CreateCourseAsync(CreateCourseDto dto, int teacherId)
        {
            var course = new Course
            {
                Name = dto.Name,
                Description = dto.Description,
                TeacherId = teacherId
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return await GetCourseDtoAsync(course.Id);
        }

        public async Task<List<CourseDto>> GetTeacherCoursesAsync(int teacherId)
        {
            var courses = await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Enrollments)
                .Where(c => c.TeacherId == teacherId && c.IsActive)
                .ToListAsync();

            return courses.Select(c => new CourseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.Name,
                CreatedAt = c.CreatedAt,
                IsActive = c.IsActive,
                EnrollmentCount = c.Enrollments.Count
            }).ToList();
        }

        public async Task<List<CourseDto>> GetAvailableCoursesAsync(int studentId)
        {
            var enrolledCourseIds = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.CourseId)
                .ToListAsync();

            var courses = await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Enrollments)
                .Where(c => c.IsActive && !enrolledCourseIds.Contains(c.Id))
                .ToListAsync();

            return courses.Select(c => new CourseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.Name,
                CreatedAt = c.CreatedAt,
                IsActive = c.IsActive,
                EnrollmentCount = c.Enrollments.Count,
                IsEnrolled = false
            }).ToList();
        }

        public async Task<List<CourseDto>> GetEnrolledCoursesAsync(int studentId)
        {
            var courses = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Teacher)
                .Include(e => e.Course)
                .ThenInclude(c => c.Enrollments)
                .Where(e => e.StudentId == studentId && e.IsActive)
                .Select(e => e.Course)
                .ToListAsync();

            return courses.Select(c => new CourseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                TeacherId = c.TeacherId,
                TeacherName = c.Teacher.Name,
                CreatedAt = c.CreatedAt,
                IsActive = c.IsActive,
                EnrollmentCount = c.Enrollments.Count,
                IsEnrolled = true
            }).ToList();
        }

        public async Task<bool> EnrollStudentAsync(int studentId, int courseId)
        {
            var existingEnrollment = await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            if (existingEnrollment)
                return false;

            var enrollment = new Enrollment
            {
                StudentId = studentId,
                CourseId = courseId
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course != null)
            {
                await _notificationService.CreateNotificationAsync(
                    studentId,
                    "Course Enrollment",
                    $"You have been enrolled in {course.Name}",
                    NotificationType.CourseEnrollment
                );
            }

            return true;
        }

        public async Task<List<StudentProgressDto>> GetCourseStudentsAsync(int courseId, int teacherId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);

            if (course == null)
                return new List<StudentProgressDto>();

            var students = await _context.Enrollments
                .Include(e => e.Student)
                .ThenInclude(s => s.StudentExams)
                .ThenInclude(se => se.Exam)
                .Where(e => e.CourseId == courseId && e.IsActive)
                .Select(e => new
                {
                    Student = e.Student,
                    ExamResults = e.Student.StudentExams
                        .Where(se => se.Exam.CourseId == courseId && se.Status == ExamStatus.Submitted)
                })
                .ToListAsync();

            return students.Select(s => new StudentProgressDto
            {
                StudentId = s.Student.Id,
                StudentName = s.Student.Name,
                Email = s.Student.Email,
                TotalExams = s.ExamResults.Count(),
                CompletedExams = s.ExamResults.Count(er => er.Status == ExamStatus.Submitted),
                AverageScore = s.ExamResults.Any()
                    ? s.ExamResults.Average(er => (double)er.TotalScore / er.Exam.TotalMarks * 100)
                    : 0
            }).ToList();
        }

        public async Task<CourseDetailsDto?> GetCourseDetailsAsync(int courseId, int userId)
        {
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Enrollments)
                .Include(c => c.Exams)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
                return null;

            var isEnrolled = course.Enrollments.Any(e => e.StudentId == userId && e.IsActive);
            var isTeacher = course.TeacherId == userId;

            // Only allow access if user is the teacher or an enrolled student
            if (!isTeacher && !isEnrolled)
                return null;

            return new CourseDetailsDto
            {
                Id = course.Id,
                Name = course.Name,
                Description = course.Description,
                TeacherId = course.TeacherId,
                TeacherName = course.Teacher.Name,
                CreatedAt = course.CreatedAt,
                IsActive = course.IsActive,
                EnrollmentCount = course.Enrollments.Count,
                IsEnrolled = isEnrolled,
                Exams = course.Exams.Select(e => new ExamDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    CourseId = e.CourseId,
                    CourseName = course.Name,
                    ScheduledStartTime = e.ScheduledStartTime,
                    ScheduledEndTime = e.ScheduledEndTime,
                    DurationInMinutes = e.DurationInMinutes,
                    TotalMarks = e.TotalMarks,
                    PassingMarks = e.PassingMarks,
                    IsPublished = e.IsPublished
                }).ToList()
            };
        }

        private async Task<CourseDto?> GetCourseDtoAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null)
                return null;

            return new CourseDto
            {
                Id = course.Id,
                Name = course.Name,
                Description = course.Description,
                TeacherId = course.TeacherId,
                TeacherName = course.Teacher.Name,
                CreatedAt = course.CreatedAt,
                IsActive = course.IsActive,
                EnrollmentCount = course.Enrollments.Count
            };
        }
    }
}