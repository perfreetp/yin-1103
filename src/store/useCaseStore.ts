import { create } from 'zustand';
import type { Case, TaskSubmission, CaseDifficulty, CaseStatus, TreatmentPhase, DiscussionOutline, ExcellentCase, ArchiveDocument } from '../types';
import { cases as initialCases, taskSubmissions as initialSubmissions } from '../data/cases';
import { discussionOutlines as initialOutlines, excellentCases as initialExcellent, archiveDocuments as initialDocs } from '../data/assessment';

const STORAGE_KEY = 'ortho-teaching-store';

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

// 从 localStorage 加载数据
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`, e);
  }
  return fallback;
}

// 保存到 localStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
}

interface CaseState {
  // 病例相关
  cases: Case[];
  originalCases: Case[];
  currentCase: Case | null;
  
  // 提交相关
  submissions: TaskSubmission[];
  
  // 归档资料
  discussionOutlines: DiscussionOutline[];
  excellentCases: ExcellentCase[];
  archiveDocuments: ArchiveDocument[];
  
  // UI状态
  isLoading: boolean;
  filters: {
    difficulty?: CaseDifficulty;
    status?: CaseStatus;
    treatmentType?: string;
    search?: string;
  };
  
  // 方法
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
  
  // 归档资料方法
  addArchiveDocument: (doc: {
    title: string;
    type: 'outline' | 'excellent_case' | 'reference' | 'template';
    category: string;
    description: string;
    author: string;
    caseId?: string;
    taskId?: string;
  }) => void;
  
  // 数据重置（用于演示）
  resetAllData: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  // 初始化：从 localStorage 加载，没有则用默认数据
  cases: loadFromStorage('cases', initialCases),
  originalCases: loadFromStorage('originalCases', initialCases),
  currentCase: null,
  submissions: loadFromStorage('submissions', initialSubmissions),
  discussionOutlines: loadFromStorage('discussionOutlines', initialOutlines),
  excellentCases: loadFromStorage('excellentCases', initialExcellent),
  archiveDocuments: loadFromStorage('archiveDocuments', initialDocs),
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
    const originalCases = get().originalCases;
    set({ 
      cases: originalCases, 
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
    const newSubmissions = [...get().submissions, newSubmission];
    set({ submissions: newSubmissions });
    saveToStorage('submissions', newSubmissions);
  },

  addAnnotation: (submissionId, data, teacherId, teacherName) => {
    const newSubmissions = get().submissions.map(sub => {
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
    });
    set({ submissions: newSubmissions });
    saveToStorage('submissions', newSubmissions);
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
    const newOriginalCases = [newCase, ...get().originalCases];
    const newCases = [newCase, ...get().cases];
    
    set({
      originalCases: newOriginalCases,
      cases: newCases,
    });
    
    saveToStorage('originalCases', newOriginalCases);
    saveToStorage('cases', newCases);
  },

  addArchiveDocument: (doc) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 根据类型添加到对应的集合
    if (doc.type === 'excellent_case') {
      const newExcellent: ExcellentCase = {
        id: `excellent-${Date.now()}`,
        caseId: doc.caseId || '',
        caseName: doc.title,
        diagnosis: doc.category,
        reason: doc.description,
        tags: [doc.category],
        archivedAt: today,
        difficultyLevel: 'medium',
      };
      const newExcellentCases = [...get().excellentCases, newExcellent];
      set({ excellentCases: newExcellentCases });
      saveToStorage('excellentCases', newExcellentCases);
    } else if (doc.type === 'outline') {
      const newOutline: DiscussionOutline = {
        id: `outline-${Date.now()}`,
        caseId: doc.caseId || '',
        caseName: doc.title,
        title: doc.title,
        generatedAt: today,
        sections: [
          { title: '一、病例特点分析', points: ['待补充'] },
          { title: '二、诊断与鉴别诊断', points: ['待补充'] },
          { title: '三、治疗方案讨论', points: ['待补充'] },
        ],
      };
      const newOutlines = [...get().discussionOutlines, newOutline];
      set({ discussionOutlines: newOutlines });
      saveToStorage('discussionOutlines', newOutlines);
    } else {
      const newDoc: ArchiveDocument = {
        id: `doc-${Date.now()}`,
        title: doc.title,
        type: doc.type,
        category: doc.category,
        description: doc.description,
        createdAt: today,
        author: doc.author,
      };
      const newDocs = [...get().archiveDocuments, newDoc];
      set({ archiveDocuments: newDocs });
      saveToStorage('archiveDocuments', newDocs);
    }
  },

  resetAllData: () => {
    set({
      cases: initialCases,
      originalCases: initialCases,
      submissions: initialSubmissions,
      discussionOutlines: initialOutlines,
      excellentCases: initialExcellent,
      archiveDocuments: initialDocs,
    });
    saveToStorage('cases', initialCases);
    saveToStorage('originalCases', initialCases);
    saveToStorage('submissions', initialSubmissions);
    saveToStorage('discussionOutlines', initialOutlines);
    saveToStorage('excellentCases', initialExcellent);
    saveToStorage('archiveDocuments', initialDocs);
  },
}));
