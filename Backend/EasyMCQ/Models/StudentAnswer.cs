namespace EasyMCQ.Models
{
    public class StudentAnswer
    {
        public int Id { get; set; }

        public int StudentExamId { get; set; }
        public StudentExam StudentExam { get; set; } = null!;

        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        public int? SelectedOptionId { get; set; }
        public Option? SelectedOption { get; set; }

        public bool IsCorrect { get; set; }
        public int MarksObtained { get; set; }
    }
}