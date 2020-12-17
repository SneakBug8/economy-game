import { ModifierType } from "entity/modifiers/ModifierType";

export class ModifiersService {
    public static GetValueForPlayer(type: ModifierType, playerId: number) {
        return 1.0;
    }

    public static GetValueForFactory(type: ModifierType, factoryId: number) {
        return 1.0;
    }

    public static GetValueForRGO(type: ModifierType, rgoId: number) {
        return 1.0;
    }
}