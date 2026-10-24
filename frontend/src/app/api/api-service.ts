import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AppNotification, PasswordPayload, ProfilePayload, TeacherProfile,
  Category, Conversation, Course, CourseDetail, CoursePayload, CourseStatus, DashboardStats,
  DocumentItem, GradePayload, Learner, Message, PendingAssessment, Quiz, QuizDetail, QuizPayload,
  Submission, SubmissionDetail, SubmissionStatus, Teacher, TeacherStats,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/formateur`;

  /* profile + dashboard */
  getMe(): Observable<Teacher> { return this.http.get<Teacher>(`${this.base}/me/`); }
  getDashboardStats(): Observable<DashboardStats> { return this.http.get<DashboardStats>(`${this.base}/dashboard/stats/`); }
  getPendingAssessments(limit?: number): Observable<PendingAssessment[]> {
    return this.http.get<PendingAssessment[]>(`${this.base}/submissions/pending/`, { params: this.p({ limit }) });
  }

  /* courses */
  getCourses(o: { search?: string; status?: CourseStatus; limit?: number } = {}): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/courses/`, { params: this.p(o) });
  }
  getCourse(id: string): Observable<CourseDetail> { return this.http.get<CourseDetail>(`${this.base}/courses/${id}/`); }
  createCourse(b: CoursePayload): Observable<Course> { return this.http.post<Course>(`${this.base}/courses/`, b); }
  updateCourse(id: string, b: CoursePayload): Observable<Course> { return this.http.put<Course>(`${this.base}/courses/${id}/`, b); }
  archiveCourse(id: string): Observable<Course> { return this.http.patch<Course>(`${this.base}/courses/${id}/archive/`, {}); }
  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.base}/categories/`); }

  /* quizzes */
  getQuizzes(): Observable<Quiz[]> { return this.http.get<Quiz[]>(`${this.base}/quizzes/`); }
  getQuiz(id: string): Observable<QuizDetail> { return this.http.get<QuizDetail>(`${this.base}/quizzes/${id}/`); }
  createQuiz(b: QuizPayload): Observable<Quiz> { return this.http.post<Quiz>(`${this.base}/quizzes/`, b); }
  updateQuiz(id: string, b: QuizPayload): Observable<Quiz> { return this.http.put<Quiz>(`${this.base}/quizzes/${id}/`, b); }
  deleteQuiz(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/quizzes/${id}/`); }

  /* submissions */
  getSubmissions(status?: SubmissionStatus): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.base}/submissions/`, { params: this.p({ status }) });
  }
  getSubmission(id: string): Observable<SubmissionDetail> { return this.http.get<SubmissionDetail>(`${this.base}/submissions/${id}/`); }
  gradeSubmission(id: string, b: GradePayload): Observable<Submission> {
    return this.http.post<Submission>(`${this.base}/submissions/${id}/grade/`, b);
  }

  /* documents */
  getDocuments(): Observable<DocumentItem[]> { return this.http.get<DocumentItem[]>(`${this.base}/documents/`); }
  uploadDocument(file: File, courseId?: string): Observable<DocumentItem> {
    const fd = new FormData();
    fd.append('file', file);
    if (courseId) fd.append('courseId', courseId);
    return this.http.post<DocumentItem>(`${this.base}/documents/`, fd);
  }
  deleteDocument(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/documents/${id}/`); }

  /* learners + stats */
  getLearners(): Observable<Learner[]> { return this.http.get<Learner[]>(`${this.base}/learners/`); }
  getStats(): Observable<TeacherStats> { return this.http.get<TeacherStats>(`${this.base}/stats/`); }

  /* messaging */
  getConversations(): Observable<Conversation[]> { return this.http.get<Conversation[]>(`${this.base}/conversations/`); }
  getMessages(id: string): Observable<Message[]> { return this.http.get<Message[]>(`${this.base}/conversations/${id}/messages/`); }
  sendMessage(id: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.base}/conversations/${id}/messages/`, { content });
  }

  /* profile */
  getProfile(): Observable<TeacherProfile> { return this.http.get<TeacherProfile>(`${this.base}/profile/`); }
  updateProfile(b: ProfilePayload): Observable<TeacherProfile> { return this.http.put<TeacherProfile>(`${this.base}/profile/`, b); }
  changePassword(b: PasswordPayload): Observable<void> { return this.http.post<void>(`${this.base}/profile/password/`, b); }

  /* notifications */
  getNotifications(): Observable<AppNotification[]> { return this.http.get<AppNotification[]>(`${this.base}/notifications/`); }
  markNotificationRead(id: string): Observable<void> { return this.http.patch<void>(`${this.base}/notifications/${id}/read/`, {}); }
  markAllNotificationsRead(): Observable<void> { return this.http.post<void>(`${this.base}/notifications/read-all/`, {}); }

  private p(o: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== '') params = params.set(k, v);
    return params;
  }
}