using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.Models
{
    public class Course
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;

        public List<Enrollment> Enrollments { get; set; } = new();
        public List<Exam> Exams { get; set; } = new();
    }
}