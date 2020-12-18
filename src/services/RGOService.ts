import { Connection } from "DataBase";
import { RGO } from "entity/RGO";
import { RGOMarketToType } from "entity/RGOMarketToType";
import { RGOType } from "entity/RGOType";

export class RGOService {
    public static CalculateEfficiency(type: RGOType, link: RGOMarketToType) {
        return type.efficiency * link.efficiency;
    }

    public static async BuildableWithinRegion(marketId: number): Promise<RGOType[]>
    {
        const rgomarkettotypes = await RGOMarketToType.BuildableWithinRegion(marketId);
        const rgotypes = [];

        for (const i of rgomarkettotypes) {
            rgotypes.push(
                await RGOType.GetById(i.typeId),
            );
        }

        return rgotypes;
    }
}