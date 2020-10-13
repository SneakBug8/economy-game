import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm";

@Entity()
export class Good
{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;

    @Column()
    image: string;
}

export const GoodRepository = getRepository(Good);
