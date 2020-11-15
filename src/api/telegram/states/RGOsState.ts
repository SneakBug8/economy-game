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
import { RGO } from "entity/RGO";

export class RGOsState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnRGOId,
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
        const rgos = await Player.GetRGOsById(this.Client.playerId);

        for (const rgo of rgos) {
            res.push([{text: "⛏ " + rgo.id + ""}]);
        }

        res.push([{text: "📄 /info"}, {text: "📄 /help"}, {text: "❌ /back"}]);

        return res;
    }

    public async OnRGOId(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const rgoid = Number.parseInt(matches[1], 10);

            const rgo = await RGO.GetById(rgoid);

            if (!rgo) {
                this.Client.write("No such RGO");
                return;
            }

            if (rgo.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your RGO");
                return;
            }

            this.Client.setState(new FactoryState(rgoid));

            return true;
        }

        return false;
    }

    public async OnInfo(message: string): Promise<boolean> {
        const regex = new RegExp("\/info$");
        if (regex.test(message)) {
            const rgos = await Player.GetRGOsById(this.Client.playerId);

            this.Client.writeList<RGO>(rgos,
                (x) => x.id,
                (x) => `Employees: ${x.employeesCount} / ${x.targetEmployees}, salary: ${x.salary}`,
                "Your RGOs");

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