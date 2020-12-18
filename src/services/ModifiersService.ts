import { ModifierType } from "entity/modifiers/ModifierType";

export class ModifiersService
{
    /*
    public static GetValueForPlayer(type: ModifierType, playerId: number) {
        if (type === ModifierType.logisticsDiscount) {
            return this.CalculateTransportTaxModifier(playerId);
        }
        else if (type === ModifierType.fixedTaxDiscount) {
            return this.CalculateFixedTaxModifier(playerId);
        }
        return 1.0;
    }

    public static GetValueForFactory(type: ModifierType, factoryId: number) {
        if (type === ModifierType.factoryOutputIncrease) {
            return this.CalculateFactoryOutputModifier(factoryId);
        }
        else if (type === ModifierType.factoryInputDecrease) {
            return this.CalculateFactoryInputModifier(factoryId);
        }
        return 1.0;
    }

    public static GetValueForRGO(type: ModifierType, rgoId: number) {
        return 1.0;
    }
    */

    public static CalculateFactoryInputModifier(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateFactoryOutputModifier(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateFactoryHireModifier(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateFactoryWorkersPerLevel(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateFactoryWorkersEffectiveness(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateRGOOutputModifier(rgoId: number): number
    {
        return 1.0;
    }

    public static CalculateRGOHireModifier(rgoId: number): number
    {
        return 1.0;
    }

    public static CalculateRGOWorkersPerLevel(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateRGOWorkersEffectiveness(factoryId: number): number
    {
        return 1.0;
    }

    public static CalculateFixedTaxModifier(playerId: number): number
    {
        return 1.0;
    }

    public static CalculateTransportTaxModifier(playerId: number): number
    {
        return 1.0;
    }
}
