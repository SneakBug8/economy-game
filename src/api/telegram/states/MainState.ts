import { State } from "../State";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { PriceRecord } from "entity/PriceRecord";
import { Storage } from "entity/Storage";
import { BlankState } from "./BlankState";
import { FactoriesState } from "./FactoriesState";
import { MarketState } from "./MarketState";
import * as TelegramBot from "node-telegram-bot-api";
import { TelegramUser } from "../TelegramUser";
import { RGOsState } from "./RGOsState";

export class MainState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnInfo,
            this.OnGoods,
            this.OnStorageView,
            this.OnFactory,
            this.OnRGO,
            this.OnMarket,
            this.OnDiscord,
            this.OnHelp,
            this.OnLogout,
        ];
    }

    public async init()
    {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]>
    {
        return [
            [{ text: "📄 /info" }, { text: "💎 /goods" }, { text: "📦 /storage" }],
            [{ text: "🏭 /factories" }, { text: "⛏ /rgo" }, { text: "🛒 /market" }],
            [{ text: "📄 /help" },
            { text: "/discord" },
            { text: "🔓 /logout" }],
        ];
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        return false;
    }



    public async OnGoods(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/goods$");
        if (registerregex.test(message)) {

            const goods = await Good.All();

            this.Client.writeList<Good>(goods, (x) => x.id, async (x) =>
            {
                const lastrecord = await PriceRecord.GetLastWithGood(x.id);

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

    public async OnRGO(message: string): Promise<boolean>
    {
        const logoutregex = new RegExp("\/rgo$");
        if (logoutregex.test(message)) {
            this.Client.setState(new RGOsState());
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

    public async OnDiscord(message: string): Promise<boolean>
    {
        const backregex = new RegExp("\/discord$");
        if (backregex.test(message)) {
            this.Client.writeInline("Click on the link", [
                        [{
                            text: `Discord`,
                            url: `https://discord.gg/9kRzrV4`
                        }],
                    ]);
            return true;
        }

        return false;
    }

    public async OnHelp(message: string): Promise<boolean>
    {
        const backregex = new RegExp("\/help$");
        if (backregex.test(message)) {
            this.Client.write("[WIP]");
            return true;
        }

        return false;
    }
}