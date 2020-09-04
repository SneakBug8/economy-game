import { PopBehaviour } from "./popbehaviour";
import { ProvincialEntity } from "../provinces/ProvincialEntity";
import { CashPile } from "engine/CashPile";
import { GoodsInventory } from "engine/goods/GoodsInventory";

export class Population extends ProvincialEntity {

    public Size: number;
    public Behaviours: PopBehaviour[] = new Array<PopBehaviour>();
    public Cash: CashPile = new CashPile();
    public Inventory: GoodsInventory = new GoodsInventory();

    public Start(): void {
        // throw new Error("Method not implemented.");
        for (const popbeh of this.Behaviours) {
            popbeh.Population = this;
        }
    }

    public Update(): void {
        // throw new Error("Method not implemented.");
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
