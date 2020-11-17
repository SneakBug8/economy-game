import { State } from "../State";
import { Factory } from "entity/Factory";
import { ProductionQueue, IQueueEntry } from "entity/ProductionQueue";
import { RecipesService } from "services/RecipesService";
import * as TelegramBot from "node-telegram-bot-api";
import { FactoriesState } from "./FactoriesState";
import { MainState } from "./MainState";

export class FactoryState extends State
{
    constructor(factoryid: number)
    {
        super();

        this.factoryId = factoryid;

        this.functions = [
            this.OnFactoryQueueAdd,
            this.OnFactoryQueueClear,
            this.OnFactoryQueueDelete,
            this.OnFactoryQueueGet,
            this.OnFactorySetSalary,
            this.OnFactorySetWorkers,
            this.OnInfo,
            this.OnBack,
        ];
    }

    private factoryId;

    public async init()
    {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]>
    {
        const res: TelegramBot.KeyboardButton[][] = [];

        res.push([{ text: "📊/set salary" }, { text: "👨‍🏭/set workers" }]);
        res.push([{ text: "🧮 /queue" }, { text: "✅ /queue add" } ]);
        res.push([{ text: "⛔️ /queue delete" }, { text: "❌ /queue clear" }]);

        res.push([{ text: "📄 /info" }, { text: "📄 /help" }, { text: "❌ /back" }]);

        return res;
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("/info$");
        if (registerregex.test(message)) {

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                this.OnBack("/back");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            this.Client.write(`Factory ${factory.id}\nEmployees: ${factory.employeesCount} / ${factory.getTargetEmployees()}\nSalary: ${factory.salary}`);

            return true;
        }

        return false;
    }

    public async OnFactorySetSalary(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/set salary");
        if (registerregex.test(message)) {
            this.waitingForValue = true;
            this.waitingCallback = this.waitingForSalary;

            this.Client.write("Write salary size");

            return true;
        }

        return false;
    }

    private async waitingForSalary(message: string): Promise<boolean> {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const salary = Number.parseInt(matches[1], 10);

            /*if (!salary) {
                this.Client.write("Wrong salary");
                return;
            }*/

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            factory.salary = salary;

            Factory.Update(factory);

            this.Client.write("Salary set to " + salary);

            return true;
        }

        this.Client.write(`You entered wrong amount. Use only numbers`);

        return false;
    }

    public async OnFactorySetWorkers(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/set workers");
        if (registerregex.test(message)) {
            this.waitingForValue = true;
            this.waitingCallback = this.waitingForWorkers;

            this.Client.write("Write desirable workers count");

            return true;
        }

        return false;
    }

    public async waitingForWorkers(message: string): Promise<boolean> {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const workers = Number.parseInt(matches[1], 10);

            if (!this.factoryId) {
                this.Client.write("Wrong factory id");
                return;
            }

            if (!workers) {
                this.Client.write("Wrong workers count");
                return;
            }

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            factory.setTargetEmployees(workers);

            Factory.Update(factory);

            this.Client.write("Workers set to " + workers);

            return true;
        }

        this.Client.write(`You entered wrong count. Use only numbers`);

        return false;
    }

    public async OnFactoryQueueGet(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/queue$");
        if (registerregex.test(message)) {

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            const dbo = await ProductionQueue.GetWithFactory(factory);

            if (!dbo) {
                await ProductionQueue.Create(factory, []);
                return;
            }

            const queue = dbo.Queue;

            this.Client.writeList<IQueueEntry>(queue,
                (x) => x.Order,
                (x) => `Recipe: ${x.RecipeId}, Amount: ${x.Amount}`, "Factory production queue");

            return true;
        }

        return false;
    }

    public async OnFactoryQueueClear(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/queue clear$");
        if (registerregex.test(message)) {

            if (!this.factoryId) {
                this.Client.write("Wrong factory id");
                return;
            }

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return;
            }

            const queue = await ProductionQueue.GetWithFactory(factory);

            if (!queue) {
                return;
            }

            ProductionQueue.Clear(queue.id);

            this.Client.write("Queue cleared");

            return true;
        }

        return false;
    }

    private recipeId;

    public async OnFactoryQueueAdd(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/queue add$");
        if (registerregex.test(message)) {
            this.setWaitingForValue(this.waitingQueueAddRecipe);

            this.Client.write("Write recipe id");

            return true;
        }

        return false;
    }

    public async waitingQueueAddRecipe(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const recipeid = Number.parseInt(matches[1], 10);

            if (!this.factoryId) {
                this.Client.write("Wrong factory id");
                return true;
            }

            if (!recipeid) {
                this.Client.write("Wrong recipe id");
                return true;
            }

            const factory = await Factory.GetById(this.factoryId);
            const recipe = RecipesService.GetById(recipeid);

            if (!factory) {
                this.Client.write("No such factory");
                return true;
            }

            if (!recipe) {
                this.Client.write("No such recipe");
                return true;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return true;
            }

            this.recipeId = recipeid;

            this.waitingForValue = true;
            this.waitingCallback = this.waitingQueueAddAmount;

            this.Client.write("Write amount");

            return true;
        }

        this.Client.write(`You entered wrong recipe. Use only numbers`);

        return false;
    }

    public async waitingQueueAddAmount(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            let amount = Number.parseInt(matches[1], 10);

            if (!amount) {
                amount = 1;
            }

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return true;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return true;
            }

            await ProductionQueue.AddWithFactory(factory, {
                RecipeId: this.recipeId,
                Amount: amount,
            });

            this.Client.write("Queue entry was added");

            return true;
        }

        this.Client.write(`You entered wrong amount. Use only numbers`);

        return false;
    }

    public async OnFactoryQueueDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/queue delete$");
        if (registerregex.test(message)) {

            this.waitingForValue = true;
            this.waitingCallback = this.waitingQueueDelete;

            this.Client.write("Write entry order number");

            return true;
        }

        return false;
    }

    public async waitingQueueDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const orderid = Number.parseInt(matches[1], 10);

            if (!orderid) {
                this.Client.write("Wrong order id");
                return true;
            }

            const factory = await Factory.GetById(this.factoryId);

            if (!factory) {
                this.Client.write("No such factory");
                return true;
            }

            if (factory.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your factory");
                return true;
            }

            const dbo = await ProductionQueue.GetWithFactory(factory);

            if (!dbo) {
                await ProductionQueue.Create(factory, []);
                return;
            }

            dbo.Queue = dbo.Queue.filter((x) => x.Order !== orderid);

            await ProductionQueue.Update(dbo);

            this.Client.write("Queue updated");

            return true;
        }

        this.Client.write(`You entered wrong id. Use only numbers`);

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
            this.Client.setState(new FactoriesState());
            return true;
        }

        return false;
    }
}