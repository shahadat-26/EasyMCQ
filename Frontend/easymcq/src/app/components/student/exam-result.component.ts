import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { ExamResult } from '../../models/exam.model';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-navy-900 text-white p-6">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-3xl font-bold">Exam Results</h1>
        </div>
      </div>

      @if (result) {
        <div class="max-w-6xl mx-auto p-6">
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold mb-4">{{ result.examTitle }}</h2>
              <div class="flex justify-center items-center space-x-8">
                <div>
                  <p class="text-4xl font-bold"
                     [class.text-green-600]="result.isPassed"
                     [class.text-red-600]="!result.isPassed">
                    {{ result.obtainedMarks }} / {{ result.totalMarks }}
                  </p>
                  <p class="text-lg mt-2"
                     [class.text-green-600]="result.isPassed"
                     [class.text-red-600]="!result.isPassed">
                    {{ result.isPassed ? 'PASSED' : 'FAILED' }}
                  </p>
                </div>
                <div class="text-left">
                  <p class="text-gray-600">Passing Marks: {{ result.passingMarks }}</p>
                  <p class="text-gray-600">Percentage: {{ getPercentage() }}%</p>
                  <p class="text-gray-600">Submitted: {{ result.submittedAt | date:'short' }}</p>
                </div>
              </div>
            </div>

            <div class="border-t pt-6">
              <h3 class="text-xl font-semibold mb-4">Question-wise Results</h3>
              <div class="space-y-4">
                @for (question of result.questionResults; track question.questionId; let i = $index) {
                  <div class="border rounded-lg p-4"
                       [class.bg-green-50]="question.isCorrect"
                       [class.bg-red-50]="!question.isCorrect">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-semibold">
                        Question {{ i + 1 }}
                        <span class="ml-2 text-sm font-normal">
                          ({{ question.obtainedMarks }}/{{ question.marks }} marks)
                        </span>
                      </h4>
                      <span class="px-2 py-1 text-xs rounded"
                            [class.bg-green-600]="question.isCorrect"
                            [class.bg-red-600]="!question.isCorrect"
                            [class.text-white]="true">
                        {{ question.isCorrect ? 'Correct' : 'Wrong' }}
                      </span>
                    </div>
                    <p class="mb-3">{{ question.questionText }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p class="font-semibold text-gray-600">Your Answer:</p>
                        <p [class.text-red-600]="!question.isCorrect">
                          {{ question.selectedAnswer || 'Not Answered' }}
                        </p>
                      </div>
                      <div>
                        <p class="font-semibold text-gray-600">Correct Answer:</p>
                        <p class="text-green-600">{{ question.correctAnswer }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="mt-6 flex justify-center">
              <a routerLink="/student/dashboard"
                 class="px-6 py-2 bg-navy-600 text-white rounded hover:bg-navy-700">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      } @else {
        <div class="max-w-6xl mx-auto p-6">
          <div class="bg-white rounded-lg shadow-lg p-12 text-center">
            <p class="text-gray-500">Loading results...</p>
          </div>
        </div>
      }
    </div>
  `
})
export class ExamResultComponent implements OnInit {
  private examService = inject(ExamService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  result: ExamResult | null = null;

  ngOnInit() {
    const examId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadResult(examId);
  }

  loadResult(examId: number) {
    this.examService.getExamResult(examId).subscribe({
      next: (result) => this.result = result,
      error: () => {
        this.router.navigate(['/student/dashboard']);
      }
    });
  }

  getPercentage(): string {
    if (!this.result) return '0';
    return ((this.result.obtainedMarks / this.result.totalMarks) * 100).toFixed(2);
  }
}