import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Course } from '../../models/course.model';
import { Exam, ExamStatus } from '../../models/exam.model';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-navy-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold">EasyMCQ - Student Dashboard</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button (click)="loadNotifications()" class="relative">
                <span class="text-white">🔔</span>
                @if (unreadCount > 0) {
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ unreadCount }}
                  </span>
                }
              </button>
              <span>Welcome, {{ currentUser?.name }}</span>
              <button (click)="logout()" class="bg-navy-700 hover:bg-navy-600 px-4 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-navy-900 mb-2">Enrolled Courses</h3>
            <p class="text-3xl font-bold text-navy-600">{{ enrolledCourses.length }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-navy-900 mb-2">Upcoming Exams</h3>
            <p class="text-3xl font-bold text-orange-600">{{ upcomingExams.length }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-navy-900 mb-2">Completed Exams</h3>
            <p class="text-3xl font-bold text-green-600">{{ completedExams.length }}</p>
          </div>
        </div>

        <div class="flex space-x-4 mb-6">
          <button (click)="activeTab = 'courses'"
                  [class.bg-navy-600]="activeTab === 'courses'"
                  [class.text-white]="activeTab === 'courses'"
                  [class.bg-white]="activeTab !== 'courses'"
                  class="px-4 py-2 rounded-lg font-medium">
            My Courses
          </button>
          <button (click)="activeTab = 'available'"
                  [class.bg-navy-600]="activeTab === 'available'"
                  [class.text-white]="activeTab === 'available'"
                  [class.bg-white]="activeTab !== 'available'"
                  class="px-4 py-2 rounded-lg font-medium">
            Available Courses
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
              <h2 class="text-xl font-semibold text-navy-900">Enrolled Courses</h2>
            </div>
            <div class="p-6">
              @if (enrolledCourses.length === 0) {
                <p class="text-gray-500">You haven't enrolled in any courses yet.</p>
              } @else {
                <div class="grid gap-4">
                  @for (course of enrolledCourses; track course.id) {
                    <div class="border rounded-lg p-4">
                      <h3 class="text-lg font-semibold text-navy-900">{{ course.name }}</h3>
                      <p class="text-gray-600 mt-1">{{ course.description }}</p>
                      <p class="text-sm text-gray-500 mt-2">Teacher: {{ course.teacherName }}</p>
                      <div class="mt-3 flex space-x-2">
                        <button (click)="viewCourseExams(course)"
                                class="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2 rounded text-sm">
                          View Exams
                        </button>
                        <button (click)="viewMyResults(course)"
                                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
                          My Results
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab === 'available') {
          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b">
              <h2 class="text-xl font-semibold text-navy-900">Available Courses</h2>
            </div>
            <div class="p-6">
              @if (availableCourses.length === 0) {
                <p class="text-gray-500">No new courses available.</p>
              } @else {
                <div class="grid gap-4">
                  @for (course of availableCourses; track course.id) {
                    <div class="border rounded-lg p-4">
                      <div class="flex justify-between items-start">
                        <div>
                          <h3 class="text-lg font-semibold text-navy-900">{{ course.name }}</h3>
                          <p class="text-gray-600 mt-1">{{ course.description }}</p>
                          <p class="text-sm text-gray-500 mt-2">
                            Teacher: {{ course.teacherName }} |
                            {{ course.enrollmentCount }} students enrolled
                          </p>
                        </div>
                        <button (click)="enrollInCourse(course)"
                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                          Enroll
                        </button>
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
              <h2 class="text-xl font-semibold text-navy-900">Your Exams</h2>
            </div>
            <div class="p-6">
              @if (selectedCourse) {
                <div class="mb-4 p-3 bg-navy-50 rounded">
                  <p class="text-navy-900">Showing exams for: <strong>{{ selectedCourse.name }}</strong></p>
                </div>
              }

              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Upcoming Exams</h3>
                @if (upcomingExams.length === 0) {
                  <p class="text-gray-500">No upcoming exams.</p>
                } @else {
                  <div class="grid gap-4">
                    @for (exam of upcomingExams; track exam.id) {
                      <div class="border rounded-lg p-4">
                        <div class="flex justify-between items-start">
                          <div>
                            <h4 class="font-semibold text-navy-900">{{ exam.title }}</h4>
                            <p class="text-gray-600 text-sm mt-1">{{ exam.description }}</p>
                            <div class="mt-2 text-sm text-gray-500">
                              <p>Start: {{ exam.scheduledStartTime | date:'short' }}</p>
                              <p>Duration: {{ exam.durationInMinutes }} minutes</p>
                              <p>Total Marks: {{ exam.totalMarks }}</p>
                            </div>
                          </div>
                          @if (exam.canStart) {
                            <button (click)="startExam(exam)"
                                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                              Start Exam
                            </button>
                          } @else if (exam.studentStatus === ExamStatus.InProgress) {
                            <button (click)="continueExam(exam)"
                                    class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded">
                              Continue
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-3">Completed Exams</h3>
                @if (completedExams.length === 0) {
                  <p class="text-gray-500">No completed exams.</p>
                } @else {
                  <div class="grid gap-4">
                    @for (exam of completedExams; track exam.id) {
                      <div class="border rounded-lg p-4">
                        <div class="flex justify-between items-start">
                          <div>
                            <h4 class="font-semibold text-navy-900">{{ exam.title }}</h4>
                            <p class="text-sm text-gray-500 mt-1">
                              Score: {{ exam.studentScore }}/{{ exam.totalMarks }}
                              <span [class.text-green-600]="exam.studentScore! >= exam.passingMarks"
                                    [class.text-red-600]="exam.studentScore! < exam.passingMarks"
                                    class="ml-2">
                                ({{ exam.studentScore! >= exam.passingMarks ? 'Passed' : 'Failed' }})
                              </span>
                            </p>
                          </div>
                          <button (click)="viewResult(exam)"
                                  class="bg-navy-600 hover:bg-navy-700 text-white px-3 py-1 rounded text-sm">
                            View Result
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (showNotifications) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Notifications</h2>
                <button (click)="showNotifications = false" class="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              @if (notifications.length === 0) {
                <p class="text-gray-500">No notifications.</p>
              } @else {
                <div class="space-y-3">
                  @for (notification of notifications; track notification.id) {
                    <div class="border rounded p-3" [class.bg-blue-50]="!notification.isRead">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold">{{ notification.title }}</h4>
                          <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                          <p class="text-xs text-gray-500 mt-2">{{ notification.createdAt | date:'short' }}</p>
                        </div>
                        @if (!notification.isRead) {
                          <button (click)="markAsRead(notification)"
                                  class="text-blue-600 hover:text-blue-800 text-sm">
                            Mark as read
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  private courseService = inject(CourseService);
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.getCurrentUser();
  enrolledCourses: Course[] = [];
  availableCourses: Course[] = [];
  exams: Exam[] = [];
  upcomingExams: Exam[] = [];
  completedExams: Exam[] = [];
  ExamStatus = ExamStatus;
  notifications: Notification[] = [];
  unreadCount = 0;

  activeTab: 'courses' | 'available' | 'exams' = 'courses';
  selectedCourse: Course | null = null;
  showNotifications = false;

  ngOnInit() {
    this.loadEnrolledCourses();
    this.loadAvailableCourses();
    this.loadUnreadCount();
  }

  loadEnrolledCourses() {
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        this.enrolledCourses = courses;
        if (courses.length > 0) {
          this.loadAllExams();
        }
      }
    });
  }

  loadAvailableCourses() {
    this.courseService.getAvailableCourses().subscribe({
      next: (courses) => this.availableCourses = courses
    });
  }

  loadAllExams() {
    this.upcomingExams = [];
    this.completedExams = [];

    for (const course of this.enrolledCourses) {
      this.examService.getCourseExams(course.id).subscribe({
        next: (exams) => {
          const now = new Date();

          const upcoming = exams.filter(e => {
            const endTime = new Date(e.scheduledEndTime);
            const isNotExpired = endTime > now;
            return (e.studentStatus === ExamStatus.NotStarted ||
                    e.studentStatus === ExamStatus.InProgress) &&
                    isNotExpired;
          }).map(exam => {
            const startTime = new Date(exam.scheduledStartTime);
            const now = new Date();
            exam.canStart = exam.isPublished &&
                           startTime <= now &&
                           exam.studentStatus === ExamStatus.NotStarted;
            return exam;
          });

          const completed = exams.filter(e => {
            const endTime = new Date(e.scheduledEndTime);
            const isExpired = endTime <= now;
            return e.studentStatus === ExamStatus.Submitted ||
                   e.studentStatus === ExamStatus.TimeUp ||
                   (e.studentStatus === ExamStatus.NotStarted && isExpired);
          });

          this.upcomingExams.push(...upcoming);
          this.completedExams.push(...completed);
        }
      });
    }
  }

  viewCourseExams(course: Course) {
    this.selectedCourse = course;
    this.activeTab = 'exams';
    this.loadCourseExams(course.id);
  }

  loadCourseExams(courseId: number) {
    this.examService.getCourseExams(courseId).subscribe({
      next: (exams) => {
        this.exams = exams;
        const now = new Date();

        this.upcomingExams = exams.filter(e => {
          const endTime = new Date(e.scheduledEndTime);
          const isNotExpired = endTime > now;
          return (e.studentStatus === ExamStatus.NotStarted ||
                  e.studentStatus === ExamStatus.InProgress) &&
                  isNotExpired;
        }).map(exam => {
          const startTime = new Date(exam.scheduledStartTime);
          const now = new Date();
          exam.canStart = exam.isPublished &&
                         startTime <= now &&
                         exam.studentStatus === ExamStatus.NotStarted;
          return exam;
        });

        this.completedExams = exams.filter(e => {
          const endTime = new Date(e.scheduledEndTime);
          const isExpired = endTime <= now;
          return e.studentStatus === ExamStatus.Submitted ||
                 e.studentStatus === ExamStatus.TimeUp ||
                 (e.studentStatus === ExamStatus.NotStarted && isExpired);
        });
      }
    });
  }

  enrollInCourse(course: Course) {
    this.courseService.enrollInCourse(course.id).subscribe({
      next: () => {
        this.availableCourses = this.availableCourses.filter(c => c.id !== course.id);
        this.loadEnrolledCourses();
      }
    });
  }

  startExam(exam: Exam) {
    this.examService.startExam(exam.id).subscribe({
      next: () => {
        this.router.navigate(['/exam', exam.id]);
      },
      error: (err) => {
        console.error('Failed to start exam', err);
        const errorMessage = err.error?.message || 'Failed to start exam. Please try again.';
        alert(errorMessage);
      }
    });
  }

  continueExam(exam: Exam) {
    this.router.navigate(['/exam', exam.id]);
  }

  viewResult(exam: Exam) {
    this.router.navigate(['/exam-result', exam.id]);
  }

  loadNotifications() {
    this.showNotifications = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => this.notifications = notifications
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (data) => this.unreadCount = data.count
    });
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.loadUnreadCount();
      }
    });
  }

  viewMyResults(course: Course) {
    this.router.navigate(['/student/my-results', course.id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}