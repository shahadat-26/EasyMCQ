import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { CourseService } from '../../../services/course.service';
import { CourseStatistics, StudentPerformance } from '../../../models/result.model';

@Component({
  selector: 'app-course-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-navy-900">Course Statistics</h2>
            @if (statistics) {
              <p class="text-gray-600 mt-2">{{ statistics.courseName }}</p>
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
            <div class="text-gray-600">Loading statistics...</div>
          </div>
        } @else if (statistics) {
          <div class="mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-3xl font-bold text-blue-600">{{ statistics.totalStudents }}</div>
                <div class="text-sm text-gray-600">Total Enrolled Students</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-3xl font-bold text-purple-600">{{ statistics.totalExams }}</div>
                <div class="text-sm text-gray-600">Total Exams</div>
              </div>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-xl font-semibold text-navy-900 mb-4">Exam Performance Overview</h3>
            @if (statistics.examStatistics.length === 0) {
              <p class="text-gray-600">No exams have been created yet.</p>
            } @else {
              <div class="grid gap-4">
                @for (exam of statistics.examStatistics; track exam.examId) {
                  <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-semibold text-lg">{{ exam.examTitle }}</h4>
                      <button
                        (click)="viewExamResults(exam.examId)"
                        class="text-blue-600 hover:text-blue-800 text-sm">
                        View Details →
                      </button>
                    </div>
                    <div class="grid grid-cols-5 gap-3 text-center">
                      <div>
                        <div class="text-xl font-bold">{{ exam.studentsAttempted }}/{{ exam.totalStudents }}</div>
                        <div class="text-xs text-gray-600">Attempted</div>
                      </div>
                      <div>
                        <div class="text-xl font-bold text-green-600">{{ exam.studentsPassed }}</div>
                        <div class="text-xs text-gray-600">Passed</div>
                      </div>
                      <div>
                        <div class="text-xl font-bold text-red-600">{{ exam.studentsFailed }}</div>
                        <div class="text-xs text-gray-600">Failed</div>
                      </div>
                      <div>
                        <div class="text-xl font-bold">{{ exam.averageScore.toFixed(1) }}</div>
                        <div class="text-xs text-gray-600">Avg Score</div>
                      </div>
                      <div>
                        <div class="text-xl font-bold">{{ exam.passPercentage.toFixed(0) }}%</div>
                        <div class="text-xs text-gray-600">Pass Rate</div>
                      </div>
                    </div>
                    @if (exam.studentsAttempted > 0) {
                      <div class="mt-3 flex justify-between text-sm text-gray-600">
                        <span>Highest: {{ exam.highestScore }}</span>
                        <span>Lowest: {{ exam.lowestScore }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div>
            <h3 class="text-xl font-semibold text-navy-900 mb-4">Student Performance</h3>
            @if (statistics.studentPerformances.length === 0) {
              <p class="text-gray-600">No students enrolled yet.</p>
            } @else {
              <div class="mb-4">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="filterStudents()"
                  placeholder="Search by student name or email..."
                  class="w-full px-4 py-2 border rounded-lg">
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-navy-900 text-white">
                    <tr>
                      <th class="px-4 py-3 text-left">Student Name</th>
                      <th class="px-4 py-3 text-left">Email</th>
                      <th class="px-4 py-3 text-center">Exams Attempted</th>
                      <th class="px-4 py-3 text-center">Exams Passed</th>
                      <th class="px-4 py-3 text-center">Average Score</th>
                      <th class="px-4 py-3 text-center">Overall %</th>
                      <th class="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (student of filteredStudents; track student.studentId) {
                      <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-3">{{ student.studentName }}</td>
                        <td class="px-4 py-3">{{ student.studentEmail }}</td>
                        <td class="px-4 py-3 text-center">{{ student.totalExamsAttempted }}</td>
                        <td class="px-4 py-3 text-center">
                          <span [class.text-green-600]="student.totalExamsPassed > 0">
                            {{ student.totalExamsPassed }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-center">{{ student.averageScore.toFixed(1) }}</td>
                        <td class="px-4 py-3 text-center">
                          <span [class.text-green-600]="student.overallPercentage >= 50"
                                [class.text-red-600]="student.overallPercentage < 50"
                                class="font-semibold">
                            {{ student.overallPercentage.toFixed(1) }}%
                          </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <button
                            (click)="toggleStudentDetails(student.studentId)"
                            class="text-blue-600 hover:text-blue-800 text-sm">
                            @if (expandedStudent === student.studentId) {
                              Hide Details
                            } @else {
                              View Details
                            }
                          </button>
                        </td>
                      </tr>
                      @if (expandedStudent === student.studentId) {
                        <tr>
                          <td colspan="7" class="px-4 py-3 bg-gray-50">
                            <div class="p-4">
                              <h5 class="font-semibold mb-2">Exam History</h5>
                              @if (student.examResults.length === 0) {
                                <p class="text-gray-600">No exam attempts yet.</p>
                              } @else {
                                <div class="grid gap-2">
                                  @for (result of student.examResults; track result.examId) {
                                    <div class="flex justify-between items-center p-2 bg-white rounded border">
                                      <div>
                                        <span class="font-medium">{{ result.examTitle }}</span>
                                        <span class="text-gray-600 text-sm ml-2">
                                          ({{ formatDate(result.submittedAt) }})
                                        </span>
                                      </div>
                                      <div class="flex items-center gap-4">
                                        <span>{{ result.obtainedMarks }}/{{ result.totalMarks }}</span>
                                        <span [class.text-green-600]="result.isPassed"
                                              [class.text-red-600]="!result.isPassed"
                                              class="font-semibold">
                                          {{ result.percentage.toFixed(1) }}%
                                        </span>
                                        @if (result.isPassed) {
                                          <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Passed</span>
                                        } @else {
                                          <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Failed</span>
                                        }
                                      </div>
                                    </div>
                                  }
                                </div>
                              }
                            </div>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
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
export class CourseStatisticsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);

  courseId = 0;
  statistics: CourseStatistics | null = null;
  loading = false;
  searchTerm = '';
  filteredStudents: StudentPerformance[] = [];
  expandedStudent: number | null = null;

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (this.courseId) {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.loading = true;
    this.examService.getCourseStatistics(this.courseId).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.filteredStudents = stats.studentPerformances;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      }
    });
  }

  filterStudents() {
    if (!this.statistics) return;

    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.statistics.studentPerformances.filter(s =>
      s.studentName.toLowerCase().includes(term) ||
      s.studentEmail.toLowerCase().includes(term)
    );
  }

  toggleStudentDetails(studentId: number) {
    this.expandedStudent = this.expandedStudent === studentId ? null : studentId;
  }

  viewExamResults(examId: number) {
    this.router.navigate(['/teacher/exam-results', examId], {
      queryParams: { courseId: this.courseId }
    });
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  goBack() {
    this.router.navigate(['/teacher-dashboard']);
  }
}