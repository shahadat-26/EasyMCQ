import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { CreateExamDto, CreateQuestionDto } from '../../models/exam.model';

@Component({
  selector: 'app-create-exam-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="examForm" (ngSubmit)="createExam()">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
          <input formControlName="title" type="text"
                 class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea formControlName="description" rows="2"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input formControlName="scheduledStartTime" type="datetime-local"
                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input formControlName="scheduledEndTime" type="datetime-local"
                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input formControlName="durationInMinutes" type="number"
                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
            <input formControlName="passingMarks" type="number"
                   class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Questions</h3>
            <button type="button" (click)="addQuestion()"
                    class="bg-navy-600 hover:bg-navy-700 text-white px-3 py-1 rounded text-sm">
              Add Question
            </button>
          </div>

          <div class="space-y-4">
            @for (question of questions.controls; track $index; let i = $index) {
              <div class="border rounded-lg p-4" [formGroup]="getQuestionGroup(i)">
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-medium">Question {{ i + 1 }}</h4>
                  <button type="button" (click)="removeQuestion(i)"
                          class="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>

                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea formControlName="text" rows="2"
                            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
                </div>

                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                  <input formControlName="marks" type="number"
                         class="w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
                </div>

                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div formArrayName="options" class="space-y-2">
                    @for (option of getOptions(i).controls; track $index; let j = $index) {
                      <div class="flex items-center space-x-2" [formGroup]="getOptionGroup(i, j)">
                        <span class="text-sm font-medium">{{ j + 1 }}.</span>
                        <input formControlName="text" type="text" placeholder="Option text"
                               class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500">
                        <label class="flex items-center">
                          <input formControlName="isCorrect" type="checkbox"
                                 class="mr-2 text-navy-600 focus:ring-navy-500">
                          <span class="text-sm">Correct</span>
                        </label>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <button type="button" (click)="cancelled.emit()"
                  class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" [disabled]="examForm.invalid || isSubmitting"
                  class="px-4 py-2 bg-navy-600 text-white rounded hover:bg-navy-700 disabled:opacity-50">
            {{ isSubmitting ? 'Creating...' : 'Create Exam' }}
          </button>
        </div>
      </div>
    </form>
  `
})
export class CreateExamFormComponent {
  @Input() courseId!: number;
  @Output() examCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private examService = inject(ExamService);

  examForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      scheduledStartTime: ['', Validators.required],
      scheduledEndTime: ['', Validators.required],
      durationInMinutes: [60, [Validators.required, Validators.min(1)]],
      passingMarks: [40, [Validators.required, Validators.min(0)]],
      questions: this.fb.array([])
    });

    this.addQuestion();
  }

  get questions() {
    return this.examForm.get('questions') as FormArray;
  }

  getQuestionGroup(index: number): FormGroup {
    return this.questions.at(index) as FormGroup;
  }

  getOptions(questionIndex: number): FormArray {
    return this.getQuestionGroup(questionIndex).get('options') as FormArray;
  }

  getOptionGroup(questionIndex: number, optionIndex: number): FormGroup {
    return this.getOptions(questionIndex).at(optionIndex) as FormGroup;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      marks: [1, [Validators.required, Validators.min(1)]],
      options: this.fb.array([
        this.createOption(),
        this.createOption(),
        this.createOption(),
        this.createOption()
      ])
    });

    this.questions.push(questionGroup);
  }

  createOption() {
    return this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  createExam() {
    if (this.examForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.examForm.value;

    const examDto: CreateExamDto = {
      ...formValue,
      courseId: this.courseId,
      scheduledStartTime: formValue.scheduledStartTime,
      scheduledEndTime: formValue.scheduledEndTime
    };

    this.examService.createExam(examDto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.examCreated.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to create exam', err);
      }
    });
  }
}