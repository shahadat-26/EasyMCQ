namespace EasyMCQ.DTOs
{
    public class StudentExamResultDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public int PassingMarks { get; set; }
        public bool IsPassed { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public double Percentage => TotalMarks > 0 ? (ObtainedMarks * 100.0 / TotalMarks) : 0;
    }

    public class CourseStatisticsDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalExams { get; set; }
        public List<ExamStatisticsDto> ExamStatistics { get; set; } = new();
        public List<StudentPerformanceDto> StudentPerformances { get; set; } = new();
    }

    public class ExamStatisticsDto
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int StudentsAttempted { get; set; }
        public int StudentsPassed { get; set; }
        public int StudentsFailed { get; set; }
        public double AverageScore { get; set; }
        public double PassPercentage { get; set; }
        public int HighestScore { get; set; }
        public int LowestScore { get; set; }
    }

    public class StudentPerformanceDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public int TotalExamsAttempted { get; set; }
        public int TotalExamsPassed { get; set; }
        public double AverageScore { get; set; }
        public double OverallPercentage { get; set; }
        public List<StudentExamResultDto> ExamResults { get; set; } = new();
    }
}