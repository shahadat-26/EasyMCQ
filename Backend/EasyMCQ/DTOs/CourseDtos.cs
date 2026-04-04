using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.DTOs
{
    public class CreateCourseDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CourseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int EnrollmentCount { get; set; }
        public bool IsEnrolled { get; set; }
    }

    public class EnrollmentDto
    {
        public int CourseId { get; set; }
    }

    public class StudentProgressDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalExams { get; set; }
        public int CompletedExams { get; set; }
        public double AverageScore { get; set; }
    }

    public class CourseDetailsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int EnrollmentCount { get; set; }
        public bool IsEnrolled { get; set; }
        public List<ExamDto> Exams { get; set; } = new List<ExamDto>();
    }
}