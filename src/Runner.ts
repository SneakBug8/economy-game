import "services/TurnsService";
import "services/MarketService";
import "services/ProductionService";
import "services/PlayerService";
import { TurnsService } from "services/TurnsService";
import { RecipesService } from "services/RecipesService";
import { ProductionService } from "services/ProductionService";
import { MarketService } from "services/MarketService";
import { TradeWatcher } from "watchers/TradeWatcher";
import { ProductionWatcher } from "watchers/ProductionWatcher";
import { FactoryManagementService } from "services/FactoryManagementService";
import { IApiProvider } from "api/ApiProvider";
import { FixedTaxService } from "services/FixedTaxService";
import { GDPWatcher } from "watchers/GDPWatcher";
import { RGOGainService } from "services/RGOGainService";
import { RGOManagementService } from "services/RGOManagementService";
import { sleep } from "utility/sleep";
import { PriceRecordWatcher } from "watchers/PriceRecordWatcher";
import { TransactionWatcher } from "watchers/TransactionWatcher";

export class Runner
{
    public static ApiProvider: IApiProvider;

    public static async Init()
    {
        await TurnsService.Init();
        await RecipesService.Init();
        await MarketService.Init();

        // Watchers
        await TradeWatcher.Init();
        await ProductionWatcher.Init();
        await GDPWatcher.Init();
        await PriceRecordWatcher.Init();
        await TransactionWatcher.Init();

        require("api/web/main");
        require("api/telegram/TelegramApi");
    }

    public static async Turn()
    {
        // Production

        await TurnsService.CheckBalance();

        await RGOGainService.Run();

        await sleep(3000);

        await ProductionService.Run();

        await TurnsService.CheckBalance();

        await sleep(3000);

        // Salaries and employees
        await FactoryManagementService.Run();

        await sleep(3000);

        await RGOManagementService.Run();

        await sleep(3000);

        // Trade
        await MarketService.Run();

        await sleep(3000);

        await TurnsService.CheckBalance();

        await FixedTaxService.Run();

        await TurnsService.CheckBalance();

        await TurnsService.EndTurn();
        await TurnsService.StartTurn();
    }
}
