export interface Exam {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  durationInMinutes: number;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  totalQuestions: number;
  studentStatus?: ExamStatus;
  studentScore?: number;
  canStart?: boolean;
}

export enum ExamStatus {
  NotStarted = 1,
  InProgress = 2,
  Submitted = 3,
  TimeUp = 4
}

export interface CreateExamDto {
  title: string;
  description: string;
  courseId: number;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  durationInMinutes: number;
  passingMarks: number;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  marks: number;
  options: CreateOptionDto[];
}

export interface CreateOptionDto {
  text: string;
  isCorrect: boolean;
}

export interface ExamDetails extends Exam {
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  marks: number;
  orderNumber: number;
  options: Option[];
  selectedOptionId?: number;
}

export interface Option {
  id: number;
  text: string;
  orderNumber: number;
  isCorrect?: boolean;
}

export interface SubmitAnswerDto {
  questionId: number;
  selectedOptionId: number | null;
}

export interface SubmitExamDto {
  answers: SubmitAnswerDto[];
}

export interface ExamResult {
  examId: number;
  examTitle: string;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  isPassed: boolean;
  submittedAt: Date;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  questionText: string;
  marks: number;
  obtainedMarks: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}