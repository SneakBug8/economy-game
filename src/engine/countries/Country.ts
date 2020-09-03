import { Province } from "../provinces/Province";
import { World } from "../World";

export class Country {
    Id: number;
    Name: string;
    ProvincesIds: number[];
    Provinces: Province[];
    World: World;

    public Add(province: Province): void {
        this.Provinces.push(province);
        province.Country = this;
    }
}