using EasyMCQ.Models;
using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.DTOs
{
    public class CreateExamDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        [Required]
        public int CourseId { get; set; }

        [Required]
        public DateTime ScheduledStartTime { get; set; }

        [Required]
        public DateTime ScheduledEndTime { get; set; }

        [Required]
        [Range(1, 300)]
        public int DurationInMinutes { get; set; }

        [Required]
        public int PassingMarks { get; set; }

        public List<CreateQuestionDto> Questions { get; set; } = new();
    }

    public class CreateQuestionDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public int Marks { get; set; }

        [Required]
        [MinLength(4)]
        [MaxLength(4)]
        public List<CreateOptionDto> Options { get; set; } = new();
    }

    public class CreateOptionDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }
    }

    public class ExamDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public int DurationInMinutes { get; set; }
        public int TotalMarks { get; set; }
        public int PassingMarks { get; set; }
        public bool IsPublished { get; set; }
        public int TotalQuestions { get; set; }
        public ExamStatus? StudentStatus { get; set; }
        public int? StudentScore { get; set; }
        public bool CanStart { get; set; }
    }

    public class ExamDetailsDto : ExamDto
    {
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Marks { get; set; }
        public int OrderNumber { get; set; }
        public List<OptionDto> Options { get; set; } = new();
        public int? SelectedOptionId { get; set; }
    }

    public class OptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int OrderNumber { get; set; }
        public bool? IsCorrect { get; set; }
    }

    public class StartExamDto
    {
        public int ExamId { get; set; }
    }

    public class SubmitAnswerDto
    {
        public int QuestionId { get; set; }
        public int? SelectedOptionId { get; set; }
    }

    public class SubmitExamDto
    {
        public List<SubmitAnswerDto> Answers { get; set; } = new();
    }

    public class ExamResultDto
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public int PassingMarks { get; set; }
        public bool IsPassed { get; set; }
        public DateTime SubmittedAt { get; set; }
        public List<QuestionResultDto> QuestionResults { get; set; } = new();
    }

    public class QuestionResultDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int Marks { get; set; }
        public int ObtainedMarks { get; set; }
        public string SelectedAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}