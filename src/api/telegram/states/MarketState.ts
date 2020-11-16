import { State } from "../State";
import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { MarketService } from "services/MarketService";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { MainState } from "./MainState";
import * as TelegramBot from "node-telegram-bot-api";

export class MarketState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnMarketBuy,
            this.OnMarketBuyDelete,
            this.OnMarketBuyList,
            this.OnMarketSell,
            this.OnMarketSellDelete,
            this.OnMarketSellList,
            this.OnHelp,
            this.OnBack,
        ];
    }

    public async init()
    {
        this.OnHelp("/help");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]>
    {
        const res: TelegramBot.KeyboardButton[][] = [];

        res.push([{ text: "📥 /market buy" }, { text: "✅ /market buy add" }, { text: "⛔️ /market buy delete" }]);
        res.push([{ text: "📤 /market sell" }, { text: "✅ /market sell add" }, { text: "⛔️ /market sell delete"}]);
        res.push([{ text: "📄 /help" }, { text: "❌ /back" }]);

        return res;
    }

    public async OnMarketBuy(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market buy add");
        if (registerregex.test(message)) {
            this.setWaitingForValue(this.waitingMarketBuyGood);

            this.Client.write("Write good id");

            return true;
        }

        return false;
    }

    private marketBuyGoodId;

    public async waitingMarketBuyGood(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const goodid = Number.parseInt(matches[1], 10);

            if (!goodid) {
                this.Client.write("Wrong good id");
                return;
            }

            const good = await Good.GetById(goodid);

            if (!good) {
                this.Client.write("No such good");
                return;
            }

            this.marketBuyGoodId = goodid;

            this.setWaitingForValue(this.waitingMarketBuyPrice);
            this.Client.write("Write price");

            return true;
        }

        this.Client.write(`You entered wrong good id. Use only numbers`);

        return false;
    }

    private marketBuyPrice;

    public async waitingMarketBuyPrice(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const price = Number.parseInt(matches[1], 10);

            this.marketBuyPrice = price;

            this.setWaitingForValue(this.waitingMarketBuyAmount);
            this.Client.write("Write amount");

            return true;
        }

        this.Client.write(`You entered wrong price. Use only numbers`);

        return false;
    }

    public async waitingMarketBuyAmount(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            let amount = Number.parseInt(matches[1], 10);

            if (!amount) {
                amount = 1;
            }

            const good = await Good.GetById(this.marketBuyGoodId);
            const player = await Player.GetById(this.Client.playerId);
            const actor = await player.getActor();

            const id = await MarketService.AddBuyOffer(actor, good, amount, this.marketBuyPrice);

            if (id) {
                this.Client.write("Added buy offer id " + id);
            }
            else {
                this.Client.write("Was unable to create buy offer");
            }

            return true;
        }

        this.Client.write(`You entered wrong amount. Use only numbers`);

        return false;
    }

    public async OnMarketBuyDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market buy delete");
        if (registerregex.test(message)) {

            this.setWaitingForValue(this.waitingMarketBuyDelete);

            this.Client.write("Write order id to delete");

            return true;
        }

        return false;
    }

    public async waitingMarketBuyDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const offerid = Number.parseInt(matches[1], 10);

            if (!offerid) {
                this.Client.write("Wrong offer id");
                return;
            }

            const offer = await BuyOffer.GetById(offerid);

            if (offer.getActorId() !== this.Client.actorId) {
                this.Client.write("That's not your offer");
                return;
            }

            await BuyOffer.Delete(offer.id);

            this.Client.write("Deleted buy offer id " + offer.id);

            return true;
        }

        this.Client.write(`You entered wrong order id. Use only numbers`);

        return false;
    }

    public async OnMarketBuyList(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market buy$");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.Client.playerId);
            const actor = await player.getActor();

            const res = await BuyOffer.GetWithActor(actor.id);

            this.Client.writeList<BuyOffer>(res, (x) => x.id, async (x) => `${x.amount} ${(await x.getGood()).name} for ${x.price} each`);

            return true;
        }

        return false;
    }

    public async OnMarketSell(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market sell add");
        if (registerregex.test(message)) {
            this.setWaitingForValue(this.waitingMarketSellGood);

            this.Client.write("Write good id");

            return true;
        }

        return false;
    }

    private marketSellGoodId;

    public async waitingMarketSellGood(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const goodid = Number.parseInt(matches[1], 10);

            if (!goodid) {
                this.Client.write("Wrong good id");
                return;
            }

            const good = await Good.GetById(goodid);

            if (!good) {
                this.Client.write("No such good");
                return;
            }

            this.marketSellGoodId = goodid;

            this.setWaitingForValue(this.waitingMarketSellPrice);
            this.Client.write("Write price");

            return true;
        }

        this.Client.write(`You entered wrong good id. Use only numbers`);

        return false;
    }

    private marketSellPrice;

    public async waitingMarketSellPrice(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const price = Number.parseInt(matches[1], 10);

            this.marketSellPrice = price;

            this.setWaitingForValue(this.waitingMarketSellAmount);
            this.Client.write("Write amount");

            return true;
        }

        return false;
    }

    public async waitingMarketSellAmount(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            let amount = Number.parseInt(matches[1], 10);

            if (!amount) {
                amount = 1;
            }

            const good = await Good.GetById(this.marketSellGoodId);
            const player = await Player.GetById(this.Client.playerId);
            const actor = await player.getActor();

            const id = await MarketService.AddSellOffer(actor, good, amount, this.marketSellPrice);

            if (id) {
                this.Client.write("Added sell offer id " + id);
            }
            else {
                this.Client.write("Was unable to create buy offer");
            }

            return true;
        }

        this.Client.write(`You entered wrong amount. Use only numbers`);

        return false;
    }

    public async OnMarketSellDelete(message: string): Promise<boolean>
    {
        const marketsellregex = new RegExp("\/market sell delete");
        if (marketsellregex.test(message)) {
            this.setWaitingForValue(this.waitingMarketSellDelete);

            this.Client.write("Write sell order id to delete");

            return true;
        }

        return false;
    }

    public async waitingMarketSellDelete(message: string): Promise<boolean>
    {
        const marketsellregex = new RegExp("([0-9]+)");
        if (marketsellregex.test(message)) {
            const matches = marketsellregex.exec(message);

            const offerid = Number.parseInt(matches[1], 10);

            if (!offerid) {
                this.Client.write("Wrong offer id");
                return;
            }

            const offer = await SellOffer.GetById(offerid);

            if (offer.getActorId() !== this.Client.actorId) {
                this.Client.write("That's not your offer");
                return;
            }

            await SellOffer.Refund(offer.id);

            this.Client.write("Deleted sell offer id " + offer.id);

            return true;
        }

        this.Client.write(`You entered wrong id. Use only numbers`);

        return false;
    }

    public async OnMarketSellList(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market sell$");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.Client.playerId);
            const actor = await player.getActor();

            const res = await SellOffer.GetWithActor(actor.id);

            this.Client.writeList<SellOffer>(res, (x) => x.id, async (x) => `${x.amount} ${(await x.getGood()).name} for ${x.price} each`);

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