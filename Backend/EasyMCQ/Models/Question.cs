using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.Models
{
    public class Question
    {
        public int Id { get; set; }

        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        [Required]
        public string Text { get; set; } = string.Empty;

        public int Marks { get; set; }
        public int OrderNumber { get; set; }

        public List<Option> Options { get; set; } = new();
        public List<StudentAnswer> StudentAnswers { get; set; } = new();
    }
}