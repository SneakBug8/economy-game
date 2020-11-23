import { State } from "../State";
import { TelegramClient } from "../TelegramClient";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { Client } from "knex";
import { MarketService } from "services/MarketService";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Factory } from "entity/Factory";
import { ProductionQueue, IQueueEntry } from "entity/ProductionQueue";
import { RecipesService } from "services/RecipesService";
import { MainState } from "./MainState";
import * as TelegramBot from "node-telegram-bot-api";
import { FactoryState } from "./FactoryState";
import { GrindService } from "services/GrindService";

export class GrindState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnRecipeId,
            this.OnInfo,
            this.OnHelp,
            this.OnBack,
        ];
    }

    public async init() {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]> {
        const res: TelegramBot.KeyboardButton[][] = [];
        const grindrecipes = GrindService.All;

        for (const recipe of grindrecipes) {
            res.push([{text: `⛏ ${recipe.id} ${recipe.name}`}]);
        }

        res.push([{text: "📄 /info"}, {text: "📄 /help"}, {text: "❌ /back"}]);

        return res;
    }

    public async OnRecipeId(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const recipeid = Number.parseInt(matches[1], 10);



            return true;
        }

        return false;
    }

    public async OnInfo(message: string): Promise<boolean> {
        const regex = new RegExp("\/info$");
        if (regex.test(message)) {
            const factories = await Player.GetFactoriesById(this.Client.playerId);

            this.Client.writeList<Factory>(factories,
                (x) => x.id,
                (x) => `Employees: ${x.employeesCount} / ${x.getTargetEmployees()}, salary: ${x.salary}`,
                "Your factories");

            return true;
        }

        return false;
    }

    public async OnHelp(message: string): Promise<boolean> {
        const backregex = new RegExp("\/help$");
        if (backregex.test(message)) {
            this.Client.write("[WIP]");
            return true;
        }

        return false;
    }

    public async OnBack(message: string): Promise<boolean>
    {
        const backregex = new RegExp("\/back$");
        if (backregex.test(message)) {
            this.Client.setState(new MainState());
            return true;
        }

        return false;
    }
}