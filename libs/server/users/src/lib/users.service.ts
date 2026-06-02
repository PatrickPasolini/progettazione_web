import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from './dto/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerUsersService {

    // Injecting the repository
    constructor(private readonly usersRepository: UsersRepository){}

    async seed() {
        try {
            const adminD = this.usersRepository.createOne({
                name: 'Diego',
                surname: 'Pioli',
                email: 'diego.pioli@unibs.it',
                password: 'Password1!',
                role: UserRole.ADMIN
            }, await bcrypt.hash('Password1!', 10));

            const adminP = this.usersRepository.createOne({
                name: 'Patrick',
                surname: 'Pasolini',
                email: 'patrick.pasolini@unibs.it',
                password: 'Password1!',
                role: UserRole.ADMIN
            }, await bcrypt.hash('Password1!', 10));

            const adminL = this.usersRepository.createOne({
                name: 'Luca',
                surname: 'Martinelli',
                email: 'luca.martinelli@unibs.it',
                password: 'Password1!',
                role: UserRole.ADMIN
            }, await bcrypt.hash('Password1!', 10));

            const secretary1 = this.usersRepository.createOne({
                name: 'Anna',
                surname: 'Bianchi',
                email: 'anna.bianchi@unibs.it',
                password: 'Password1!',
                role: UserRole.SECRETARY
            }, await bcrypt.hash('Password1!', 10));

            const secretary2 = this.usersRepository.createOne({
                name: 'Marco',
                surname: 'Rossi',
                email: 'marco.rossi@unibs.it',
                password: 'Password1!',
                role: UserRole.SECRETARY
            }, await bcrypt.hash('Password1!', 10));
        }
        catch (error) {
            console.error('Error seeding users:', error);
            throw new Error('Failed to seed users');
        }
    }

    async findByEmail(email: string): Promise<UserEntity> {
        const user = await this.usersRepository.findByEmail(email);

        if(!user) throw new NotFoundException("User with email ${email} not found");

        return user;
    }

    async getOneUser(id: number): Promise<UserEntity> {
        const user = await this.usersRepository.findById(id);

        if(!user) throw new NotFoundException("User with id ${id} not found");

        return user;
    }

    async getUsers(role?: UserRole): Promise<UserEntity[]> {
        const users = await this.usersRepository.findAll(role);
        
        if(role && users.length===0)
        {
            throw new NotFoundException(`No users found with role ${role}`);
        }
        return users;
    }

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const existing = dto.email
            ? await this.usersRepository.findByEmail(dto.email)
            : null;

        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.usersRepository.createOne(dto, passwordHash);
    }

    async updatePassword(id: number, newPassword: string): Promise<void> {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.updatePassword(id, passwordHash);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        if (dto.email) {
            const existing = await this.usersRepository.findByEmail(dto.email);
            if (existing && existing.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        const updated = await this.usersRepository.updateOne(id, dto);
        if (!updated) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        return updated;
    }

    async removeUser(id: number): Promise<void> {
        const deleted = await this.usersRepository.deleteOne(id);
        if (!deleted) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
