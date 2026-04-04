namespace EasyMCQ.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public NotificationType Type { get; set; }
        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ReadAt { get; set; }
    }

    public enum NotificationType
    {
        ExamCreated = 1,
        ExamScheduled = 2,
        ExamStarted = 3,
        ExamCompleted = 4,
        CourseEnrollment = 5
    }
}