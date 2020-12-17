import { Connection } from "DataBase";
import { PlayerService } from "services/PlayerService";
import { MapToObject } from "utility/MapToObject";
import { Good } from "./Good";
import { GoodsBucketHelpers, IGoodsBucket } from "./interfaces/IGoodsBucket";
import { Storage } from "./Storage";

export class Deal
{
    public id: number;

    public marketId: number;

    public fromId: number;
    public toId: number;
    public fromGoods: string;
    public toGoods: string;
    // GoodId to amount
    public FromGoods: IGoodsBucket = new Map();
    public ToGoods: IGoodsBucket = new Map();

    public confirmFrom: boolean = false;
    public confirmTo: boolean = false;

    public created: string = new Date().toString();
    public Created: Date = new Date();

    public static async From(dbobject: any)
    {
        const res = new Deal();
        res.id = dbobject.id;
        res.marketId = dbobject.marketId;
        res.fromId = dbobject.fromId;
        res.toId = dbobject.toId;
        res.fromGoods = dbobject.fromGoods;
        res.toGoods = dbobject.toGoods;
        res.confirmFrom = dbobject.confirmFrom !== 0;
        res.confirmTo = dbobject.confirmTo !== 0;
        res.created = dbobject.created;

        res.Created = new Date(res.created);

        res.FromGoods = GoodsBucketHelpers.Deserialize(res.fromGoods);
        res.ToGoods = GoodsBucketHelpers.Deserialize(res.toGoods);

        return res;
    }

    public static async Create(marketId: number, fromId: number, toId: number)
    {
        const record = new Deal();
        record.fromId = fromId;
        record.toId = toId;
        record.marketId = marketId;

        return await this.Insert(record);
    }

    public async addGood(playerId: number, goodId: number, amount: number)
    {
        if (! await Storage.Has(this.marketId, playerId, goodId, amount)) {
            return "Don't have such goods";
        }

        if (this.toId === playerId) {
            const prevamount = this.ToGoods.get(goodId) || 0;
            this.ToGoods.set(goodId, prevamount + amount);
            this.confirmFrom = false;
        }
        else if (this.fromId === playerId) {
            const prevamount = this.FromGoods.get(goodId) || 0;
            this.FromGoods.set(goodId, prevamount + amount);
            this.confirmTo = false;
        }
        else {
            return "No such player in deal";
        }

        await Deal.Update(this);

        await Storage.AddGoodTo(this.marketId, playerId, goodId, -amount);

        return true;
    }

    public async removeGood(playerId: number, goodId: number)
    {
        let prevamount = 0;
        if (this.toId === playerId) {
            prevamount = this.ToGoods.get(goodId) || 0;
            this.ToGoods.delete(goodId);
            this.confirmFrom = false;
        }
        else if (this.fromId === playerId) {
            prevamount = this.FromGoods.get(goodId) || 0;
            this.FromGoods.delete(goodId);
            this.confirmTo = false;
        }
        else {
            return "No such player in deal";
        }

        await Storage.AddGoodTo(this.marketId, playerId, goodId, prevamount);
        await Deal.Update(this);

        return true;
    }

    public static async GetById(id: number): Promise<Deal>
    {
        const data = await DealsRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public async confirm(playerId: number)
    {
        if (this.toId === playerId) {
            this.confirmTo = !this.confirmTo;
        }
        else if (this.fromId === playerId) {
            this.confirmFrom = !this.confirmFrom;
        }
        else {
            return "No such player in deal";
        }

        await Deal.Update(this);
        return true;
    }

    public async revert()
    {
        let toIdmsg = `Deal ${this.id} was reverted. Received:\n`;
        let fromMsg = `Deal ${this.id} was reverted. Received:\n`;

        for (const fromkeyvalue of this.FromGoods) {
            const good = await Good.GetById(fromkeyvalue[0]);

            if (!good) {
                return "No such good";
            }

            fromMsg += `- ${fromkeyvalue[1]} ${good.name}\n`;

            await Storage.AddGoodTo(this.marketId, this.fromId, fromkeyvalue[0], fromkeyvalue[1]);
        }
        for (const tokeyvalue of this.ToGoods) {
            const good = await Good.GetById(tokeyvalue[0]);

            if (!good) {
                return "No such good";
            }

            toIdmsg += `- ${tokeyvalue[1]} ${good.name}\n`;

            await Storage.AddGoodTo(this.marketId, this.toId, tokeyvalue[0], tokeyvalue[1]);
        }

        PlayerService.SendOffline(this.toId, toIdmsg);
        PlayerService.SendOffline(this.fromId, fromMsg);

        Deal.Delete(this.id);
        return true;
    }

    public async commit()
    {
        if (!this.confirmTo || !this.confirmFrom) {
            return "Deal is not confirmed";
        }

        let toIdmsg = `Deal ${this.id} was committed. Received:\n`;
        let fromMsg = `Deal ${this.id} was committed. Received:\n`;

        for (const fromkeyvalue of this.FromGoods) {
            const good = await Good.GetById(fromkeyvalue[0]);

            if (!good) {
                return "No such good";
            }

            fromMsg += `- ${fromkeyvalue[1]} ${good.name}\n`;

            await Storage.AddGoodTo(this.marketId, this.toId, fromkeyvalue[0], fromkeyvalue[1]);
        }
        for (const tokeyvalue of this.ToGoods) {
            const good = await Good.GetById(tokeyvalue[0]);

            if (!good) {
                return "No such good";
            }

            toIdmsg += `- ${tokeyvalue[1]} ${good.name}\n`;

            await Storage.AddGoodTo(this.marketId, this.fromId, tokeyvalue[0], tokeyvalue[1]);
        }

        PlayerService.SendOffline(this.toId, toIdmsg);
        PlayerService.SendOffline(this.fromId, fromMsg);

        Deal.Delete(this.id);
        return true;
    }

    public static async GetWithPlayer(marketId: number, playerId: number): Promise<Deal[]>
    {
        const data = await DealsRepository().select()
            .where("fromId", playerId)
            .orWhere("toId", playerId)
            .andWhere("marketId", marketId);

        const res = new Array<Deal>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }
        }

        return res;
    }

    public static async Count(): Promise<number>
    {
        const data = await DealsRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await DealsRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(record: Deal): Promise<number>
    {
        record.toGoods = GoodsBucketHelpers.Serialize(record.ToGoods);
        record.fromGoods = GoodsBucketHelpers.Serialize(record.FromGoods);
        record.ToGoods = undefined;
        record.FromGoods = undefined;

        const d = await DealsRepository().where("id", record.id).update(record);

        return d[0];
    }

    public static async Insert(record: Deal): Promise<number>
    {
        record.toGoods = JSON.stringify(MapToObject.Convert(record.ToGoods));
        record.fromGoods = JSON.stringify(MapToObject.Convert(record.FromGoods));
        record.ToGoods = undefined;
        record.FromGoods = undefined;

        const d = await DealsRepository().insert(record);

        record.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await DealsRepository().delete().where("id", id);

        return true;
    }

    public static async All(): Promise<Deal[]>
    {
        const data = await DealsRepository().select();
        const res = new Array<Deal>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const DealsRepository = () => Connection<Deal>("Deals");
