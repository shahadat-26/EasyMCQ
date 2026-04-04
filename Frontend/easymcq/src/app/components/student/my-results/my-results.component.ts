import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { CourseService } from '../../../services/course.service';
import { AuthService } from '../../../services/auth.service';
import { StudentExamResult } from '../../../models/result.model';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-my-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-navy-900">My Exam Results</h2>
            @if (course) {
              <p class="text-gray-600 mt-2">Course: {{ course.name }}</p>
              <p class="text-sm text-gray-500">Instructor: {{ course.teacherName }}</p>
            }
          </div>
          <button
            (click)="goBack()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
            Back to Dashboard
          </button>
        </div>

        @if (loading) {
          <div class="text-center py-8">
            <div class="text-gray-600">Loading results...</div>
          </div>
        } @else if (results.length === 0) {
          <div class="text-center py-8">
            <p class="text-gray-600">You haven't taken any exams in this course yet.</p>
          </div>
        } @else {
          <div class="mb-6">
            <div class="grid grid-cols-4 gap-4 text-center">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ results.length }}</div>
                <div class="text-sm text-gray-600">Exams Taken</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ passedCount }}</div>
                <div class="text-sm text-gray-600">Passed</div>
              </div>
              <div class="bg-red-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{{ failedCount }}</div>
                <div class="text-sm text-gray-600">Failed</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ averagePercentage.toFixed(1) }}%</div>
                <div class="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            @for (result of results; track result.examId) {
              <div class="border rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg">{{ result.examTitle }}</h3>
                    <p class="text-gray-600 text-sm mt-1">
                      Submitted on: {{ formatDate(result.submittedAt) }}
                    </p>
                  </div>
                  <div class="text-right">
                    @if (result.isPassed) {
                      <span class="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                        PASSED
                      </span>
                    } @else {
                      <span class="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-semibold">
                        FAILED
                      </span>
                    }
                  </div>
                </div>

                <div class="mt-4 grid grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-gray-600 text-sm">Your Score</div>
                    <div class="text-xl font-bold">{{ result.obtainedMarks }}/{{ result.totalMarks }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-gray-600 text-sm">Percentage</div>
                    <div class="text-xl font-bold"
                         [class.text-green-600]="result.isPassed"
                         [class.text-red-600]="!result.isPassed">
                      {{ result.percentage.toFixed(1) }}%
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-gray-600 text-sm">Passing Marks</div>
                    <div class="text-xl font-bold">{{ result.passingMarks }}</div>
                  </div>
                </div>

                <div class="mt-4">
                  <div class="bg-gray-100 rounded-lg p-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Progress</span>
                      <span class="text-sm font-semibold">{{ result.percentage.toFixed(0) }}%</span>
                    </div>
                    <div class="mt-2 bg-white rounded-full h-2 overflow-hidden">
                      <div class="h-full transition-all duration-500"
                           [class.bg-green-500]="result.isPassed"
                           [class.bg-red-500]="!result.isPassed"
                           [style.width.%]="result.percentage">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bg-navy-900 { background-color: #1e3a5f; }
    .text-navy-900 { color: #1e3a5f; }
  `]
})
export class MyResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  courseId = 0;
  course: Course | null = null;
  results: StudentExamResult[] = [];
  loading = false;

  get passedCount(): number {
    return this.results.filter(r => r.isPassed).length;
  }

  get failedCount(): number {
    return this.results.filter(r => !r.isPassed).length;
  }

  get averagePercentage(): number {
    if (this.results.length === 0) return 0;
    const sum = this.results.reduce((acc, r) => acc + r.percentage, 0);
    return sum / this.results.length;
  }

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (this.courseId) {
      this.loadCourseDetails();
      this.loadResults();
    }
  }

  loadCourseDetails() {
    this.courseService.getCourseDetails(this.courseId).subscribe({
      next: (course: Course) => {
        this.course = course;
      },
      error: (error: any) => {
        console.error('Error loading course:', error);
      }
    });
  }

  loadResults() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;
    this.examService.getStudentCourseResults(user.userId, this.courseId).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading results:', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  }

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }
}