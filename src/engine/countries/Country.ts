import { Province } from "../provinces/Province";

export class Country {
    Id: number;
    Name: string;
    ProvincesIds: number[];
    Provinces: Province[];

    public LoadProvinces() : void {

    }
}