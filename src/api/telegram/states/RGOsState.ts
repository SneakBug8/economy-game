import { State } from "../State";
import { Player } from "entity/Player";
import { MainState } from "./MainState";
import * as TelegramBot from "node-telegram-bot-api";
import { FactoryState } from "./FactoryState";
import { RGO } from "entity/RGO";
import { RGOManagementService } from "services/RGOManagementService";
import { RGOState } from "./RGOState";
import { RGOType } from "entity/RGOType";
import { Config } from "config";
import { Good } from "entity/Good";

export class RGOsState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnRGOId,
            this.OnBuild,
            this.OnDestroy,
            this.OnTypes,
            this.OnInfo,
            this.OnHelp,
            this.OnBack,
        ];
    }

    public async init()
    {
        this.OnInfo("/info");
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]>
    {
        const res: TelegramBot.KeyboardButton[][] = [];
        const rgos = await Player.GetRGOsById(
            await Player.GetCurrentMarketId(this.Client.playerId),
            this.Client.playerId,
            );

        let subres: TelegramBot.KeyboardButton[] = [];
        for (const rgo of rgos) {
            subres.push({ text: "⛏ " + rgo.id + "" });
            if (subres.length >= 3) {
                res.push(subres);
                subres = [];
            }
        }

        if (subres.length > 0) {
            res.push(subres);
            subres = [];
        }

        res.push([{ text: "📄 /types" }, { text: "⚙️ /build" }, { text: "💣 /destroy" }],
            [{ text: "📄 /info" }, { text: "📄 /help" }, { text: "❌ /back" }]);

        return res;
    }

    public async OnRGOId(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const rgoid = Number.parseInt(matches[1], 10);

            const rgo = await RGO.GetById(rgoid);

            if (!rgo) {
                this.Client.write("No such RGO");
                return;
            }

            if (rgo.getOwnerId() !== this.Client.playerId) {
                this.Client.write("That's not your RGO");
                return;
            }

            this.Client.setState(new RGOState(rgoid));

            return true;
        }

        return false;
    }

    public async OnBuild(message: string): Promise<boolean>
    {
        const regex = new RegExp("\/build$");
        if (regex.test(message)) {
            this.setWaitingForValue(this.waitingOnBuild);

            this.Client.write("Now write RGO type id");
            return true;
        }

        return false;
    }

    private async waitingOnBuild(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const player = await Player.GetById(this.Client.playerId);

            const rgotypeid = Number.parseInt(matches[1], 10);

            const result = await RGOManagementService.ConstructNew(player.id, rgotypeid);

            if (typeof result !== "number") {
                this.Client.write(result as string);
                return true;
            }

            this.Client.write(`Successfuly built RGO with id ${result}`);

            return true;
        }

        this.Client.write(`You entered wrong type. Use only numbers`);

        return false;
    }

    public async OnDestroy(message: string): Promise<boolean>
    {
        const regex = new RegExp("\/destroy$");
        if (regex.test(message)) {
            this.setWaitingForValue(this.waitingOnDestroy);
            return true;
        }

        return false;
    }

    private async waitingOnDestroy(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const player = await Player.GetById(this.Client.userId);

            const rgotypeid = Number.parseInt(matches[1], 10);

            const result = await RGOManagementService.Destroy(player.id, rgotypeid);

            if (typeof result !== "number") {
                this.Client.write(result as string);
                return true;
            }

            this.Client.write(`Successfuly destroyed RGO with id ${result}`);

            return true;
        }

        this.Client.write(`You entered wrong type. Use only numbers`);

        return false;
    }

    public async OnTypes(message: string): Promise<boolean>
    {
        const regex = new RegExp("\/types$");
        if (regex.test(message)) {
            const types = await RGOType.All();

            this.Client.writeList<RGOType>(types,
                (x) => x.id,
                async (x) => `${x.name}. Makes ${(await x.getGood()).name}, takes ${1 / x.efficiency} workers. ` +
                `Max in world: ${x.maxAmount}. Already in world: ${await RGOManagementService.CountOfType(x.id)}. ` +
                `Resources to build: ${await this.formResourcesString(x)}`,
                "All types of RGO you can build");

            return true;
        }

        return false;
    }

    private async formResourcesString(x: RGOType) {
        let res = "";
        const costs = Config.RGOCostsDictionary.get(x.id);

        for (const req of costs) {
            const good = await Good.GetById(req.goodId);
            res += `${req.Amount} ${good.name}`;
        }

        return res;
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        const regex = new RegExp("\/info$");
        if (regex.test(message)) {
            const rgos = await Player.GetRGOsById(
                await Player.GetCurrentMarketId(this.Client.playerId),
                this.Client.playerId,
                );

            this.Client.writeList<RGO>(rgos,
                (x) => x.id,
                (x) => `Employees: ${x.employeesCount} / ${x.targetEmployees}, salary: ${x.salary}`,
                "Your RGOs");

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