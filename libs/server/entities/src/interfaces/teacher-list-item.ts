import { UserRole } from '@server/users';

export interface TeacherListItem {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: UserRole;
}
