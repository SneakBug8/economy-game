
import countries = require("./countries.json");
import { Country } from "./Country.js";

class CountriesClass {
    Countries: Country[];

    public constructor() {
        this.Countries = countries as Country[];

        for (const country of this.Countries) {
            country.LoadProvinces();
        }
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
