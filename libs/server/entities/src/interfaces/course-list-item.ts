import { DegreeType, DegreeYear, MacroArea } from '../entities/dto/degree.enum.js';
import { UserRole } from '@server/users';

export interface CourseListItem {
    id: number;
    courseName: string;
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
        macroArea: MacroArea;
    };
}
