process.env.NTBA_FIX_319 = "true";

import * as TelegramBot from "node-telegram-bot-api";
import { TelegramClient } from "./TelegramClient";
import { TelegramUser } from "./TelegramUser";
import { Runner } from "Runner";
import { IApiProvider } from "api/ApiProvider";
import { Player } from "entity/Player";

// replace the value below with the Telegram token you receive from @BotFather
const token = "802583168:AAFO15UjYkoksdC2iJIen34PdkXynC-_yvM";

// Create a bot that uses 'polling' to fetch new updates
export const bot = new TelegramBot(token, { polling: true });

const clients = new Array<TelegramClient>();

bot.onText(/\/connect/, async (msg) =>
{
    const user = await TryTelegramUser(msg.from.id);

    if (!user) {
        MakeNewUser(msg);
    }
});

bot.on("message", async (msg) =>
{
    // Pass down messages to TelegramClients
    const res = PassMessageToClient(msg);

    if (res) {
        return;
    }

    // Also try to auth if it's wrong
    const existinguser = await TryTelegramUser(msg.from.id);

    if (!existinguser) {
        MakeNewUser(msg);
    }

    const newres = PassMessageToClient(msg);
    if (!newres) {

    }
});

function PassMessageToClient(msg: TelegramBot.Message)
{
    for (const client of clients) {
        if (client.chatId === msg.chat.id && client.userId === msg.from.id) {
            client.on(msg);
            return true;
        }
    }

    return false;
}

// Try to auth by DB records and telegram user id
async function TryTelegramUser(userId: number): Promise<boolean>
{
    const telegramuser = await TelegramUser.GetByUser(userId);

    if (telegramuser) {
        const r1 = await Player.GetById(telegramuser.playerId);
        if (!r1.result) {
            return false;
        }
        const player = r1.data;

        const client = await TelegramClient.Create(telegramuser.chatId, telegramuser.userId, telegramuser.playerId, player.isAdmin !== 0);

        // client.write("Connected and logined.");

        clients.push(client);

        return true;
    }

    return false;
}

// Default process of auth
async function MakeNewUser(msg: TelegramBot.Message): Promise<boolean>
{
    const client = new TelegramClient();
    client.attach(msg);
    clients.push(client);

    return true;
}

export class TelegramApiProvider implements IApiProvider
{
    public async sendOffline(playerId: number, message: string)
    {
        const user = await TelegramUser.GetByPlayer(playerId);

        if (!user) {
            return;
        }

        const client = await TelegramClient.Create(user.chatId, user.userId, user.playerId);

        client.write(message);
    }
    public async broadcast(message: string)
    {
        const users = await TelegramUser.All();

        if (!users) {
            return;
        }

        for (const user of users) {

            const client = await TelegramClient.Create(user.chatId, user.userId, user.playerId);
            client.write(message);
        }
    }
}

Runner.ApiProvider = new TelegramApiProvider();