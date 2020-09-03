export class Good {
    Id: number;
    Name: string;
    Price: number;
    BasePrice: number;

    public constructor() {
        this.Price = this.BasePrice;
    }
}