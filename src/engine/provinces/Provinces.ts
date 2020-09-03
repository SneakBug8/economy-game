import { Province } from "./province";

import provinces = require("./provinces.json");

class ProvincesClass {
    Provinces: Province[];

    public constructor() {
        this.Provinces = provinces as Province[];
    }

    public Add(province: Province): void {
        this.Provinces.push(province);
    }

    public GetById(id: number): Province {
        for (const province of this.Provinces) {
            if (province.Id === id) {
                return province;
            }
        }

        return null;
    }
}

export const Provinces = new ProvincesClass();
