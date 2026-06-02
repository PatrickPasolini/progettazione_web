import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TeacherEntity } from '../entities/teacher.entity.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { CreateTeacherDto } from '../entities/dto/create-teacher.dto.js';
import { UpdateTeacherDto } from '../entities/dto/update-teacher.dto.js';
import { UserRole } from '@server/users';
import { TeacherListItem } from '../interfaces/teacher-list-item.js';
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
        const teachers = [
            { name: 'Luca',  surname: 'Giuzzi',   email: 'luca.giuzzi@unibs.it',   password: 'Teacher1!' },
            { name: 'Paola', surname: 'Gervasio', email: 'paola.gervasio@unibs.it', password: 'Teacher2!' },
            { name: 'Alessandro', surname: 'Saetti',   email: 'alessandro.saetti@unibs.it',   password: 'Teacher3!' },
            { name: 'Maria', surname: 'Rossi',    email: 'maria.rossi@unibs.it',    password: 'Teacher4!' },
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
