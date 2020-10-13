import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm";

@Entity()
export class Turn
{
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public datetime: Date;
    @Column()
    public totalcash: number;
    @Column()
    public cashperplayer: number;
    @Column()
    public freecash: number;

}

export const TurnRepository = getRepository(Turn);
