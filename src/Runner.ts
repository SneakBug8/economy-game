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

        //require("web/main");
        require("api/telegram/TelegramApi");
    }

    public static async Turn()
    {
        // Production

        console.log("abab");

        await TurnsService.CheckBalance();

        await ProductionService.Run();

        console.log("acac");


        await TurnsService.CheckBalance();

        // Trade
        await MarketService.Run();

        console.log("dede");


        await TurnsService.CheckBalance();

        // Salaries and employees
        await FactoryManagementService.Run();

        console.log("fefe");

        await TurnsService.CheckBalance();

        console.log("lili");

        await TurnsService.EndTurn();
        await TurnsService.StartTurn();
    }
}