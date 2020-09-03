import { Country } from "./countries/Country";
import { UpdatedEntity } from "./updatedentity";

export class World extends UpdatedEntity {
    static Global: World;
    Countries: Country[] = new Array<Country>();

    public constructor() {
        super();

        this.addClass("World");
        this.Name = "World";

        World.Global = this;
    }

    public Start(): void {
        for (const country of this.Countries) {
            country.World = this;
        }
    }

    public Update(): void {
    }

    public Add(country: Country) {
        this.Countries.push(country);
        country.World = this;
    }
}
