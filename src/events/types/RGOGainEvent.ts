import { Good } from "entity/Good";
import { RGO } from "entity/RGO";

export class RGOGainEvent {
    public RGO: RGO;
    public Good: Good;
    public Amount: number;
}
