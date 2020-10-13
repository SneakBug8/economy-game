import { UpdatedEntity } from "./updatedentity";

export class UpdateAlgorithm {
    public StartOrder: string[] = [
        "GoodsClass",
        "ProvincesClass",
        "CountriesClass",
        "UpdatedEntity",
    ];

    public UpdateOrder: string[] = [
        "RGOBehaviour",
        "EatingBehaviour",
        "UpdatedEntity",
    ];

    public Start(): void {
        const initialized = new Array<UpdatedEntity>();
        for (const classname of this.StartOrder) {
            for (const object of UpdatedEntity.All) {
                if (object.Class.includes(classname) && !initialized.includes(object)) {
                    object.Start();
                    initialized.push(object);
                    // console.log("Initialized " + object.Name);
                }
            }
        }
    }

    public Update(): void {
        // console.log("Update");
        const updated = new Array<UpdatedEntity>();
        for (const classname of this.UpdateOrder) {
            for (const object of UpdatedEntity.All) {
                if (object.Class.includes(classname) && !updated.includes(object)) {
                    object.Update();
                    updated.push(object);

                    // console.log("Updated " + object.Name);
                }
            }
        }
    }
}
