export interface StudentExamResult {
  studentId: number;
  studentName: string;
  studentEmail: string;
  examId: number;
  examTitle: string;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  isPassed: boolean;
  submittedAt?: Date;
  status: string;
  percentage: number;
}

export interface CourseStatistics {
  courseId: number;
  courseName: string;
  totalStudents: number;
  totalExams: number;
  examStatistics: ExamStatistics[];
  studentPerformances: StudentPerformance[];
}

export interface ExamStatistics {
  examId: number;
  examTitle: string;
  totalStudents: number;
  studentsAttempted: number;
  studentsPassed: number;
  studentsFailed: number;
  averageScore: number;
  passPercentage: number;
  highestScore: number;
  lowestScore: number;
}

export interface StudentPerformance {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalExamsAttempted: number;
  totalExamsPassed: number;
  averageScore: number;
  overallPercentage: number;
  examResults: StudentExamResult[];
}