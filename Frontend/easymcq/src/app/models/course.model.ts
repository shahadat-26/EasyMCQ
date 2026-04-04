export interface Course {
  id: number;
  name: string;
  description: string;
  teacherId: number;
  teacherName: string;
  createdAt: Date;
  isActive: boolean;
  enrollmentCount: number;
  isEnrolled?: boolean;
}

export interface CreateCourseDto {
  name: string;
  description: string;
}

export interface EnrollmentDto {
  courseId: number;
}

export interface StudentProgress {
  studentId: number;
  studentName: string;
  email: string;
  totalExams: number;
  completedExams: number;
  averageScore: number;
}

import { Exam } from './exam.model';

export interface CourseDetails extends Course {
  exams: Exam[];
}