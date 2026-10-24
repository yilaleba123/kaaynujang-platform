import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LearnerApiService,
  LearnerDiscussionPost,
} from '../../api/learner-api-service';
import { CoursCatalogue } from '../cours.data';

@Component({
  imports: [DatePipe, FormsModule],
  selector: 'app-forum',
  styleUrl: './forum.css',
  templateUrl: './forum.html',
})
export class Forum {
  private readonly api = inject(LearnerApiService);

  protected readonly courses = signal<CoursCatalogue[]>([]);
  protected readonly posts = signal<LearnerDiscussionPost[]>([]);
  protected readonly selectedCourseId = signal<number | null>(null);
  protected readonly draft = signal('');
  protected readonly replyDraft = signal('');
  protected readonly replyingTo = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.api.getMyCourses().subscribe({
      next: courses => {
        this.courses.set(courses);
        const courseId = courses[0]?.id ?? null;
        this.selectedCourseId.set(courseId);
        this.loading.set(false);
        if (courseId !== null) this.loadPosts(courseId);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Vos cours ne peuvent pas être chargés.');
      },
    });
  }

  protected selectCourse(courseId: string): void {
    const id = Number(courseId);
    if (!Number.isInteger(id) || id < 1) return;
    this.selectedCourseId.set(id);
    this.loadPosts(id);
  }

  protected onCourseChange(event: Event): void {
    this.selectCourse((event.target as HTMLSelectElement).value);
  }

  protected publish(): void {
    const courseId = this.selectedCourseId();
    const content = this.draft().trim();
    if (courseId === null || !content || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.createDiscussionPost(courseId, content).subscribe({
      next: post => {
        this.posts.update(posts => [post, ...posts]);
        this.draft.set('');
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Votre message n’a pas pu être publié.');
        this.saving.set(false);
      },
    });
  }

  protected reply(post: LearnerDiscussionPost): void {
    const content = this.replyDraft().trim();
    if (!content || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.addDiscussionComment(post.id, content).subscribe({
      next: comment => {
        this.posts.update(posts => posts.map(item =>
          item.id === post.id ? { ...item, comments: [...item.comments, comment] } : item,
        ));
        this.replyDraft.set('');
        this.replyingTo.set(null);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Votre réponse n’a pas pu être publiée.');
        this.saving.set(false);
      },
    });
  }

  private loadPosts(courseId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDiscussionPosts(courseId).subscribe({
      next: posts => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Les discussions de ce cours ne peuvent pas être chargées.');
      },
    });
  }
}
