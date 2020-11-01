import "services/TurnsService";
import "services/MarketService";
import "services/ProductionService";
import "services/UsersService";
import { TurnsService } from "services/TurnsService";
import { RecipesService } from "services/RecipesService";
import { ProductionService } from "services/ProductionService";
import { MarketService } from "services/MarketService";

export class Runner {
    public static async Init() {
        TurnsService.Init();
        RecipesService.Init();
    }

    public static async Turn() {
        ProductionService.Run();
        MarketService.Run();
        // for each player
        // hire new employees
        // run production
        //
        // for each Market
        // for each Good
        // run market cycle

    }
}