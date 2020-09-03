import { UpdatedEntity } from "../updatedentity";
import { Population } from "./population";

export abstract class PopBehaviour extends UpdatedEntity {
    public Population: Population;
}
