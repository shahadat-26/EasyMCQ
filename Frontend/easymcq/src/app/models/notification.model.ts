export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  ExamCreated = 1,
  ExamScheduled = 2,
  ExamStarted = 3,
  ExamCompleted = 4,
  CourseEnrollment = 5
}