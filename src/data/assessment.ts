import type { StudentAssessment, AbnormalCaseExercise, ExcellentCase, DiscussionOutline, ArchiveDocument } from '../types';

export const studentAssessments: StudentAssessment[] = [
  {
    studentId: 'student-1',
    studentName: '刘小明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    totalCases: 8,
    completedCases: 6,
    completionRate: 75,
    averageScore: 82,
    exerciseCount: 24,
    exerciseAccuracy: 78,
    rank: 2,
  },
  {
    studentId: 'student-2',
    studentName: '赵小红',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2',
    totalCases: 10,
    completedCases: 9,
    completionRate: 90,
    averageScore: 88,
    exerciseCount: 32,
    exerciseAccuracy: 85,
    rank: 1,
  },
  {
    studentId: 'student-3',
    studentName: '孙小强',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3',
    totalCases: 6,
    completedCases: 3,
    completionRate: 50,
    averageScore: 72,
    exerciseCount: 15,
    exerciseAccuracy: 65,
    rank: 5,
  },
  {
    studentId: 'student-4',
    studentName: '周小美',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student4',
    totalCases: 8,
    completedCases: 7,
    completionRate: 87.5,
    averageScore: 85,
    exerciseCount: 28,
    exerciseAccuracy: 82,
    rank: 3,
  },
];

export const abnormalCaseExercises: AbnormalCaseExercise[] = [
  {
    id: 'exercise-1',
    title: '托槽脱落的应急处理',
    description: '患者在正畸治疗过程中出现托槽脱落，应如何处理？',
    scenario: '患者，女，14岁，固定矫治治疗3个月。今日复诊前2天自觉右下后牙区有异物感，检查发现右下第一磨牙颊面管脱落。',
    options: [
      '立即重新粘接，不做特殊处理',
      '检查脱落原因，清洁牙面后重新粘接，必要时调整咬合',
      '待下次复诊时处理，期间无需在意',
      '直接拔除该牙',
    ],
    correctAnswer: 1,
    explanation: '托槽脱落时，应首先检查脱落原因（如咬合创伤、粘接不当等），然后清洁牙面，重新粘接。如果存在咬合干扰，需要进行调颌处理。',
    difficulty: 'easy',
    category: '应急处理',
  },
  {
    id: 'exercise-2',
    title: '牙根吸收的识别与处理',
    description: '正畸治疗中发现牙根吸收，应如何判断严重程度及处理？',
    scenario: '患者治疗6个月后拍摄根尖片，发现上颌中切牙牙根出现轻度吸收，约占根长的1/5。患者无自觉症状，牙髓活力正常。',
    options: [
      '立即停止所有正畸力，终止治疗',
      '属于正常生理范围，继续治疗但减轻力量，定期观察',
      '加大牵引力加速治疗，尽快结束',
      '拔除患牙后种植修复',
    ],
    correctAnswer: 1,
    explanation: '轻度牙根吸收（小于根长1/4）在正畸治疗中较常见，一般无临床症状。应减轻正畸力，定期拍摄X线片观察，避免进一步加重。',
    difficulty: 'medium',
    category: '并发症处理',
  },
  {
    id: 'exercise-3',
    title: '牙周炎患者的正畸治疗',
    description: '伴有牙周炎的患者进行正畸治疗，需要注意哪些问题？',
    scenario: '患者，男，35岁，主诉牙列不齐要求矫治。口腔检查发现全口牙石（++），牙龈红肿，探诊出血，牙周袋深度3-5mm。',
    options: [
      '直接开始正畸治疗，牙周问题后续处理',
      '先进行牙周基础治疗，炎症控制后再开始正畸',
      '只做隐形矫治，不做固定矫治',
      '牙周炎患者不能做正畸治疗',
    ],
    correctAnswer: 1,
    explanation: '牙周炎患者必须在牙周炎症得到控制后才能开始正畸治疗。正畸治疗过程中也需要定期进行牙周维护，加强口腔卫生指导。',
    difficulty: 'hard',
    category: '全身因素',
  },
  {
    id: 'exercise-4',
    title: '疼痛与不适的处理',
    description: '患者加力后出现牙齿疼痛，应如何处理？',
    scenario: '患者复诊加力后第2天出现全口牙齿酸痛，不敢咬硬物，影响进食。',
    options: [
      '立即回院紧急处理',
      '属于正常反应，一般3-7天可自行缓解，可服用止痛药',
      '说明矫治力过大，需要立刻减小力量',
      '需要进行根管治疗',
    ],
    correctAnswer: 1,
    explanation: '正畸加力后出现轻度疼痛和酸胀是正常反应，通常在加力后24-48小时最明显，3-7天逐渐缓解。可服用非甾体类抗炎药缓解症状。',
    difficulty: 'easy',
    category: '常见问题',
  },
  {
    id: 'exercise-5',
    title: '支抗丧失的判断与应对',
    description: '如何判断支抗丧失？出现支抗丧失应如何处理？',
    scenario: '患者拔牙矫治，间隙关闭过程中发现后牙前移明显，前牙内收量不足。磨牙关系由I类变为远中关系。',
    options: [
      '继续关闭间隙，不做处理',
      '暂停间隙关闭，采取加强支抗措施（如种植支抗、横腭杆等）',
      '加大前牙牵引力',
      '减少拔牙数量',
    ],
    correctAnswer: 1,
    explanation: '支抗丧失表现为后牙前移、磨牙关系远中化。需要及时采取加强支抗的措施，如使用种植体支抗、横腭杆、Nance弓等，必要时暂停间隙关闭。',
    difficulty: 'medium',
    category: '生物力学',
  },
];

export const excellentCases: ExcellentCase[] = [
  {
    id: 'excellent-1',
    caseId: 'case-003',
    caseName: '牙列拥挤非拔牙矫治病例',
    diagnosis: '安氏I类，牙列拥挤',
    reason: '治疗前后对比明显，牙列排齐效果好，咬合关系稳定，适合作为入门教学病例',
    tags: ['入门案例', '非拔牙', '固定矫治', '青少年'],
    archivedAt: '2024-03-15',
    difficultyLevel: 'easy',
  },
  {
    id: 'excellent-2',
    caseId: 'case-001',
    caseName: '安氏II类上颌前突拔牙矫治',
    diagnosis: '安氏II类一分类，骨性II类',
    reason: '典型的安氏II类病例，治疗方案设计合理，侧貌改善明显，适合中高级教学',
    tags: ['经典案例', '拔牙矫治', '安氏II类', '侧貌改善'],
    archivedAt: '2024-04-10',
    difficultyLevel: 'medium',
  },
];

export const discussionOutlines: DiscussionOutline[] = [
  {
    id: 'outline-1',
    caseId: 'case-001',
    caseName: 'CASE-A-2024-001 安氏II类错颌',
    title: '安氏II类错颌畸形病例讨论提纲',
    generatedAt: '2024-02-20',
    sections: [
      {
        title: '一、病例特点分析',
        points: [
          '患者基本情况及主诉分析',
          '主要临床表现总结',
          '阳性体征与阴性体征',
        ],
      },
      {
        title: '二、诊断与鉴别诊断',
        points: [
          '安氏分类诊断依据',
          '骨性分类与头影测量分析',
          '需要与哪些疾病鉴别？',
        ],
      },
      {
        title: '三、治疗方案讨论',
        points: [
          '拔牙 vs 非拔牙的选择依据',
          '矫治器类型的选择',
          '治疗时机的考虑',
        ],
      },
      {
        title: '四、治疗过程中的关键点',
        points: [
          '支抗设计与控制',
          '前牙转矩控制',
          '咬合调整要点',
        ],
      },
      {
        title: '五、风险与预后',
        points: [
          '可能的并发症及预防',
          '保持方案设计',
          '长期稳定性评估',
        ],
      },
    ],
  },
  {
    id: 'outline-2',
    caseId: 'case-002',
    caseName: 'CASE-A-2024-002 前牙反颌',
    title: '替牙期前牙反颌早期矫治讨论提纲',
    generatedAt: '2024-03-01',
    sections: [
      {
        title: '一、早期矫治的意义',
        points: [
          '为什么要进行早期矫治？',
          '早期矫治的最佳时机',
          '不治疗的可能后果',
        ],
      },
      {
        title: '二、功能矫治器的应用',
        points: [
          '功能矫治器的作用机制',
          '适应症与禁忌症',
          '各类功能矫治器的特点',
        ],
      },
      {
        title: '三、前方牵引治疗要点',
        points: [
          '前方牵引的适应症',
          '牵引力量与方向',
          '疗效评估标准',
        ],
      },
    ],
  },
];

export const archiveDocuments: ArchiveDocument[] = [
  {
    id: 'doc-1',
    title: '正畸头影测量常用标志点',
    type: 'reference',
    category: '参考资料',
    description: '详细列出头影测量分析中常用的软硬组织标志点及其定位方法',
    createdAt: '2024-01-10',
    author: '张明教授',
  },
  {
    id: 'doc-2',
    title: '直丝弓矫治技术操作规范',
    type: 'template',
    category: '技术规范',
    description: '直丝弓矫治器的粘接、弓丝更换、加力等操作的标准流程',
    createdAt: '2024-02-15',
    author: '李华主任医师',
  },
  {
    id: 'doc-3',
    title: '正畸病历书写模板',
    type: 'template',
    category: '文书模板',
    description: '初诊记录、复诊记录、治疗总结等各类医疗文书的标准模板',
    createdAt: '2024-03-01',
    author: '教学教研室',
  },
  {
    id: 'doc-4',
    title: '常见并发症处理手册',
    type: 'reference',
    category: '参考资料',
    description: '正畸治疗中常见并发症的识别、预防和处理方法汇总',
    createdAt: '2024-03-20',
    author: '张明教授',
  },
];
