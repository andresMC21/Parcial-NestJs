import { Student } from "src/student/entities/student.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Campus {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'text',
        unique: true
    })
    name: string;

    @Column({
        type: 'text'
    })
    city: string;

    @Column({
        type: 'int'
    })
    capacity: number;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    createdBy: User;

    @OneToMany(() => Student, (student) => student.campusId)
    students?: Student[]
}
