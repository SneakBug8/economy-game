import { Connection } from "DataBase";
import { Player } from "entity/Player";
import { Log } from "entity/Log";

// Used to autologin player from telegram to his account
export class TelegramUser
{
    public chatId: number;
    public userId: number;
    public playerId: number;

    public static async From(dbobject: any)
    {
        const res = new TelegramUser();
        res.chatId = dbobject.chatId;
        res.userId = dbobject.userId;
        res.playerId = dbobject.playerId;

        return res;
    }

    public static Create(chatId: number, userId: number, playerId: number)
    {
        const res = new TelegramUser();
        res.chatId = chatId;
        res.userId = userId;
        res.playerId = playerId;

        return res;
    }

    public static async GetByUser(userId: number): Promise<TelegramUser>
    {
        const data = await TelegramUsersRepository().select().where("userId", userId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public async GetPlayer() {
        return Player.GetById(this.playerId);
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await TelegramUsersRepository().count("userId as c").where("userId", id).first() as any;

        return res.c > 0;
    }

    public static async Update(user: TelegramUser): Promise<number>
    {
        const d = await TelegramUsersRepository().where("userId", user.userId).update({
            playerId: user.playerId,
            chatId: user.chatId,
        });

        return d[0];
    }


    public static async Insert(user: TelegramUser): Promise<number>
    {
        const d = await TelegramUsersRepository().insert({
            userId: user.userId,
            chatId: user.chatId,
            playerId: user.playerId,
        });

        Log.LogText("Created TelegramUser " + user.userId);

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const player = await this.GetByUser(id);
        if (!player) {
            return false;
        }

        await TelegramUsersRepository().delete().where("userId", id);

        Log.LogText("Deleted TelegramUser id " + id);

        return true;
    }

    public static async All(): Promise<TelegramUser[]>
    {
        const data = await TelegramUsersRepository().select();
        const res = new Array<TelegramUser>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }
}

export const TelegramUsersRepository = () => Connection<TelegramUser>("TelegramUsers");
