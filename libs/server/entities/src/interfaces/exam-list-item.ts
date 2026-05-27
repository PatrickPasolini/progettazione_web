import { DegreeType, DegreeYear } from '../entities/dto/degree.enum.js';
import { UserRole } from '@server/users';

export interface ExamListItem {
    id: number;
    examDate: Date;
    startTime: Date;
    endTime: Date;
    course: {
        id: number;
        courseName: string;
    };
    session: {
        id: number;
        startDate: Date;
        endDate: Date;
        startInsertDate: Date;
        endInsertDate: Date;
    };
    teacher: {
        id: number;
        name: string;
        surname: string;
        email: string;
        role: UserRole;
    };
    degree: {
        id: number;
        degreeName: string;
        degreeType: DegreeType;
        degreeYear: DegreeYear;
    };
}
