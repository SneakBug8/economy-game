process.env.NTBA_FIX_319 = "true";

import * as TelegramBot from "node-telegram-bot-api";
import { TelegramClient } from "./TelegramClient";
import { TelegramUser } from "./TelegramUser";

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

    PassMessageToClient(msg);
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
        const client = await TelegramClient.Create(telegramuser.chatId, telegramuser.userId, telegramuser.playerId);

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

    client.write("Now login or register");

    return true;
}