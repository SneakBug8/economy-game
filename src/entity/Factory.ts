import { Connection } from "DB";

export class Factory {
    public id: number;
    public employeesCount: number;
    public salary: number;
    public RecipeId: number;
}

export const FactoryRepository = Connection("Factories");