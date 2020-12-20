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
import { Recipe } from "entity/Recipe";

export class FactoriesState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnFactoryId,
            this.OnInfo,
            this.OnRecipes,
            this.OnHelp,
            this.OnBack,
        ];
    }

    public async init() {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]> {
        const res: TelegramBot.KeyboardButton[][] = [];
        return res;
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

    public async OnFactoryId(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.Client.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            this.Client.setState(new FactoryState(factoryid));

            return true;
        }

        return false;
    }

    public async OnInfo(message: string): Promise<boolean> {
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