export type CourseStatus = 'published' | 'draft' | 'archived';

export interface Teacher { id: string; firstName: string; lastName: string; }
export interface Category { id: string; name: string; }

export interface DashboardStats {
  publishedCourses: number;
  draftCourses: number;
  enrolledLearners: number;
  pendingSubmissions: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  learnersCount: number;
  status: CourseStatus;
  updatedAt: string; // ISO date
}

export interface PendingAssessment {
  id: string;
  title: string;
  courseTitle: string;
  submissionsCount: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseTitle: string;
  questionsCount: number;
  updatedAt: string;
}

export const STATUS_LABEL: Record<CourseStatus, string> = {
  published: 'publié',
  draft: 'brouillon',
  archived: 'archivé',
};

export const STATUS_CLASS: Record<CourseStatus, string> = {
  published: 'bg-green-50 text-green-700 border-green-200',
  draft: 'bg-orange-50 text-orange-600 border-orange-300',
  archived: 'bg-slate-100 text-slate-600 border-slate-300',
};

/* ---------- Course builder ---------- */
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'text' | 'pdf';

export interface Lesson { title: string; type: LessonType; contentUrl: string; }
export interface CourseModule { title: string; lessons: Lesson[]; }

export interface CourseDetail {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  level: Level;
  status: CourseStatus;
  modules: CourseModule[];
}
export type CoursePayload = Omit<CourseDetail, 'id' | 'status'> & { status: 'draft' | 'published' };

/* ---------- Quiz ---------- */
export interface QuizQuestion { text: string; options: string[]; correctIndex: number; }
export interface QuizDetail {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}
export type QuizPayload = Omit<QuizDetail, 'id'>;

/* ---------- Submissions ---------- */
export type SubmissionStatus = 'pending' | 'graded';
export interface Submission {
  id: string;
  learnerName: string;
  assessmentTitle: string;
  courseTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade: number | null;
}
export interface SubmissionDetail extends Submission {
  maxGrade: number;
  textContent: string | null;
  fileUrl: string | null;
  comment: string | null;
}
export interface GradePayload { grade: number; comment: string; }

/* ---------- Documents / learners / stats / messages ---------- */
export interface DocumentItem {
  id: string;
  name: string;
  sizeBytes: number;
  courseTitle: string | null;
  uploadedAt: string;
  url: string;
}

export interface Learner {
  id: string;
  fullName: string;
  email: string;
  courseTitle: string;
  progress: number; // 0-100
  lastActivityAt: string;
}

export interface CourseStat { courseTitle: string; learners: number; completionRate: number; averageGrade: number; }
export interface TeacherStats {
  learners: number;
  completionRate: number;
  averageGrade: number;
  courses: CourseStat[];
}

export interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
export interface Message { id: string; fromMe: boolean; content: string; sentAt: string; }

/* ---------- Auth / profile / notifications ---------- */
export interface AuthResponse { token: string; }

export interface TeacherProfile extends Teacher {
  email: string;
  phone: string | null;
  bio: string | null;
}
export interface ProfilePayload { firstName: string; lastName: string; phone: string; bio: string; }
export interface PasswordPayload { currentPassword: string; newPassword: string; }

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link: string | null; // ex: '/formateur/copies/12'
}