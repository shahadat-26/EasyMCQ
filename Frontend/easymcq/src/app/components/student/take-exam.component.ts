import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { ExamDetails, Question, SubmitAnswerDto, SubmitExamDto } from '../../models/exam.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="bg-navy-900 text-white p-4">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">{{ exam?.title }}</h1>
            <p class="text-sm mt-1">{{ exam?.description }}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold">Time Remaining: {{ formatTime(remainingTime) }}</p>
            <p class="text-sm">Question {{ currentQuestionIndex + 1 }} of {{ exam?.questions?.length || 0 }}</p>
          </div>
        </div>
      </div>

      @if (exam) {
        <div class="max-w-6xl mx-auto p-6">
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="mb-4">
              <h2 class="text-xl font-semibold mb-2">
                Question {{ currentQuestionIndex + 1 }}
                <span class="text-sm font-normal text-gray-600 ml-2">({{ currentQuestion?.marks }} marks)</span>
              </h2>
              <p class="text-lg">{{ currentQuestion?.text }}</p>
            </div>

            <div class="space-y-3">
              @for (option of currentQuestion?.options; track option.id) {
                <label class="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                       [class.border-navy-500]="selectedAnswers.get(currentQuestion!.id) === option.id"
                       [class.bg-navy-50]="selectedAnswers.get(currentQuestion!.id) === option.id">
                  <input type="radio"
                         [name]="'question_' + currentQuestion?.id"
                         [checked]="selectedAnswers.get(currentQuestion!.id) === option.id"
                         (change)="selectOption(option.id)"
                         class="mt-1 mr-3">
                  <span>{{ option.text }}</span>
                </label>
              }
            </div>
          </div>

          <div class="flex justify-between items-center mb-6">
            <button (click)="previousQuestion()"
                    [disabled]="currentQuestionIndex === 0"
                    class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>

            <div class="flex space-x-2">
              @for (question of exam.questions; track question.id; let i = $index) {
                <button (click)="goToQuestion(i)"
                        class="w-10 h-10 rounded border-2"
                        [class.bg-navy-600]="i === currentQuestionIndex"
                        [class.text-white]="i === currentQuestionIndex"
                        [class.border-navy-600]="i === currentQuestionIndex"
                        [class.bg-green-100]="isQuestionAnswered(question.id)"
                        [class.border-green-500]="isQuestionAnswered(question.id) && i !== currentQuestionIndex">
                  {{ i + 1 }}
                </button>
              }
            </div>

            @if (currentQuestionIndex < exam.questions.length - 1) {
              <button (click)="nextQuestion()"
                      class="px-6 py-2 bg-navy-600 text-white rounded hover:bg-navy-700">
                Next
              </button>
            } @else {
              <button (click)="submitExam()"
                      class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Submit Exam
              </button>
            }
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 class="font-semibold text-yellow-800 mb-2">Summary</h3>
            <p class="text-sm text-yellow-700">
              Answered: {{ selectedAnswers.size }} / {{ exam.questions.length }} questions
            </p>
          </div>
        </div>
      }

      @if (showConfirmSubmit) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md">
            <h3 class="text-xl font-bold mb-4">Submit Exam?</h3>
            <p class="mb-4">
              You have answered {{ selectedAnswers.size }} out of {{ exam?.questions?.length || 0 }} questions.
              Are you sure you want to submit?
            </p>
            <div class="flex justify-end space-x-3">
              <button (click)="showConfirmSubmit = false"
                      class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Cancel
              </button>
              <button (click)="confirmSubmit()"
                      class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TakeExamComponent implements OnInit, OnDestroy {
  private examService = inject(ExamService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  exam: ExamDetails | null = null;
  currentQuestionIndex = 0;
  currentQuestion: Question | null = null;
  selectedAnswers = new Map<number, number>();
  remainingTime = 0;
  timerSubscription?: Subscription;
  showConfirmSubmit = false;
  examId!: number;

  ngOnInit() {
    this.examId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadExam();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  loadExam() {
    this.examService.getExamDetails(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        if (exam.questions.length > 0) {
          this.currentQuestion = exam.questions[0];
        }
        this.remainingTime = exam.durationInMinutes * 60;
        this.startTimer();
      },
      error: () => {
        this.router.navigate(['/student/dashboard']);
      }
    });
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.autoSubmit();
      }
    });
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  selectOption(optionId: number) {
    if (this.currentQuestion) {
      this.selectedAnswers.set(this.currentQuestion.id, optionId);
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.exam!.questions[this.currentQuestionIndex];
    }
  }

  nextQuestion() {
    if (this.exam && this.currentQuestionIndex < this.exam.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.exam.questions[this.currentQuestionIndex];
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
    this.currentQuestion = this.exam!.questions[index];
  }

  isQuestionAnswered(questionId: number): boolean {
    return this.selectedAnswers.has(questionId);
  }

  submitExam() {
    this.showConfirmSubmit = true;
  }

  confirmSubmit() {
    const answers: SubmitAnswerDto[] = [];
    this.exam?.questions.forEach(question => {
      answers.push({
        questionId: question.id,
        selectedOptionId: this.selectedAnswers.get(question.id) || null
      });
    });

    const submitData: SubmitExamDto = { answers };

    this.examService.submitExam(this.examId, submitData).subscribe({
      next: (result) => {
        this.router.navigate(['/exam-result', this.examId]);
      },
      error: () => {
        alert('Failed to submit exam. Please try again.');
      }
    });
  }

  autoSubmit() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.confirmSubmit();
  }
}