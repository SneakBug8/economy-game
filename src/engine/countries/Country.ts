import { Province } from "../provinces/Province";
import { World } from "../World";
import { CashPile } from "engine/CashPile";

export class Country {
    Id: number;
    Name: string;
    ProvincesIds: number[];
    Provinces: Province[];
    World: World;
    Cash: CashPile = new CashPile();

    public Add(province: Province): void {
        this.Provinces.push(province);
        province.Country = this;
    }
}