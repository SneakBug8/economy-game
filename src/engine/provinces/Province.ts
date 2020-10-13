import { ProvincialEntity } from "./ProvincialEntity";
import { UpdatedEntity } from "../updatedentity";
import { RGO } from "./RGO";
import { Country } from "engine/countries/Country";
import { CashPile } from "engine/CashPile";
import { Good } from "engine/goods/Good";
import { Goods } from "engine/goods/Goods";

export class Province extends UpdatedEntity {
    Id: number;
    RGO: RGO;
    Country: Country;
    ProvincialEntities: ProvincialEntity[] = new Array<ProvincialEntity>();
    Cash: CashPile = new CashPile();

    public Start(): void
    {
        if (!this.RGO) {
            console.log("Created default RGO for " + this.Name);
            this.RGO = new RGO();
            this.RGO.Good = Goods.Food;
        }
        else {
            console.log(this.Name + " has RGO producing " + this.RGO.Good.Name);
        }

        for (const entity of this.ProvincialEntities) {
            entity.Province = this;
        }
    }

    public Add(entity: ProvincialEntity) {
        this.ProvincialEntities.push(entity);
        entity.Province = this;
    }

    public Update(): void {
    }

    public Get(classname: string): ProvincialEntity {
        for (const object of this.ProvincialEntities) {
            if (object.Class.includes(classname)) {
                return object;
            }
        }
    }
}
