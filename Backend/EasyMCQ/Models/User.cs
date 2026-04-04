using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public List<Course> TeacherCourses { get; set; } = new();
        public List<Enrollment> StudentEnrollments { get; set; } = new();
        public List<StudentExam> StudentExams { get; set; } = new();
        public List<Notification> Notifications { get; set; } = new();
    }

    public enum UserRole
    {
        Student = 1,
        Teacher = 2
    }
}