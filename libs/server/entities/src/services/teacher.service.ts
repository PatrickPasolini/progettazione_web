import { Injectable, NotFoundException } from '@nestjs/common';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { UserRole } from '@server/users';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerTeacherService {
    constructor(private readonly teacherRepository: TeacherRepository) {}

    findAll(): Promise<TeacherEntity[]> {
        return this.teacherRepository.findAll();
    }

    async findOne(id: number): Promise<TeacherEntity> {
        const teacher = await this.teacherRepository.findById(id);
        if (!teacher) throw new NotFoundException(`Teacher with id ${id} not found`);
        return teacher;
    }

    async seed(): Promise<void> {
        const teachers = [
            { name: 'Mario',  surname: 'Rossi',   email: 'mario.rossi@unibs.it',   password: 'Teacher1!' },
            { name: 'Giulia', surname: 'Bianchi', email: 'giulia.bianchi@unibs.it', password: 'Teacher2!' },
            { name: 'Andrea', surname: 'Verdi',   email: 'andrea.verdi@unibs.it',   password: 'Teacher3!' },
        ];

        for (const t of teachers) {
            const exists = await this.teacherRepository.findByEmail(t.email);
            if (exists) continue;

            const teacher = this.teacherRepository.create({
                name: t.name,
                surname: t.surname,
                email: t.email,
                passwordHash: await bcrypt.hash(t.password, 10),
                role: UserRole.TEACHER,
            });
            await this.teacherRepository.save(teacher);
        }
    }
}
