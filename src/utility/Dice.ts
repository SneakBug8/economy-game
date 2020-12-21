export class Dice {
    public static Multiple(times: number, chance: number) {
        let res = 0;
        for (let i = 0; i < times; i++) {
            if (Math.random() < chance) {
                res++;
            }
        }
        return res;
    }
}