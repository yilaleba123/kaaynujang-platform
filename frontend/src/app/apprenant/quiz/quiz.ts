import { Component, inject, signal } from '@angular/core';
import { LearnerApiService, LearnerQuiz, LearnerQuizDetail } from '../../api/learner-api-service';

@Component({
  imports: [],
  selector: 'app-quiz',
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class Quiz {
  private readonly api = inject(LearnerApiService);

  protected readonly quizzes = signal<LearnerQuiz[]>([]);
  protected readonly selectedQuiz = signal<LearnerQuizDetail | null>(null);
  protected readonly answers = signal<number[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly result = signal<number | null>(null);

  constructor() {
    this.api.getQuizzes().subscribe({
      next: quizzes => {
        this.quizzes.set(quizzes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Les évaluations n’ont pas pu être chargées.');
        this.loading.set(false);
      },
    });
  }

  protected selectQuiz(quiz: LearnerQuiz): void {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    this.api.getQuiz(quiz.id).subscribe({
      next: detail => {
        this.selectedQuiz.set(detail);
        this.answers.set(detail.questions.map(() => -1));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Cette évaluation n’est pas accessible.');
        this.loading.set(false);
      },
    });
  }

  protected selectAnswer(questionIndex: number, answerIndex: number): void {
    this.answers.update(values => values.map((value, index) => index === questionIndex ? answerIndex : value));
  }

  protected submit(): void {
    const quiz = this.selectedQuiz();
    if (!quiz || this.saving()) return;
    if (this.answers().some(answer => answer < 0)) {
      this.error.set('Répondez à toutes les questions avant de valider.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.api.submitQuiz(quiz.id, this.answers()).subscribe({
      next: result => {
        this.result.set(result.grade);
        this.saving.set(false);
        this.quizzes.update(items => items.map(item => item.id === quiz.id ? { ...item, attempted: true } : item));
      },
      error: () => {
        this.error.set('La remise de votre évaluation a échoué.');
        this.saving.set(false);
      },
    });
  }

  protected backToList(): void {
    this.selectedQuiz.set(null);
    this.result.set(null);
    this.error.set(null);
  }
}
