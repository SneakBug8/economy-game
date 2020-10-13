import { Factory } from "./Factory";
import { Good } from "./Good";
import { Connection } from "DB";

export class Storage {
    public id;
    public Factory: Factory;
    public Good: Good;
    public amount: number;
}

export const StorageRepository = Connection("Storages");