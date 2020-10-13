import { PopBehaviour } from "./popbehaviour";
import { ProvincialEntity } from "../provinces/ProvincialEntity";
import { CashPile } from "old/CashPile";
import { GoodsInventory } from "old/goods/GoodsInventory";
import { BasicNeeds } from "./behaviours/needs/BasicNeeds";
import { EverydayNeeds } from "./behaviours/needs/EverydayNeeds";
import { LuxuryNeeds } from "./behaviours/needs/LuxuryNeeds";

export class Population extends ProvincialEntity {

    public Size: number;
    public Behaviours: PopBehaviour[] = new Array<PopBehaviour>();
    public Cash: CashPile = new CashPile();
    public Inventory: GoodsInventory = new GoodsInventory();
    public Happiness: number;

    public BasicNeeds: BasicNeeds;
    public EverydayNeeds: EverydayNeeds;
    public LuxuryNeeds: LuxuryNeeds;

    public Start(): void {
        // throw new Error("Method not implemented.");
        for (const popbeh of this.Behaviours) {
            popbeh.Population = this;
        }
    }

    public Update(): void {
        this.Happiness = 0;

        if (this.BasicNeeds) {
            this.Happiness += this.BasicNeeds.Satisfaction;
        }
        if (this.EverydayNeeds) {
            this.Happiness += this.EverydayNeeds.Satisfaction;
        }
        if (this.LuxuryNeeds) {
            this.Happiness += this.LuxuryNeeds.Satisfaction;
        }

        console.log(`${this.Name}, Size: ${this.Size}, Happiness: ${this.Happiness}, cash: ${this.Cash.Amount} `);

        if (this.Happiness < 1) {
            this.Size -= Math.round(Math.random() * 0.005 * this.Size);
        }
    }

    public Add(popbeh: PopBehaviour) {
        this.Behaviours.push(popbeh);
        popbeh.Population = this;
    }

    public Get(classname: string): PopBehaviour {
        for (const object of this.Behaviours) {
            if (object.Class.includes(classname)) {
                return object;
            }
        }
    }
}
