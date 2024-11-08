import { AbstractEntity } from "src/helper/abstract";
import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserStorage extends AbstractEntity<UserStorage> {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    fileUrl: string;

    @Column()
    status: string;

    @CreateDateColumn()
    createdDate: Date;

    @Column()
    filename: string;

    @Column()
    filetype: string;
}