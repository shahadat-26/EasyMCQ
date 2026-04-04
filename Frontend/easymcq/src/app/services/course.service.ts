import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CreateCourseDto, EnrollmentDto, StudentProgress, CourseDetails } from '../models/course.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/course`;

  createCourse(data: CreateCourseDto): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/create`, data);
  }

  getTeacherCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/teacher`);
  }

  getAvailableCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/available`);
  }

  getEnrolledCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/enrolled`);
  }

  enrollInCourse(courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/enroll`, { courseId });
  }

  getCourseStudents(courseId: number): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`${this.apiUrl}/${courseId}/students`);
  }

  getCourseDetails(courseId: number): Observable<CourseDetails> {
    return this.http.get<CourseDetails>(`${this.apiUrl}/${courseId}`);
  }
}