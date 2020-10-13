import { PrimaryGeneratedColumn, OneToOne, JoinColumn, Column, Entity, getRepository } from "typeorm";

@Entity()
export class Factory {
    @PrimaryGeneratedColumn()
    public id: number;
    @Column()
    public employeesCount: number;
    @Column()
    public salary: number;
    @Column()
    public RecipeId : number;
}

export const FactoryRepository = getRepository(Factory);
