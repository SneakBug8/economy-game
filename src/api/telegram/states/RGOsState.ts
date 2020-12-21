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
        return false;
    }

    public async OnTypes(message: string): Promise<boolean>
    {
        return false;
    }

    private async formResourcesString(x: RGOType) {
        let res = "";
        const costs = Config.RGOCostsDictionary.get(x.id);

        for (const req of costs) {
            const good = await Good.GetById(req.GoodId);
            res += `${req.Amount} ${good.name}`;
        }

        return res;
    }

    public async OnInfo(message: string): Promise<boolean>
    {
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