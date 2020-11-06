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
import { sleep } from "utility/sleep";

export class Runner
{
    public static async Init()
    {
        await TurnsService.Init();
        await RecipesService.Init();
        await MarketService.Init();

        // Watchers
        await TradeWatcher.Init();
        await ProductionWatcher.Init();

        //require("web/main");
        require("api/telegram/main");
    }

    public static async Turn()
    {
        // Production

        await TurnsService.StartTurn();

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
    }
}