import type { User } from '../types';

export const users: User[] = [
  {
    id: 'teacher-1',
    name: '张明教授',
    role: 'teacher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
    department: '口腔正畸教研室',
  },
  {
    id: 'teacher-2',
    name: '李华主任医师',
    role: 'teacher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
    department: '口腔正畸教研室',
  },
  {
    id: 'intern-1',
    name: '王医生',
    role: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=intern1',
    department: '口腔正畸科',
  },
  {
    id: 'intern-2',
    name: '陈医生',
    role: 'intern',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=intern2',
    department: '口腔正畸科',
  },
  {
    id: 'student-1',
    name: '刘小明',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    department: '口腔医学院 2021级',
  },
  {
    id: 'student-2',
    name: '赵小红',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2',
    department: '口腔医学院 2021级',
  },
  {
    id: 'student-3',
    name: '孙小强',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3',
    department: '口腔医学院 2022级',
  },
  {
    id: 'student-4',
    name: '周小美',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student4',
    department: '口腔医学院 2021级',
  },
];

export const getCurrentTeacher = () => users.find(u => u.role === 'teacher')!;
export const getCurrentStudent = () => users.find(u => u.role === 'student')!;
export const getCurrentIntern = () => users.find(u => u.role === 'intern')!;
