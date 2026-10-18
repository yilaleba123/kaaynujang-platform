import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../api/api-service';
import { Quiz as QuizItem } from '../../api/models';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-quiz',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './quiz.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quiz {
  private readonly api = inject(ApiService);
  readonly quizzes = signal<QuizItem[] | null>(null);
  readonly error = signal(false);

  constructor() {
    this.api.getQuizzes().subscribe({ next: q => this.quizzes.set(q), error: () => this.error.set(true) });
  }

  remove(q: QuizItem) {
    if (!confirm(`Supprimer le quiz « ${q.title} » ?`)) return;
    this.api.deleteQuiz(q.id).subscribe(() => this.quizzes.update(l => l?.filter(x => x.id !== q.id) ?? null));
  }
}