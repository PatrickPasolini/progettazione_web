export interface Degree {
  id: number;
  degreeName: string;
  degreeType: 'LT' | 'LM' | 'LMCU';
  degreeYear: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';
}

export interface Teacher {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

export interface Course {
  id: number;
  courseName: string;
  teacher: Teacher;
  degrees: Degree[];
}

export interface Session {
  id: number;
  startDate: string;
  endDate: string;
  startInsertDate: string;
  endInsertDate: string;
  degrees: Degree[];
}

export interface Exam {
  id: number;
  examDate: string;
  startTime: string;
  endTime: string;
  course: Course;
  session: Session;
  teacher: Teacher;
  degree: Degree;
}

export interface CurrentUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TEACHER' | 'SECRETARY';
}
