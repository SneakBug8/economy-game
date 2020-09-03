import { UpdatedEntity } from "../updatedentity";
import { Province } from "./Province";

export abstract class ProvincialEntity extends UpdatedEntity {
    Province: Province;
}