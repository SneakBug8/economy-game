export class InnovationService
{
    public static CountFactoryEfficiency(): number
    {
        return 1;
    }
    public static CountFactoryOutputIncrease(): number
    {
        return 1;

    }
    public static CountFactoryInputDecrease(): number
    {
        return 1;

    }
    public static CountFactoryMaxWorkersPerLevel(): number
    {
        return 1;

    }
    public static CountRGOEfficiency(): number
    {
        return 1;

    }
    public static CountRGOMaxWorkersPerLevel(): number
    {
        return 1;

    }
    public static CountLogisticsDiscount(): number
    {
        return 1;
    }

    public static IsRecipeUnlocked(recipeId: number) {
        return true;
    }

    public static IsRGOTypeUnlocked(rgotypeId: number) {
        return true;
    }
}