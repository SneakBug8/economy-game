import { Province } from "./province";

import provinces = require("./provinces.json");
import { Aristocrats } from "../pops/types/Aristocrats";
import { Bureucrats } from "../pops/types/Bureucrats";
import { Farmers } from "../pops/types/Farmers";
import { Miners } from "../pops/types/Miners";
import { Workers } from "../pops/types/Workers";
import { UpdatedEntity } from "../updatedentity";

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
        for (const pop of province.Pops) {
            if (pop.type === "aristocrats") {
                res.Add(new Aristocrats());
            } else if (pop.type === "bureucrats") {
                res.Add(new Bureucrats());
            } else if (pop.type === "farmers") {
                res.Add(new Farmers());
            } else if (pop.type === "miners") {
                res.Add(new Miners());
            } else if (pop.type === "workers") {
                res.Add(new Workers());
            }
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
