import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../services/course.service';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Course, CreateCourseDto } from '../../models/course.model';
import { Exam, CreateExamDto, CreateQuestionDto } from '../../models/exam.model';
import { CreateExamFormComponent } from './create-exam-form.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CreateExamFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-navy-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold">EasyMCQ - Teacher Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span>Welcome, {{ currentUser?.name }}</span>
              <button (click)="logout()" class="bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-2xl font-bold text-navy-900 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button (click)="showCreateCourse = true"
                      class="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-lg">
                Create New Course
              </button>
              <button (click)="activeTab = 'courses'"
                      class="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-lg">
                Manage Courses
              </button>
              <button (click)="activeTab = 'exams'"
                      class="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-lg">
                Manage Exams
              </button>
            </div>
          </div>
        </div>

        <div class="flex space-x-4 mb-6">
          <button (click)="activeTab = 'courses'"
                  [class.bg-navy-600]="activeTab === 'courses'"
                  [class.text-white]="activeTab === 'courses'"
                  [class.bg-white]="activeTab !== 'courses'"
                  class="px-4 py-2 rounded-lg font-medium">
            Courses
          </button>
          <button (click)="activeTab = 'exams'"
                  [class.bg-navy-600]="activeTab === 'exams'"
                  [class.text-white]="activeTab === 'exams'"
                  [class.bg-white]="activeTab !== 'exams'"
                  class="px-4 py-2 rounded-lg font-medium">
            Exams
          </button>
        </div>

        @if (activeTab === 'courses') {
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
              <h2 class="text-xl font-semibold text-navy-900">Your Courses</h2>
            </div>
            <div class="p-6">
              @if (courses.length === 0) {
                <p class="text-gray-500">No courses yet. Create your first course!</p>
              } @else {
                <div class="grid gap-4">
                  @for (course of courses; track course.id) {
                    <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div class="flex justify-between items-start">
                        <div>
                          <h3 class="text-lg font-semibold text-navy-900">{{ course.name }}</h3>
                          <p class="text-gray-600 mt-1">{{ course.description }}</p>
                          <p class="text-sm text-gray-500 mt-2">
                            {{ course.enrollmentCount }} students enrolled
                          </p>
                        </div>
                        <div class="flex space-x-2">
                          <button (click)="selectCourseForExam(course)"
                                  class="bg-navy-600 hover:bg-navy-700 text-white px-3 py-1 rounded text-sm">
                            Create Exam
                          </button>
                          <button (click)="viewCourseExams(course)"
                                  class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                            View Exams
                          </button>
                          <button (click)="viewCourseStatistics(course)"
                                  class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                            Statistics
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab === 'exams') {
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
              <h2 class="text-xl font-semibold text-navy-900">All Exams</h2>
            </div>
            <div class="p-6">
              @if (selectedCourse) {
                <div class="mb-4 p-3 bg-navy-50 rounded">
                  <p class="text-navy-900">Showing exams for: <strong>{{ selectedCourse.name }}</strong></p>
                </div>
              }
              @if (exams.length === 0) {
                <p class="text-gray-500">No exams created yet.</p>
              } @else {
                <div class="grid gap-4">
                  @for (exam of exams; track exam.id) {
                    <div class="border rounded-lg p-4">
                      <div class="flex justify-between items-start">
                        <div>
                          <h3 class="text-lg font-semibold text-navy-900">{{ exam.title }}</h3>
                          <p class="text-gray-600 mt-1">{{ exam.description }}</p>
                          <div class="mt-2 text-sm text-gray-500">
                            <p>Duration: {{ exam.durationInMinutes }} minutes</p>
                            <p>Total Marks: {{ exam.totalMarks }}</p>
                            <p>Questions: {{ exam.totalQuestions }}</p>
                            <p>Status:
                              <span [class.text-green-600]="exam.isPublished"
                                    [class.text-orange-600]="!exam.isPublished">
                                {{ exam.isPublished ? 'Published' : 'Draft' }}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div class="flex space-x-2">
                          @if (!exam.isPublished) {
                            <button (click)="publishExam(exam)"
                                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                              Publish
                            </button>
                          }
                          @if (exam.isPublished) {
                            <button (click)="viewExamResults(exam)"
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                              View Results
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (showCreateCourse) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 class="text-xl font-bold mb-4">Create New Course</h2>
              <form [formGroup]="courseForm" (ngSubmit)="createCourse()">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                  <input formControlName="name" type="text"
                         class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea formControlName="description" rows="3"
                            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                  <button type="button" (click)="showCreateCourse = false"
                          class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                    Cancel
                  </button>
                  <button type="submit" [disabled]="courseForm.invalid"
                          class="px-4 py-2 bg-navy-600 text-white rounded hover:bg-navy-700 disabled:opacity-50">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        @if (showCreateExam && selectedCourse) {
          <div class="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen p-4">
              <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl font-bold mb-4">Create Exam for {{ selectedCourse.name }}</h2>
                <app-create-exam-form
                  [courseId]="selectedCourse.id"
                  (examCreated)="onExamCreated()"
                  (cancelled)="showCreateExam = false">
                </app-create-exam-form>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TeacherDashboardComponent implements OnInit {
  private courseService = inject(CourseService);
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = this.authService.getCurrentUser();
  courses: Course[] = [];
  exams: Exam[] = [];
  selectedCourse: Course | null = null;
  activeTab: 'courses' | 'exams' = 'courses';
  showCreateCourse = false;
  showCreateExam = false;

  courseForm: FormGroup;

  constructor() {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getTeacherCourses().subscribe({
      next: (courses) => this.courses = courses,
      error: (err) => console.error('Failed to load courses', err)
    });
  }

  createCourse() {
    if (this.courseForm.invalid) return;

    this.courseService.createCourse(this.courseForm.value).subscribe({
      next: () => {
        this.showCreateCourse = false;
        this.courseForm.reset();
        this.loadCourses();
      },
      error: (err) => console.error('Failed to create course', err)
    });
  }

  selectCourseForExam(course: Course) {
    this.selectedCourse = course;
    this.showCreateExam = true;
  }

  viewCourseExams(course: Course) {
    this.selectedCourse = course;
    this.activeTab = 'exams';
    this.loadExams(course.id);
  }

  loadExams(courseId: number) {
    this.examService.getCourseExams(courseId).subscribe({
      next: (exams) => this.exams = exams,
      error: (err) => console.error('Failed to load exams', err)
    });
  }

  publishExam(exam: Exam) {
    this.examService.publishExam(exam.id).subscribe({
      next: () => {
        exam.isPublished = true;
      },
      error: (err) => console.error('Failed to publish exam', err)
    });
  }

  onExamCreated() {
    this.showCreateExam = false;
    if (this.selectedCourse) {
      this.loadExams(this.selectedCourse.id);
    }
  }

  viewCourseStatistics(course: Course) {
    this.router.navigate(['/teacher/course-statistics', course.id]);
  }

  viewExamResults(exam: Exam) {
    this.router.navigate(['/teacher/exam-results', exam.id], {
      queryParams: { courseId: this.selectedCourse?.id }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}