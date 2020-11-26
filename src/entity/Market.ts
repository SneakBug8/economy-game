import { Connection } from "DataBase";
import { Currency } from "./finances/Currency";
import { Good } from "./Good";

export class Market
{
    public id: number;
    public name: string;
    public popColor: string;
    public govtColor: string;
    public currencyId: number;
    public govStrategy: string;
    public GovStrategy: IGovernmentStrategy;
    public image: string;
    // How much currency can you buy with one gold

    public static DefaultMarket: Market;

    public async getCurrency() {
        return await Currency.GetById(this.currencyId);
    }

    public async getCashGoodId() {
        const currency = await this.getCurrency();
        return currency.goodId;
    }

    public static async GetCashGoodId(marketId: number) {
        const market = await this.GetById(marketId);
        const currency = await market.getCurrency();
        return currency.goodId;
    }

    public static async GetCashGood(marketId: number) {
        const market = await this.GetById(marketId);
        const currency = await market.getCurrency();
        return await currency.getGood();
    }

    public static async From(dbobject: any)
    {
        const res = new Market();
        res.id = dbobject.id;
        res.name = dbobject.name;
        res.popColor = dbobject.popColor;
        res.govtColor = dbobject.govtColor;
        res.currencyId = dbobject.currencyId;
        res.govStrategy = dbobject.govStrategy;
        res.GovStrategy = JSON.parse(res.govStrategy) || {};
        res.image = dbobject.image;

        return res;
    }

    public static async GetById(id: number): Promise<Market>
    {
        const data = await MarketRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Update(market: Market)
    {
        await MarketRepository().where("id", market.id).update(this);
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await MarketRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async All(): Promise<Market[]>
    {
        const data = await MarketRepository().select();
        const res = new Array<Market>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

interface IGovernmentStrategy {
    goldBuySize?: number;
    goldSellSize?: number;
    keepMSRatio: boolean;
    changeExchangeRate: boolean;
}

export const MarketRepository = () => Connection("Markets");