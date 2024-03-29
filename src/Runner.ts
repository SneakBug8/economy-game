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
import { PlayerProfitPerGoodWatcher } from "watchers/PlayerProfitPerGoodWatcher";
import { PopulationActivityService } from "services/PopulationActivityService";
import { StateActivityService } from "services/StateActivityService";
import { GoldMinesService } from "services/GoldMinesService";

export class Runner
{
    public static ApiProvider: IApiProvider;

    public static async Init()
    {
        await TurnsService.Init();
        await RecipesService.Init();
        await MarketService.Init();

        await PopulationActivityService.Init();
        await StateActivityService.Init();

        await GoldMinesService.Init();

        // Watchers
        await TradeWatcher.Init();
        await ProductionWatcher.Init();
        await GDPWatcher.Init();
        await PriceRecordWatcher.Init();
        await TransactionWatcher.Init();
        await PlayerProfitPerGoodWatcher.Init();

        require("api/web/main");
        require("api/telegram/TelegramApi");
    }

    public static async Turn()
    {
        console.time("Turn");
        // Production
        await TurnsService.CheckBalance();

        await RGOGainService.Run();

        await ProductionService.Run();

        await TurnsService.CheckBalance();

        // Salaries and employees
        await FactoryManagementService.Run();

        await RGOManagementService.Run();

        // Trade
        await MarketService.Run();

        await TurnsService.CheckBalance();

        await FixedTaxService.Run();

        await TurnsService.CheckBalance();

        await TurnsService.CheckBalance();

        await TurnsService.EndTurn();
        await TurnsService.StartTurn();

        console.timeEnd("Turn");
    }
}
