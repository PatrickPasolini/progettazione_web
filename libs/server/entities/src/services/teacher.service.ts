import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { CreateTeacherDto } from '../entities/dto/create-teacher.dto.js';
import { UpdateTeacherDto } from '../entities/dto/update-teacher.dto.js';
import { UserRole } from '@server/users';
import { TeacherListItem } from '../interfaces/teacher-list-item.js';
import { seedTeachers } from '../assets/courses-data.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerTeacherService {
    constructor(private readonly teacherRepository: TeacherRepository) {}

    async findAll(): Promise<TeacherListItem[]> {
        const teachers = await this.teacherRepository.findAll();
        return teachers.map(t => this.toListItem(t));
    }

    async findOne(id: number): Promise<TeacherListItem> {
        const teacher = await this.teacherRepository.findById(id);
        if (!teacher) throw new NotFoundException(`Teacher with id ${id} not found`);
        return this.toListItem(teacher);
    }

    async create(dto: CreateTeacherDto): Promise<TeacherListItem> {
        const exists = await this.teacherRepository.findByEmail(dto.email);
        if (exists) throw new ConflictException(`Teacher with email ${dto.email} already exists`);

        const teacher = this.teacherRepository.create({
            name: dto.name,
            surname: dto.surname,
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, 10),
            role: UserRole.TEACHER,
        });
        return this.toListItem(await this.teacherRepository.save(teacher));
    }

    async update(id: number, dto: UpdateTeacherDto): Promise<TeacherListItem> {
        const teacher = await this.teacherRepository.findById(id);
        if (!teacher) throw new NotFoundException(`Teacher with id ${id} not found`);

        if (dto.email && dto.email !== teacher.email) {
            const conflict = await this.teacherRepository.findByEmail(dto.email);
            if (conflict) throw new ConflictException(`Email ${dto.email} is already in use`);
            teacher.email = dto.email;
        }
        if (dto.name) teacher.name = dto.name;
        if (dto.surname) teacher.surname = dto.surname;
        if (dto.password) teacher.passwordHash = await bcrypt.hash(dto.password, 10);

        return this.toListItem(await this.teacherRepository.save(teacher));
    }

    private toListItem(teacher: TeacherEntity): TeacherListItem {
        return {
            id: teacher.id,
            name: teacher.name,
            surname: teacher.surname,
            email: teacher.email,
            role: teacher.role,
        };
    }

    async remove(id: number): Promise<void> {
        const teacher = await this.teacherRepository.findById(id);
        if (!teacher) throw new NotFoundException(`Teacher with id ${id} not found`);
        await this.teacherRepository.delete(id);
    }

    async seed(): Promise<void> {
        // Tutti i docenti seedati nascono con la stessa password standard e con
        // mustChangePassword=true: al primo login verrà richiesto di cambiarla
        // (stessa convenzione di UsersRepository.createOne per TEACHER/SECRETARY).
        // Reset: svuota i docenti (e course/exam dipendenti) per un seed pulito.
        await this.teacherRepository.clearTeachers();

        const passwordHash = await bcrypt.hash('Password1!', 10);
        // Dedup contro TUTTE le email utente (admin/secretary inclusi): users.email
        // è unique cross-ruolo. Un docente con email già usata da un admin verrebbe
        // saltato invece di far fallire l'INSERT (violazione unique).
        const existing = new Set(await this.teacherRepository.findAllUserEmails());

        for (const t of seedTeachers) {
            if (existing.has(t.email)) continue;
            existing.add(t.email);

            const teacher = this.teacherRepository.create({
                name: t.name,
                surname: t.surname,
                email: t.email,
                passwordHash,
                role: UserRole.TEACHER,
                mustChangePassword: true,
            });
            await this.teacherRepository.save(teacher);
        }
    }
}
