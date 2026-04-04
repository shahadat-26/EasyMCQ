namespace EasyMCQ.Models
{
    public class StudentExam
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public User Student { get; set; } = null!;

        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        public DateTime? StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }

        public int TotalScore { get; set; }
        public bool IsPassed { get; set; }
        public ExamStatus Status { get; set; }

        public List<StudentAnswer> StudentAnswers { get; set; } = new();
    }

    public enum ExamStatus
    {
        NotStarted = 1,
        InProgress = 2,
        Submitted = 3,
        TimeUp = 4
    }
}