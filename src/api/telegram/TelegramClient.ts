import * as TelegramBot from "node-telegram-bot-api";
import { bot } from "./TelegramApi";
import { Player } from "entity/Player";
import { State } from "./State";
import { MainState } from "./states/MainState";
import { BlankState } from "./states/BlankState";
import { AdminCommands } from "./AdminCommands";
import { Logger } from "utility/Logger";

export class TelegramClient
{
    constructor()
    {
        this.setState(new BlankState(), true);
    }

    public chatId: number;
    public userId: number;

    public playerId: number;
    public actorId: number;

    public State: State;

    public isAdmin: boolean;

    public attach(socket: TelegramBot.Message)
    {
        this.chatId = socket.chat.id;
        this.userId = socket.from.id;
    }

    public setState(state: State, silent: boolean = false)
    {
        this.State = state;
        state.Client = this;

        if (!silent) {
            state.init();
        }
    }

    public async on(msg: TelegramBot.Message)
    {
        Logger.info(`from ${this.userId}: ${msg.text}`);

        if (this.isAdmin) {
            const res = await this.State.on(msg);
            if (res) {
                return;
            }
        }
        const res = await this.State.on(msg);
        if (!res) {
            this.UnknownCommand();
        }
    }

    public static async Create(chatId: number, userId: number, playerId: number, isAdmin: boolean = false)
    {
        const res = new TelegramClient();
        res.chatId = chatId;
        res.userId = userId;
        res.playerId = playerId;
        res.isAdmin = isAdmin;

        await res.LoadActorId();

        res.setState(new MainState(), true);

        return res;
    }

    public async LoadActorId()
    {
        const player = await Player.GetById(this.playerId);
        const actor = await player.getActor();

        this.actorId = actor.id;
    }

    public async CheckLogin(): Promise<boolean>
    {
        if (!this.playerId) {
            this.write("You need to login first");
            return true;
        }

        return false;
    }

    public async UnknownCommand(): Promise<boolean>
    {
        this.write("Unknown command");
        return true;
    }

    public async write(msg: string)
    {
        Logger.info(`to ${this.userId}: ${msg}`);

        await bot.sendMessage(this.chatId, msg, {
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: await this.State.getKeyboard()
            }
        });
    }

    public async writeList<T>(array: T[],
                              idselector: (entry: T) => number | string | Promise<string>,
                              formatter: (entry: T) => number | string | Promise<string>,
                              header?: string)
    {
        let buffer = (header) ? `**${header}**\n---\n` : "";

        for (const entry of array) {
            const idnumber = await idselector(entry);
            const text = await formatter(entry);

            buffer += "\`" + idnumber + "\` " + text + "\n";
        }

        if (buffer) {
            await this.write(buffer);
        }
        else {
            await this.write("No entries to show");
        }
    }
}
