import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Exam,
  CreateExamDto,
  ExamDetails,
  SubmitExamDto,
  ExamResult
} from '../models/exam.model';
import {
  StudentExamResult,
  CourseStatistics,
  StudentPerformance
} from '../models/result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/exam`;

  createExam(data: CreateExamDto): Observable<Exam> {
    return this.http.post<Exam>(`${this.apiUrl}/create`, data);
  }

  publishExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${examId}/publish`, {});
  }

  getCourseExams(courseId: number): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/course/${courseId}`);
  }

  startExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${examId}/start`, {});
  }

  getExamDetails(examId: number): Observable<ExamDetails> {
    return this.http.get<ExamDetails>(`${this.apiUrl}/${examId}/details`);
  }

  submitExam(examId: number, data: SubmitExamDto): Observable<ExamResult> {
    return this.http.post<ExamResult>(`${this.apiUrl}/${examId}/submit`, data);
  }

  getExamResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/${examId}/result`);
  }

  getAllExamResults(examId: number): Observable<StudentExamResult[]> {
    return this.http.get<StudentExamResult[]>(`${this.apiUrl}/${examId}/all-results`);
  }

  getStudentCourseResults(studentId: number, courseId: number): Observable<StudentExamResult[]> {
    return this.http.get<StudentExamResult[]>(`${this.apiUrl}/student/${studentId}/course/${courseId}/results`);
  }

  getCourseStatistics(courseId: number): Observable<CourseStatistics> {
    return this.http.get<CourseStatistics>(`${this.apiUrl}/course/${courseId}/statistics`);
  }
}