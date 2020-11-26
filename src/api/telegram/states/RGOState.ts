import { State } from "../State";
import * as TelegramBot from "node-telegram-bot-api";
import { RGO } from "entity/RGO";
import { RGOsState } from "./RGOsState";

export class RGOState extends State
{
    constructor(rgoId: number)
    {
        super();

        this.rgoId = rgoId;

        this.functions = [
            this.OnRGOSetSalary,
            this.OnRGOSetWorkers,
            this.OnInfo,
            this.OnBack,
        ];
    }

    private rgoId;

    public async init()
    {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]>
    {
        const res: TelegramBot.KeyboardButton[][] = [];

        res.push([{ text: "📊/set salary" }, { text: "👨‍🏭/set workers" }]);

        res.push([{ text: "📄 /info" }, { text: "📄 /help" }, { text: "❌ /back" }]);

        return res;
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("/info$");
        if (registerregex.test(message)) {

            const rgo = await RGO.GetById(this.rgoId);

            if (!rgo) {
                this.Client.write("No such RGO");
                this.OnBack("/back");
                return;
            }

            if (rgo.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your RGO");
                return;
            }

            const description = await RGO.GetDescription(rgo.id);

            this.Client.write(`RGO ${rgo.id}\n${description}\nEmployees: ${rgo.employeesCount} / ${rgo.getTargetEmployees()}\nSalary: ${rgo.salary}`);

            return true;
        }

        return false;
    }

    public async OnRGOSetSalary(message: string): Promise<boolean>
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

            const rgo = await RGO.GetById(this.rgoId);

            if (!rgo) {
                this.Client.write("No such RGO");
                return;
            }

            if (rgo.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your RGO");
                return;
            }

            rgo.salary = salary;

            RGO.Update(rgo);

            this.Client.write("Salary set to " + salary);

            return true;
        }

        this.Client.write(`You entered wrong amount. Use only numbers`);

        return false;
    }

    public async OnRGOSetWorkers(message: string): Promise<boolean>
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

            if (!this.rgoId) {
                this.Client.write("Wrong RGO id");
                return;
            }

            if (!workers) {
                this.Client.write("Wrong workers count");
                return;
            }

            const rgo = await RGO.GetById(this.rgoId);

            if (!rgo) {
                this.Client.write("No such RGO");
                return;
            }

            if (rgo.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your RGO");
                return;
            }

            rgo.setTargetEmployees(workers);

            RGO.Update(rgo);

            this.Client.write("Workers set to " + workers);

            return true;
        }

        this.Client.write(`You entered wrong count. Use only numbers`);

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
            this.Client.setState(new RGOsState());
            return true;
        }

        return false;
    }
}