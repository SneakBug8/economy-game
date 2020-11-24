import { Connection } from "DataBase";
import { Log } from "./Log";
import { ProductionQueue } from "./ProductionQueue";
import { Player } from "./Player";
import { RGOType } from "./RGOType";
import { Logger } from "utility/Logger";

export class RGO
{
    public id: number;
    public employeesCount: number = 0;
    public targetEmployees: number = 0;
    public salary: number = 1;
    private Settings: IRGOSettings;
    public settings: string;
    private playerId: number;
    private typeId: number;
    public marketId: number;

    public level: number = 1;

    public getMaxWorkers(): number {
        return this.level * 100;
    }

    public async getType(): Promise<RGOType>
    {
        return RGOType.GetById(this.typeId);
    }
    public setType(type: RGOType)
    {
        this.typeId = type.id;
    }

    public getOwnerId(): number
    {
        return this.playerId;
    }

    public async getOwner(): Promise<Player>
    {
        return await Player.GetById(this.playerId);
    }

    public setOwner(player: Player)
    {
        this.playerId = player.id;
    }

    public getSettings()
    {
        return this.Settings;
    }

    public setSettings(settings: IRGOSettings)
    {
        this.Settings = settings;
        this.settings = JSON.stringify(settings);
    }

    public static async From(dbobject: any): Promise<RGO>
    {
        const res = new RGO();
        res.id = dbobject.id;
        res.typeId = dbobject.typeId;
        res.employeesCount = dbobject.employeesCount;
        res.targetEmployees = dbobject.targetEmployees;
        res.salary = dbobject.salary;
        res.settings = dbobject.settings;
        res.Settings = JSON.parse(res.settings);
        res.playerId = dbobject.playerId;
        res.level = dbobject.level;
        res.marketId = dbobject.marketId;

        return res;
    }

    public static async GetById(id: number): Promise<RGO>
    {
        const data = await RGORepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithPlayer(player: Player): Promise<RGO[]>
    {
        const data = await RGORepository().select().where("playerId", player.id);

        const res = new Array<RGO>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithType(typeid: number): Promise<RGO[]>
    {
        const data = await RGORepository().select().where("typeId", typeid);

        const res = new Array<RGO>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async CountWithType(typeid: number): Promise<number>
    {
        const data = await RGORepository().count("id as c").where("typeId", typeid).first() as any;

        return data.c;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await RGORepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async GetDescription(id: number) {
        const rgo = await RGO.GetById(id);
        if (!rgo) {
            return;
        }
        const type = await rgo.getType();
        const good = await type.getGood();

        return `Yields ${good.name} for every ${1 / type.efficiency} workers.`;
    }

    public static async Update(rgo: RGO)
    {
        await RGORepository().where("id", rgo.id).update({
            employeesCount: rgo.employeesCount,
            targetEmployees: rgo.targetEmployees,
            salary: rgo.salary,
            settings: rgo.settings,
            playerId: rgo.playerId,
            typeId: rgo.typeId,
            level: rgo.level,
            marketId: rgo.marketId,
        });
    }

    public static async Create(marketId: number, playerId: number, employeesCount: number, salary: number, type: number): Promise<number>
    {
        const rgo = new RGO();
        rgo.playerId = playerId;
        rgo.employeesCount = employeesCount;
        rgo.targetEmployees = employeesCount;
        rgo.salary = salary;
        rgo.typeId = type;
        rgo.level = 1;

        return this.Insert(rgo);
    }

    public static async Insert(rgo: RGO): Promise<number>
    {
        const d = await RGORepository().insert({
            id: rgo.id,
            playerId: rgo.playerId,
            typeId: rgo.typeId,
            employeesCount: rgo.employeesCount,
            targetEmployees: rgo.targetEmployees,
            salary: rgo.salary,
            settings: rgo.settings,
            level: rgo.level,
            marketId: rgo.marketId,
        });

        rgo.id = d[0];

        Logger.info("Created RGO " + rgo.id);

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const RGO = await this.GetById(id);

        await RGORepository().delete().where("id", id);

        Log.LogText("Deleted RGO id " + id);

        return true;
    }

    public static async All(): Promise<RGO[]>
    {
        const data = await RGORepository().select();
        const res = new Array<RGO>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export interface IRGOSettings
{
    testSetting: boolean;
}

export const RGORepository = () => Connection("RGOs");