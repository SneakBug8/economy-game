import { PopBehaviour } from "./popbehaviour";
import { ProvincialEntity } from "engine/provinces/ProvincialEntity";

export class Population extends ProvincialEntity {

    public Behaviours: PopBehaviour[] = new Array<PopBehaviour>();

    public Start(): void {
        // throw new Error("Method not implemented.");
    }

    public Update(): void {
        // throw new Error("Method not implemented.");
    }
}
