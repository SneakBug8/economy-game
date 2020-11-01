import { Player } from "entity/Player";
import { Factory } from "entity/Factory";
import { Good } from "entity/Good";

export class ProductionEvent {
    public Factory: Factory;
    public Good: Good;
    public Amount: number;
}
