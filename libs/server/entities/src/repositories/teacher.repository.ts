import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { TeacherEntity } from '../entities/teacher.entity.js';

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

    create(data: Partial<TeacherEntity>): TeacherEntity {
        return this.repo.create(data);
    }

    save(teacher: TeacherEntity): Promise<TeacherEntity> {
        return this.repo.save(teacher);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }
}
