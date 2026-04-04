using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.Models
{
    public class Exam
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;

        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public int DurationInMinutes { get; set; }

        public int TotalMarks { get; set; }
        public int PassingMarks { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsPublished { get; set; } = false;

        public List<Question> Questions { get; set; } = new();
        public List<StudentExam> StudentExams { get; set; } = new();
    }
}