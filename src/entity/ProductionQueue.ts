import { Factory } from "./Factory";
import { Connection } from "DataBase";
import { Log } from "./Log";

export class ProductionQueue
{
    public id: number;
    public factoryId: number;

    public async getFactory(): Promise<Factory>
    {
        return Factory.GetById(this.factoryId);
    }
    public setFactory(factory: Factory)
    {
        this.factoryId = factory.id;
    }

    public queue: string;
    public Queue: IQueueEntry[];

    public static async From(dbobject: any)
    {
        const res = new ProductionQueue();
        res.id = dbobject.id;
        res.factoryId = dbobject.factoryId;
        res.queue = dbobject.queue;
        res.Queue = JSON.parse(res.queue);

        return res;
    }

    public static async Clear(id: number)
    {
        const queue = await this.GetById(id);

        if (!queue) {
            return;
        }

        queue.queue = "[]";
        queue.Queue = [];

        this.Update(queue);
    }

    public static async GetById(id: number): Promise<ProductionQueue>
    {
        const data = await ProductionQueueRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithFactory(factory: Factory): Promise<ProductionQueue>
    {
        const data = await ProductionQueueRepository().select().where("factoryId", factory.id).first();

        const res = new Array<ProductionQueue>();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async AddWithFactory(factory: Factory, entry: IQueueEntry)
    {
        let queueentry = await this.GetWithFactory(factory);

        if (!queueentry) {
            await this.Create(factory, [entry]);
            queueentry = await this.GetWithFactory(factory);
        }

        queueentry.Queue.push(entry);

        this.Update(queueentry);
    }

    public static async Update(queue: ProductionQueue)
    {
        queue.queue = JSON.stringify(queue.Queue);

        await ProductionQueueRepository().where("id", queue.id).update({
            factoryId: queue.factoryId,
            queue: queue.queue,
        });
    }

    public static async Create(factory: Factory, Queue: IQueueEntry[])
    {
        const entry = new ProductionQueue();
        entry.factoryId = factory.id;
        entry.Queue = Queue;
        entry.queue = JSON.stringify(Queue);

        this.Insert(entry);
    }

    public static async Insert(queue: ProductionQueue): Promise<number>
    {
        queue.queue = JSON.stringify(queue.Queue);

        const d = await ProductionQueueRepository().insert({
            id: queue.id,
            factoryId: queue.factoryId,
            queue: queue.queue,
        });

        queue.id = d[0];

        return d[0];
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await ProductionQueueRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Delete(id: number): Promise<boolean>
    {
        await ProductionQueueRepository().delete().where("id", id);

        Log.LogText("Deleted queue id " + id);

        return true;
    }

    public static async All(): Promise<ProductionQueue[]>
    {
        const data = await ProductionQueueRepository().select();
        const res = new Array<ProductionQueue>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

}

export interface IQueueEntry
{
    RecipeId: number;
    Amount: number;
}

export const ProductionQueueRepository = () => Connection("ProductionQueues");
