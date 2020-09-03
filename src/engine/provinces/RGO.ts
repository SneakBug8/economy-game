import { Good } from "../goods/Good";

export class RGO {
    Good: Good;
    NaturalWealth: number;

    public RGOEfficiency(): number {
        return 1 * this.NaturalWealth;
    }
    public MaxRGOGain(): number {
        return 1000 * this.NaturalWealth;
    }
}