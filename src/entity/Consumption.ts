import { Market } from "./Market";
import { Good } from "./Good";

export class Consumption {
    public id: number;
    public Market: Market;
    public Good: Good;
    public amount: number;
    public maxprice: number;
}

export const ConsumptionRepository = Connection("Consumptions");
