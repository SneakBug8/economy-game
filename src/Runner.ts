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
import * as child_process from "child_process";
import { FactoryManagementService } from "services/FactoryManagementService";

export class Runner {
    public static async Init() {
        TurnsService.Init();
        RecipesService.Init();
        MarketService.Init();

        // Watchers
        TradeWatcher.Init();
        ProductionWatcher.Init();

        require("web/main");
        //child_process.exec("npm run-script web");
    }

    public static async Turn() {
        // Production
        ProductionService.Run();
        // Trade
        MarketService.Run();
        // Salaries and employees
        FactoryManagementService.Run();

        TurnsService.MakeReport();
    }
}