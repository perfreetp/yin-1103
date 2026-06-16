import { create } from 'zustand';
import type { Case, TaskSubmission, CaseDifficulty, CaseStatus } from '../types';
import { cases, taskSubmissions, getCaseById } from '../data/cases';

interface CaseState {
  cases: Case[];
  currentCase: Case | null;
  submissions: TaskSubmission[];
  isLoading: boolean;
  filters: {
    difficulty?: CaseDifficulty;
    status?: CaseStatus;
    treatmentType?: string;
    search?: string;
  };
  fetchCases: (filters?: Partial<CaseState['filters']>) => void;
  fetchCaseDetail: (id: string) => void;
  setCurrentCase: (caseData: Case | null) => void;
  submitTask: (taskId: string, data: { content: string; judgmentBasis: string }, studentId: string, studentName: string, caseId: string) => void;
  addAnnotation: (submissionId: string, data: { content: string; deviationType: string; severity: number }, teacherId: string, teacherName: string) => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: cases,
  currentCase: null,
  submissions: taskSubmissions,
  isLoading: false,
  filters: {},

  fetchCases: (filters) => {
    set({ isLoading: true });
    let filtered = [...cases];
    
    if (filters?.difficulty) {
      filtered = filtered.filter(c => c.difficultyLevel === filters.difficulty);
    }
    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.anonymousCode.toLowerCase().includes(search) ||
        c.diagnosis.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }
    
    set({ cases: filtered, isLoading: false, filters: { ...get().filters, ...filters } });
  },

  fetchCaseDetail: (id: string) => {
    const caseData = getCaseById(id);
    set({ currentCase: caseData || null });
  },

  setCurrentCase: (caseData) => {
    set({ currentCase: caseData });
  },

  submitTask: (taskId, data, studentId, studentName, caseId) => {
    const newSubmission: TaskSubmission = {
      id: `submission-${Date.now()}`,
      taskId,
      caseId,
      studentId,
      studentName,
      content: data.content,
      judgmentBasis: data.judgmentBasis,
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
      annotations: [],
    };
    set(state => ({
      submissions: [...state.submissions, newSubmission],
    }));
  },

  addAnnotation: (submissionId, data, teacherId, teacherName) => {
    set(state => ({
      submissions: state.submissions.map(sub => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status: 'reviewed' as const,
            annotations: [
              ...sub.annotations,
              {
                id: `anno-${Date.now()}`,
                submissionId,
                teacherId,
                teacherName,
                content: data.content,
                deviationType: data.deviationType as any,
                severity: data.severity as 1 | 2 | 3,
                createdAt: new Date().toISOString().split('T')[0],
              },
            ],
          };
        }
        return sub;
      }),
    }));
  },
}));
