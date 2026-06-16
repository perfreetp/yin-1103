export type UserRole = 'teacher' | 'intern' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export type CaseDifficulty = 'easy' | 'medium' | 'hard';
export type CaseStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface Case {
  id: string;
  anonymousCode: string;
  diagnosis: string;
  difficultyLevel: CaseDifficulty;
  ageGroup: string;
  treatmentType: string;
  status: CaseStatus;
  description: string;
  createdAt: string;
  teacherId: string;
  teacherName: string;
  phases: TreatmentPhase[];
  followUpRecords: FollowUpRecord[];
  photos: CasePhoto[];
  studentCount: number;
}

export interface TreatmentPhase {
  id: string;
  caseId: string;
  name: string;
  order: number;
  description: string;
  duration: string;
  tasks: Task[];
}

export type TaskType = 'initial_assessment' | 'stage_judgment' | 'treatment_suggestion' | 'followup_decision';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  phaseId: string;
  title: string;
  type: TaskType;
  description: string;
  requirements: string;
  deadline: string;
  status: TaskStatus;
}

export type SubmissionStatus = 'submitted' | 'reviewed' | 'needs_revision' | 'pending';

export interface TaskSubmission {
  id: string;
  taskId: string;
  caseId: string;
  studentId: string;
  studentName: string;
  content: string;
  judgmentBasis: string;
  status: SubmissionStatus;
  submittedAt: string;
  annotations: Annotation[];
  score?: number;
}

export type DeviationType = 'diagnosis' | 'treatment_plan' | 'timing' | 'method' | 'other';

export interface Annotation {
  id: string;
  submissionId: string;
  teacherId: string;
  teacherName: string;
  content: string;
  deviationType: DeviationType;
  severity: 1 | 2 | 3;
  createdAt: string;
}

export interface FollowUpRecord {
  id: string;
  caseId: string;
  date: string;
  visitNumber: number;
  description: string;
  findings: string;
  nextPlan: string;
  photoIds: string[];
}

export type PhotoType = 'intraoral' | 'extraoral' | 'xray' | 'model' | 'others';

export interface CasePhoto {
  id: string;
  caseId: string;
  type: PhotoType;
  url: string;
  thumbnail: string;
  focusPoints: string;
  description: string;
  uploadedAt: string;
}

export interface StudentAssessment {
  studentId: string;
  studentName: string;
  avatar: string;
  totalCases: number;
  completedCases: number;
  completionRate: number;
  averageScore: number;
  exerciseCount: number;
  exerciseAccuracy: number;
  rank: number;
}

export interface AbnormalCaseExercise {
  id: string;
  title: string;
  description: string;
  scenario: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: CaseDifficulty;
  category: string;
}

export interface DiscussionOutline {
  id: string;
  caseId: string;
  caseName: string;
  title: string;
  sections: OutlineSection[];
  generatedAt: string;
  taskId?: string;
  taskName?: string;
}

export interface OutlineSection {
  title: string;
  points: string[];
}

export interface ExcellentCase {
  id: string;
  caseId: string;
  caseName: string;
  diagnosis: string;
  reason: string;
  tags: string[];
  archivedAt: string;
  difficultyLevel: CaseDifficulty;
  taskId?: string;
  taskName?: string;
}

export interface ArchiveDocument {
  id: string;
  title: string;
  type: 'outline' | 'excellent_case' | 'reference' | 'template';
  category: string;
  description: string;
  createdAt: string;
  author: string;
  caseId?: string;
  caseName?: string;
  taskId?: string;
  taskName?: string;
}
