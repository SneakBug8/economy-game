import { State } from "../State";
import { TelegramClient } from "../TelegramClient";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { Client } from "knex";
import { MarketService } from "services/MarketService";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { RecipesService, Recipe } from "services/RecipesService";
import { PriceRecord } from "entity/PriceRecord";
import { Runner } from "Runner";
import {Storage} from "entity/Storage";
import { BlankState } from "./BlankState";
import { FactoriesState } from "./FactoriesState";
import { MarketState } from "./MarketState";
import * as TelegramBot from "node-telegram-bot-api";
import { TelegramUser } from "../TelegramUser";

export class MainState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnInfo,
            this.OnGoods,
            this.OnRecipes,
            this.OnStorageView,
            this.OnFactory,
            this.OnMarket,
            this.OnLogout,
        ];
    }

    public async init() {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]> {
        return [
            [{ text: "📄 /info" }, { text: "📄 /goods" }, { text: "📜 /recipes" }],
            [{ text: "🏭 /factories" }, { text: "🛒 /market" }, { text: "📦 /storage" }],
            [{ text: "🔓 /logout"}]
          ];
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        const inforegex = new RegExp("\/info");
        if (inforegex.test(message)) {

            const player = await Player.GetById(this.Client.playerId);

            if (!player) {
                this.Client.write("Something went wrong with retrieving player");
                return;
            }

            this.Client.write(`Player: ${player.username}\n---\nCash: ${player.cash}`);

            return true;
        }

        return false;
    }

    public async OnRecipes(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/recipes$");
        if (registerregex.test(message)) {

            const recipes = RecipesService.All;


            this.Client.writeList<Recipe>(recipes, (x) => x.id, (x) => {
                let res = `${x.name}: `;
                for (const input of x.Requisites) {
                    res += `${input.amount} ${input.Good.name}`;
                }
                res += " => ";
                for (const output of x.Results) {
                    res += `${output.amount} ${output.Good.name}`;
                }
                res += ", workers: " + x.employeesneeded;

                return res;
            });

            return true;
        }

        return false;
    }

    public async OnGoods(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/goods$");
        if (registerregex.test(message)) {

            const goods = await Good.All();

            this.Client.writeList<Good>(goods, (x) => x.id, async (x) =>
            {
                const lastrecord = await PriceRecord.GetLatestWithGood(x);

                if (lastrecord && lastrecord.tradeamount) {
                    return `${x.name}, price: ${lastrecord.minprice}-${lastrecord.maxprice}, traded ${lastrecord.tradeamount}`;
                }
                else if (lastrecord) {
                    return `${x.name}, traded ${lastrecord.tradeamount}`;
                }
                else {
                    return `${x.name}`;
                }
            });

            return true;
        }

        return false;
    }

    public async OnStorageView(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/storage$");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.Client.playerId);
            const actor = await player.getActor();

            const storages = await Storage.GetWithActor(actor);

            this.Client.writeList<Storage>(storages,
                async (x) => (await x.getGood()).name + ` (${x.id})`,
                (x) => x.amount + "",
                "Your storage");

            return true;
        }

        return false;
    }



    public async OnFactory(message: string): Promise<boolean>
    {
        const logoutregex = new RegExp("\/factories$");
        if (logoutregex.test(message)) {
            this.Client.setState(new FactoriesState());
            return true;
        }

        return false;
    }

    public async OnMarket(message: string): Promise<boolean>
    {
        const logoutregex = new RegExp("\/market$");
        if (logoutregex.test(message)) {
            this.Client.setState(new MarketState());
            return true;
        }

        return false;
    }

    public async OnLogout(message: string): Promise<boolean>
    {
        const logoutregex = new RegExp("\/logout$");
        if (logoutregex.test(message)) {
            this.Client.setState(new BlankState());

            TelegramUser.Delete(this.Client.userId);
            return true;
        }

        return false;
    }
}