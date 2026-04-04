import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { CourseService } from '../../../services/course.service';
import { StudentExamResult } from '../../../models/result.model';
import { Exam } from '../../../models/exam.model';

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-navy-900">Exam Results</h2>
            @if (exam) {
              <p class="text-gray-600 mt-2">{{ exam.title }}</p>
              <p class="text-sm text-gray-500">Course: {{ exam.courseName }}</p>
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
            <p class="text-gray-600">No students have taken this exam yet.</p>
          </div>
        } @else {
          <div class="mb-4">
            <div class="grid grid-cols-4 gap-4 text-center">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ results.length }}</div>
                <div class="text-sm text-gray-600">Total Students</div>
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
                <div class="text-2xl font-bold text-purple-600">{{ averageScore.toFixed(1) }}%</div>
                <div class="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-navy-900 text-white">
                <tr>
                  <th class="px-4 py-3 text-left">Student Name</th>
                  <th class="px-4 py-3 text-left">Email</th>
                  <th class="px-4 py-3 text-center">Obtained Marks</th>
                  <th class="px-4 py-3 text-center">Total Marks</th>
                  <th class="px-4 py-3 text-center">Percentage</th>
                  <th class="px-4 py-3 text-center">Status</th>
                  <th class="px-4 py-3 text-center">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                @for (result of results; track result.studentId) {
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">{{ result.studentName }}</td>
                    <td class="px-4 py-3">{{ result.studentEmail }}</td>
                    <td class="px-4 py-3 text-center">{{ result.obtainedMarks }}</td>
                    <td class="px-4 py-3 text-center">{{ result.totalMarks }}</td>
                    <td class="px-4 py-3 text-center">
                      <span [class.text-green-600]="result.isPassed"
                            [class.text-red-600]="!result.isPassed"
                            class="font-semibold">
                        {{ result.percentage.toFixed(1) }}%
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (result.isPassed) {
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Passed</span>
                      } @else {
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Failed</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-center">
                      @if (result.submittedAt) {
                        {{ formatDate(result.submittedAt) }}
                      } @else {
                        <span class="text-gray-500">-</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
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
export class ExamResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  private courseService = inject(CourseService);

  examId = 0;
  exam: Exam | null = null;
  results: StudentExamResult[] = [];
  loading = false;

  get passedCount(): number {
    return this.results.filter(r => r.isPassed).length;
  }

  get failedCount(): number {
    return this.results.filter(r => !r.isPassed).length;
  }

  get averageScore(): number {
    if (this.results.length === 0) return 0;
    const sum = this.results.reduce((acc, r) => acc + r.percentage, 0);
    return sum / this.results.length;
  }

  ngOnInit() {
    this.examId = Number(this.route.snapshot.paramMap.get('examId'));
    if (this.examId) {
      this.loadExamDetails();
      this.loadResults();
    }
  }

  loadExamDetails() {
    const courseId = Number(this.route.snapshot.queryParamMap.get('courseId'));
    if (courseId) {
      this.courseService.getCourseDetails(courseId).subscribe({
        next: (course: any) => {
          const exam = course.exams?.find((e: any) => e.id === this.examId);
          if (exam) {
            this.exam = exam;
          }
        }
      });
    }
  }

  loadResults() {
    this.loading = true;
    this.examService.getAllExamResults(this.examId).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

  goBack() {
    this.router.navigate(['/teacher-dashboard']);
  }
}