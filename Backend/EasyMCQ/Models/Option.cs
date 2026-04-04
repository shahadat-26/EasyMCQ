using System.ComponentModel.DataAnnotations;

namespace EasyMCQ.Models
{
    public class Option
    {
        public int Id { get; set; }

        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

        [Required]
        public string Text { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }
        public int OrderNumber { get; set; }
    }
}