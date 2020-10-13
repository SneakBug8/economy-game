import { Good } from "./Good";
import { Market } from "./Market";
import { Connection } from "DB";

export class Production {
    public id: number;
    public amount: number;
    public minprice: number;
    public Good: Good;
    public Market: Market;
}

export const ProductionRepository = Connection("Productions");