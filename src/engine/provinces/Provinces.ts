import { Province } from "./province";

import provinces = require("./provinces.json");
import { UpdatedEntity } from "../updatedentity";
import { Populations } from "engine/pops/Populations";

class ProvincesClass extends UpdatedEntity {
    Provinces: Province[] = new Array<Province>();

    public constructor() {
        super();
        this.addClass("ProvincesClass");
    }

    public Start(): void {
        for (const province of provinces) {
            this.Provinces.push(this.ReadProvince(province));
        }
        console.log("Loaded provinces");
    }
    public Update(): void {}

    public ReadProvince(province: any): Province {
        // Add province json to objects conversion here
        // Or should I make separate JSON for populations?
        const res = new Province();

        res.Id = province.Id;
        res.Name = province.Name;

        if (province.Cash) {
            res.Cash.Amount += province.Cash;
        }

        for (const pop of province.Pops) {
            res.Add(Populations.ReadPopulation(pop));
        }
        return res;
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
