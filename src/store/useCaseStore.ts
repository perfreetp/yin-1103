import { create } from 'zustand';
import type { Case, TaskSubmission, CaseDifficulty, CaseStatus, TreatmentPhase } from '../types';
import { cases as initialCases, taskSubmissions as initialSubmissions } from '../data/cases';

function createDefaultPhases(caseId: string): TreatmentPhase[] {
  return [
    {
      id: `${caseId}-phase-1`,
      caseId,
      name: '初诊评估阶段',
      order: 1,
      description: '全面的口腔检查与诊断分析，制定初步治疗方案',
      duration: '2周',
      tasks: [
        {
          id: `${caseId}-task-1`,
          phaseId: `${caseId}-phase-1`,
          title: '初诊资料分析与诊断',
          type: 'initial_assessment',
          description: '根据提供的口内照片、X光片和模型资料，进行全面的诊断分析',
          requirements: '请提交：1. 主要问题列表 2. 安氏分类诊断 3. 骨面型分析 4. 治疗方案初步设想',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'in_progress',
        },
      ],
    },
    {
      id: `${caseId}-phase-2`,
      caseId,
      name: '第一期治疗：排齐整平',
      order: 2,
      description: '使用固定矫治器进行牙列排齐和牙弓整平',
      duration: '6-8个月',
      tasks: [
        {
          id: `${caseId}-task-2`,
          phaseId: `${caseId}-phase-2`,
          title: '矫治器选择与粘接方案',
          type: 'treatment_suggestion',
          description: '制定托槽粘接方案，选择合适的矫治器系统',
          requirements: '请说明托槽系统选择理由、粘接顺序及注意事项',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
        },
      ],
    },
  ];
}

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
  originalCases: Case[];
  fetchCases: (filters?: Partial<CaseState['filters']>) => void;
  fetchCaseDetail: (id: string) => void;
  setCurrentCase: (caseData: Case | null) => void;
  submitTask: (taskId: string, data: { content: string; judgmentBasis: string }, studentId: string, studentName: string, caseId: string) => void;
  addAnnotation: (submissionId: string, data: { content: string; deviationType: string; severity: number }, teacherId: string, teacherName: string) => void;
  addCase: (caseData: {
    anonymousCode: string;
    diagnosis: string;
    difficultyLevel: CaseDifficulty;
    ageGroup: string;
    treatmentType: string;
    status: CaseStatus;
    description: string;
    teacherName: string;
  }) => void;
  resetFilters: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: initialCases,
  originalCases: initialCases,
  currentCase: null,
  submissions: initialSubmissions,
  isLoading: false,
  filters: {},

  fetchCases: (filters) => {
    set({ isLoading: true });
    const mergedFilters = { ...get().filters, ...filters };
    let filtered = [...get().originalCases];
    
    if (mergedFilters.difficulty) {
      filtered = filtered.filter(c => c.difficultyLevel === mergedFilters.difficulty);
    }
    if (mergedFilters.status) {
      filtered = filtered.filter(c => c.status === mergedFilters.status);
    }
    if (mergedFilters.treatmentType) {
      filtered = filtered.filter(c => c.treatmentType === mergedFilters.treatmentType);
    }
    if (mergedFilters.search) {
      const search = mergedFilters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.anonymousCode.toLowerCase().includes(search) ||
        c.diagnosis.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }
    
    set({ cases: filtered, isLoading: false, filters: mergedFilters });
  },

  resetFilters: () => {
    set({ 
      cases: get().originalCases, 
      filters: {}, 
      isLoading: false 
    });
  },

  fetchCaseDetail: (id: string) => {
    const caseData = get().originalCases.find(c => c.id === id);
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

  addCase: (caseData) => {
    const newId = `case-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newCase: Case = {
      id: newId,
      anonymousCode: caseData.anonymousCode,
      diagnosis: caseData.diagnosis,
      difficultyLevel: caseData.difficultyLevel,
      ageGroup: caseData.ageGroup,
      treatmentType: caseData.treatmentType,
      status: caseData.status,
      description: caseData.description,
      createdAt: today,
      teacherId: 'teacher-1',
      teacherName: caseData.teacherName,
      studentCount: 0,
      phases: createDefaultPhases(newId),
      followUpRecords: [
        {
          id: `${newId}-fu-1`,
          caseId: newId,
          date: today,
          visitNumber: 1,
          description: '初诊检查',
          findings: '待补充',
          nextPlan: '完善各项检查资料，制定治疗方案',
          photoIds: [],
        },
      ],
      photos: [],
    };
    set(state => ({
      originalCases: [newCase, ...state.originalCases],
      cases: [newCase, ...state.cases],
    }));
  },
}));
