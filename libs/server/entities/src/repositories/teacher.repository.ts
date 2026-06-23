import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { UserRole } from '@server/users';

@Injectable()
export class TeacherRepository {
    constructor(
        @InjectRepository(TeacherEntity)
        private readonly repo: Repository<TeacherEntity>,
    ) {}

    findAll(): Promise<TeacherEntity[]> {
        return this.repo.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<TeacherEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findByEmail(email: string): Promise<TeacherEntity | null> {
        return this.repo.findOne({ where: { email } });
    }

    // Email di TUTTI gli utenti (admin/secretary/teacher): la colonna users.email è
    // unique cross-ruolo, quindi il seed deve evitare collisioni con qualsiasi utente.
    async findAllUserEmails(): Promise<string[]> {
        const rows: { email: string }[] = await this.repo.query('SELECT email FROM "users"');
        return rows.map((r) => r.email);
    }

    create(data: Partial<TeacherEntity>): TeacherEntity {
        return this.repo.create(data);
    }

    save(teacher: TeacherEntity): Promise<TeacherEntity> {
        return this.repo.save(teacher);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }

    // Svuota i soli docenti. course/exam referenziano teacher (RESTRICT): prima va
    // pulita la tabella course (CASCADE pulisce anche exam), poi si eliminano le
    // righe con role=TEACHER. NON si tocca 'users' interamente: admin/secretary restano.
    async clearTeachers(): Promise<void> {
        await this.repo.query('TRUNCATE TABLE "course" RESTART IDENTITY CASCADE');
        await this.repo.delete({ role: UserRole.TEACHER });
    }
}
