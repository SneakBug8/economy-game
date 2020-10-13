
export abstract class UpdatedEntity {
    Class: string;
    Name: string;

    static All: UpdatedEntity[] = new Array<UpdatedEntity>();

    public constructor() {
        UpdatedEntity.All.push(this);
        if (!this.Class) {
            this.Class = "UpdatedEntity";
        }
        if (!this.Name) {
            this.Name = this.Class;
        }
    }

    public abstract Start(): void;
    public abstract Update(): void;

    customName: boolean = false;

    protected addClass(classname: string) {
        this.Class += " / " + classname;

        if (!this.customName) {
            this.Name = classname;
        }
    }

    protected setName(name: string) {
        this.Name = name;
        this.customName = true;
    }
}
