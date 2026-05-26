import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CourseEntity } from '../entities/course.entity.js';
import { DegreeEntity } from '../entities/degree.entity.js';

@Injectable()
export class CourseRepository {
    constructor(
        @InjectRepository(CourseEntity)
        private readonly repo: Repository<CourseEntity>,
    ) {}

    findAll(teacherId?: number): Promise<CourseEntity[]> {
        if (teacherId) {
            return this.repo.find({
                where: { teacher: { id: teacherId } },
                order: { id: 'ASC' },
            });
        }
        return this.repo.find({ order: { id: 'ASC' } });
    }

    findById(id: number): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findByIdWithRelations(id: number): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { id }, relations: ['teacher', 'degrees'] });
    }

    async findDegreesByTeacher(teacherId: number): Promise<DegreeEntity[]> {
        const courses = await this.repo.find({
            where: { teacher: { id: teacherId } },
            relations: ['degrees'],
        });
        const map = new Map<number, DegreeEntity>();
        for (const course of courses) {
            for (const degree of course.degrees) {
                map.set(degree.id, degree);
            }
        }
        return [...map.values()];
    }

    findByName(courseName: string): Promise<CourseEntity | null> {
        return this.repo.findOne({ where: { courseName } });
    }

    create(data: Partial<CourseEntity>): CourseEntity {
        return this.repo.create(data);
    }

    save(course: CourseEntity): Promise<CourseEntity> {
        return this.repo.save(course);
    }

    delete(id: number): Promise<DeleteResult> {
        return this.repo.delete(id);
    }
}
