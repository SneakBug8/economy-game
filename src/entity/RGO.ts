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
        res.employeesCount = dbobject.employees_count;
        res.targetEmployees = dbobject.targetEmployees;
        res.salary = dbobject.salary;
        res.settings = dbobject.settings;
        res.Settings = JSON.parse(res.settings);
        res.playerId = dbobject.playerId;

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

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await RGORepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(RGO: RGO)
    {
        await RGORepository().where("id", RGO.id).update({
            employees_count: RGO.employeesCount,
            targetEmployees: RGO.targetEmployees,
            salary: RGO.salary,
            settings: RGO.settings,
            playerId: RGO.playerId,
        });
    }

    public static async Create(owner: Player, employeesCount: number, salary: number): Promise<number>
    {
        const rgo = new RGO();
        rgo.setOwner(owner);
        rgo.employeesCount = employeesCount;
        rgo.targetEmployees = employeesCount;
        rgo.salary = salary;

        return this.Insert(rgo);
    }

    public static async Insert(rgo: RGO): Promise<number>
    {
        const d = await RGORepository().insert({
            id: rgo.id,
            playerId: rgo.playerId,
            employees_count: rgo.employeesCount,
            targetEmployees: rgo.targetEmployees,
            salary: rgo.salary,
            settings: rgo.settings,
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