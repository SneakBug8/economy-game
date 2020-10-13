import { Country } from "old/countries/Country.js";
import { Provinces } from "../provinces/Provinces.js";
import { UpdatedEntity } from "../updatedentity.js";

import fs = require("fs");
import { Config } from "config";
const countries = JSON.parse(fs.readFileSync(Config.dataPath() + "/countries.json", "utf8"));

class CountriesClass extends UpdatedEntity {
    public Countries: Country[] = new Array<Country>();

    public constructor() {
        super();
        // this.Countries = countries as Country[];
        this.addClass("CountriesClass");
    }

    public Start(): void {
        for (const country of this.Countries) {
            this.Countries.push(this.ReadCountry(country));
            // country.LoadProvinces();
        }
        console.log("Loaded countries");
    }

    public Update(): void {}

    public ReadCountry(country: any): Country {
        // Add country json to objects conversion here
        const res = new Country();
        res.Id = country.Id;
        res.Name = country.Name;

        if (country.Cash) {
            res.Cash.Amount += country.Cash;
        }

        for (const provinceid of country.ProvincesIds) {
            res.Add(Provinces.GetById(provinceid));
        }
        return res;
    }

    public Add(country: Country): void {
        this.Countries.push(country);
    }

    public GetById(id: number): Country {
        for (const country of this.Countries) {
            if (country.Id === id) {
                return country;
            }
        }

        return null;
    }
}

export const Countries = new CountriesClass();
