import { Entity, PrimaryGeneratedColumn, Column, TableInheritance } from 'typeorm';
import { UserRole } from './dto/user-role.enum.js';

@Entity('users')
@TableInheritance({ column: { type: 'enum', enum: UserRole, name: 'role' } })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'varchar', length: 255, nullable: false})
    name: string;

    @Column({type:'varchar', length: 255, nullable: false})
    surname: string;

    @Column({type:'varchar', length:320, nullable: false, unique: true})
    email: string;

    @Column()
    passwordHash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    
}

