import { Connection } from "DataBase";
import { Log } from "./Log";
import { ProductionQueue } from "./ProductionQueue";
import { Player } from "./Player";
import { Logger } from "utility/Logger";

export class Factory
{
    public id: number;
    public employeesCount: number = 0;
    private targetEmployees: number = 0;
    public salary: number = 1;
    private Settings: IFactorySettings;
    public settings: string;
    private playerId: number;

    public marketId: number;

    public level: number = 1;

    public getTargetEmployees(): number {
        return this.targetEmployees;
    }

    public setTargetEmployees(targetEmployees: number) {
        if (targetEmployees > this.getMaxWorkers()) {
            targetEmployees = this.getMaxWorkers();
        }
        this.targetEmployees = targetEmployees;
    }

    public getMaxWorkers(): number {
        return this.level * 100;
    }

    public getOwnerId(): number
    {
        return this.playerId;
    }

    public async getOwner()
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

    public setSettings(settings: IFactorySettings)
    {
        this.Settings = settings;
        this.settings = JSON.stringify(settings);
    }

    public static async From(dbobject: any): Promise<Factory>
    {
        const res = new Factory();
        res.id = dbobject.id;
        res.employeesCount = dbobject.employees_count;
        res.targetEmployees = dbobject.targetEmployees;
        res.salary = dbobject.salary;
        res.settings = dbobject.settings;
        res.Settings = JSON.parse(res.settings);
        res.playerId = dbobject.playerId;
        res.level = dbobject.level;
        res.marketId = dbobject.marketId;

        return res;
    }

    public static async GetById(id: number): Promise<Factory>
    {
        const data = await FactoryRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithPlayer(player: Player): Promise<Factory[]>
    {
        const data = await FactoryRepository().select().where("playerId", player.id);

        const res = new Array<Factory>();

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
        const res = await FactoryRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(factory: Factory)
    {
        await FactoryRepository().where("id", factory.id).update({
            employees_count: factory.employeesCount,
            targetEmployees: factory.targetEmployees,
            salary: factory.salary,
            settings: factory.settings,
            playerId: factory.playerId,
            level: factory.level,
            marketId: factory.marketId,
        });
    }

    public static async Create(marketId: number, playerId: number, employeesCount: number, salary: number): Promise<number>
    {
        const factory = new Factory();
        factory.playerId = playerId;
        factory.employeesCount = employeesCount;
        factory.targetEmployees = employeesCount;
        factory.salary = salary;
        factory.level = 1;
        factory.marketId = marketId;

        return this.Insert(factory);
    }

    public static async Insert(factory: Factory): Promise<number>
    {
        const d = await FactoryRepository().insert({
            id: factory.id,
            playerId: factory.playerId,
            employees_count: factory.employeesCount,
            targetEmployees: factory.targetEmployees,
            salary: factory.salary,
            settings: factory.settings,
            level: factory.level,
            marketId: factory.marketId,
        });

        factory.id = d[0];

        Logger.info("Created factory " + factory.id);

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const factory = await this.GetById(id);

        const queue = await ProductionQueue.GetWithFactory(factory);
        if (queue) {
            ProductionQueue.Delete(queue.id);
        }

        await FactoryRepository().delete().where("id", id);

        Log.LogText("Deleted factory id " + id);

        return true;
    }

    public static async All(): Promise<Factory[]>
    {
        const data = await FactoryRepository().select();
        const res = new Array<Factory>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export interface IFactorySettings
{
    testSetting: boolean;
}

export const FactoryRepository = () => Connection("Factories");