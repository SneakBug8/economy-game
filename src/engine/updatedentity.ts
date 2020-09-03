
export abstract class UpdatedEntity {
    Name: string;

    static All: UpdatedEntity[];

    public constructor() {
        UpdatedEntity.All.push(this);
    }

    public abstract Start(): void;
    public abstract Update(): void;
}
