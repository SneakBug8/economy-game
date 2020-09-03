import { ProvincialEntity } from "./ProvincialEntity";
import { UpdatedEntity } from "../updatedentity";
import { RGO } from "./RGO";

export class Province extends UpdatedEntity{
    Id: number;
    RGO: RGO;
    ProvincialEntities: ProvincialEntity[];

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
}
