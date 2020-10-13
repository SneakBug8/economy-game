import { Province } from "./province";

import { UpdatedEntity } from "../updatedentity";
import { Populations } from "../pops/Populations";

import fs = require("fs");
import { Config } from "config";
const provinces = JSON.parse(fs.readFileSync(Config.dataPath() + "/provinces.json", "utf8"));

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

        //TODO: Read RGOs

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
