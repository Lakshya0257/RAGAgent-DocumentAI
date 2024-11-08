import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Credentials {

    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({default: false})
    isVerified : boolean

    @Column()
    confirmationToken: string;

    @CreateDateColumn()
    date_created: Date;

}