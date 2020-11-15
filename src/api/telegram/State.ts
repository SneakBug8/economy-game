import { TelegramClient } from "./TelegramClient";
import * as TelegramBot from "node-telegram-bot-api";

export class State {
    public Client: TelegramClient;
    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]> {
        throw new Error("Not implemented exception");
    }

    protected functions: Array<(message: string) => Promise<boolean>> = [];

    protected waitingForValue: boolean = false;
    protected waitingCallback: (message: string) => Promise<boolean> = null;

    public async init() {

    }

    protected setWaitingForValue(callback: (message: string) => Promise<boolean>) {
        this.waitingForValue = true;
        this.waitingCallback = callback;
    }

    public async on(msg: TelegramBot.Message) {
        const message = msg.text;

        if (this.waitingForValue) {
            this.waitingForValue = false;

            await this.waitingCallback.call(this, message);

            return true;
        }

        for (const f of this.functions) {
            const res = await f.call(this, message);

            if (res !== false) {
                return true;
            }
        }

        return false;
    }
}