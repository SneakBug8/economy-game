import { ProvincialEntity } from "./ProvincialEntity";
import { UpdatedEntity } from "../updatedentity";
import { RGO } from "./RGO";
import { Country } from "engine/countries/Country";
import { CashPile } from "engine/CashPile";

export class Province extends UpdatedEntity {
    Id: number;
    RGO: RGO;
    Country: Country;
    ProvincialEntities: ProvincialEntity[] = new Array<ProvincialEntity>();
    Cash: CashPile = new CashPile();

    public Start(): void
    {
        if (RGO == null) {
            this.RGO = new RGO();
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
