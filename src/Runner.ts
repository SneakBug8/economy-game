import "services/TurnsService";
import "services/MarketService";
import "services/ProductionService";
import "services/UsersService";
import { TurnsService } from "services/TurnsService";
import { RecipesService } from "services/RecipesService";
import { ProductionService } from "services/ProductionService";
import { MarketService } from "services/MarketService";
import { TradeWatcher } from "watchers/TradeWatcher";
import { ProductionWatcher } from "watchers/ProductionWatcher";

export class Runner {
    public static async Init() {
        TurnsService.Init();
        RecipesService.Init();
        MarketService.Init();

        // Watchers
        TradeWatcher.Init();
        ProductionWatcher.Init();
    }

    public static async Turn() {
        ProductionService.Run();
        MarketService.Run();
        TurnsService.MakeReport();
        // for each player
        // hire new employees
        // run production
        //
        // for each Market
        // for each Good
        // run market cycle

    }
}