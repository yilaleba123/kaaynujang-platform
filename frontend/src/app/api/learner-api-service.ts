import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CoursCatalogue } from '../apprenant/cours.data';

export interface LearnerProgress {
  courseId: number;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  updatedAt: string;
}

export interface LearnerQuiz {
  id: string;
  title: string;
  courseTitle: string;
  durationMinutes: number;
  questionsCount: number;
  attempted: boolean;
}

export interface LearnerQuizDetail extends LearnerQuiz {
  questions: { id: number; text: string; options: string[] }[];
}

export interface LearnerResult {
  id: string;
  quizTitle: string;
  courseTitle: string;
  grade: number | null;
  maxGrade: number;
  submittedAt: string;
  comment: string | null;
}

export interface LearnerCertificate {
  id: string;
  courseTitle: string;
  issuedAt: string;
}

export interface LearnerNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link: string | null;
}

export interface LearnerProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'APPRENANT';
  phone?: string;
  bio?: string;
}

export interface LearnerProfilePayload {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
}

export interface LearnerDiscussionComment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface LearnerDiscussionPost {
  id: number;
  courseId: number;
  courseTitle: string;
  author: string;
  content: string;
  createdAt: string;
  comments: LearnerDiscussionComment[];
}

@Injectable({ providedIn: 'root' })
export class LearnerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/apprenant`;

  getCatalogue(search = ''): Observable<CoursCatalogue[]> {
    const params = search ? { search } : undefined;
    return this.http.get<CoursCatalogue[]>(`${this.base}/catalogue/`, { params });
  }

  getProfile(): Observable<LearnerProfile> {
    return this.http.get<LearnerProfile>(`${this.base}/profile/`);
  }

  updateProfile(payload: LearnerProfilePayload): Observable<LearnerProfile> {
    return this.http.put<LearnerProfile>(`${this.base}/profile/`, payload);
  }

  getMyCourses(): Observable<CoursCatalogue[]> {
    return this.http.get<CoursCatalogue[]>(`${this.base}/courses/`);
  }

  getCourse(id: number): Observable<CoursCatalogue> {
    return this.http.get<CoursCatalogue>(`${this.base}/courses/${id}/`);
  }

  enroll(id: number): Observable<{ courseId: number; enrolled: boolean; enrolledAt: string }> {
    return this.http.post<{ courseId: number; enrolled: boolean; enrolledAt: string }>(
      `${this.base}/courses/${id}/enroll/`,
      {},
    );
  }

  getProgress(): Observable<LearnerProgress[]> {
    return this.http.get<LearnerProgress[]>(`${this.base}/progress/`);
  }

  getResults(): Observable<LearnerResult[]> {
    return this.http.get<LearnerResult[]>(`${this.base}/results/`);
  }

  getCertificates(): Observable<LearnerCertificate[]> {
    return this.http.get<LearnerCertificate[]>(`${this.base}/certificates/`);
  }

  getNotifications(): Observable<LearnerNotification[]> {
    return this.http.get<LearnerNotification[]>(`${this.base}/notifications/`);
  }

  markNotificationRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/notifications/${id}/read/`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/notifications/read-all/`, {});
  }

  completeLesson(lessonId: number): Observable<{ lessonId: number; completed: boolean }> {
    return this.http.post<{ lessonId: number; completed: boolean }>(
      `${this.base}/lessons/${lessonId}/complete/`,
      {},
    );
  }

  getQuizzes(): Observable<LearnerQuiz[]> {
    return this.http.get<LearnerQuiz[]>(`${this.base}/quizzes/`);
  }

  getQuiz(id: string): Observable<LearnerQuizDetail> {
    return this.http.get<LearnerQuizDetail>(`${this.base}/quizzes/${id}/`);
  }

  submitQuiz(id: string, answers: number[]): Observable<{ id: string; grade: number; maxGrade: number }> {
    return this.http.post<{ id: string; grade: number; maxGrade: number }>(
      `${this.base}/quizzes/${id}/`,
      { answers },
    );
  }

  getDiscussionPosts(courseId?: number): Observable<LearnerDiscussionPost[]> {
    const params = courseId ? { courseId: String(courseId) } : undefined;
    return this.http.get<LearnerDiscussionPost[]>(`${this.base}/forum/posts/`, { params });
  }

  createDiscussionPost(courseId: number, content: string): Observable<LearnerDiscussionPost> {
    return this.http.post<LearnerDiscussionPost>(`${this.base}/forum/posts/`, { courseId, content });
  }

  addDiscussionComment(postId: number, content: string): Observable<LearnerDiscussionComment> {
    return this.http.post<LearnerDiscussionComment>(
      `${this.base}/forum/posts/${postId}/comments/`,
      { content },
    );
  }
}
