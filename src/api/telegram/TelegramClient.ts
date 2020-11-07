import * as TelegramBot from "node-telegram-bot-api";
import { bot } from "./TelegramApi";
import { PlayerService } from "services/PlayerService";
import { Player } from "entity/Player";
import { Factory } from "entity/Factory";
import { TelegramUser, TelegramUsersRepository } from "./TelegramUser";
import { RecipesService } from "services/RecipesService";
import { ProductionQueue, IQueueEntry } from "entity/ProductionQueue";
import { Good } from "entity/Good";
import { MarketService } from "services/MarketService";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Storage } from "entity/Storage";
import { MarketActor } from "entity/MarketActor";
import { PriceRecord } from "entity/PriceRecord";

export class TelegramClient
{
    public chatId: number;
    public userId: number;

    public playerId: number;
    public actorId: number;

    public attach(socket: TelegramBot.Message)
    {
        this.chatId = socket.chat.id;
        this.userId = socket.from.id;
    }

    public async on(msg: TelegramBot.Message)
    {
        const message = msg.text;

        const functions: Array<(message: string) => Promise<boolean>> = [
            this.OnLogin,
            this.OnRegister,
            this.CheckLogin,
            this.OnInfo,
            this.OnGoods,
            this.OnStorageView,
            this.OnFactoryQueueAdd,
            this.OnFactoryQueueClear,
            this.OnFactoryQueueDelete,
            this.OnFactoryQueueGet,
            this.OnFactorySetSalary,
            this.OnFactorySetWorkers,
            this.OnFactoryGet,
            this.OnFactories,
            this.OnMarketBuy,
            this.OnMarketBuyDelete,
            this.OnMarketBuyList,
            this.OnMarketSell,
            this.OnMarketSellDelete,
            this.OnMarketSellList,
            this.UnknownCommand,
        ];

        for (const f of functions) {
            const res = await f.call(this, message);

            if (res !== false) {
                break;
            }
        }
    }

    public static async Create(chatId: number, userId: number, playerId: number)
    {
        const res = new TelegramClient();
        res.chatId = chatId;
        res.userId = userId;
        res.playerId = playerId;

        await res.LoadActorId();

        return res;
    }

    public async LoadActorId()
    {
        const player = await Player.GetById(this.playerId);
        const actor = await player.getActor();

        this.actorId = actor.id;
    }

    public async OnLogin(message: string): Promise<boolean>
    {
        const loginregex = new RegExp("\/login (.+) (.+)");
        if (loginregex.test(message)) {
            const matches = loginregex.exec(message);

            const username = matches[1];
            const password = matches[2];

            const user = await PlayerService.Login(username, password);

            if (!user) {
                this.write(`Wrong login or password`);
                return;
            }

            this.playerId = user.id;

            const teleuser = TelegramUser.Create(this.chatId, this.userId, this.playerId);
            TelegramUser.Insert(teleuser);

            this.write(`Logined as ${username}`);
            return true;
        }

        return false;
    }

    public async OnRegister(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/register (.+) (.+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const username = matches[1];
            const password = matches[2];

            const user = await PlayerService.Register(username, password);

            if (!user) {
                this.write(`Registration failed`);
                return;
            }

            this.playerId = user;

            const teleuser = TelegramUser.Create(this.chatId, this.userId, this.playerId);
            TelegramUser.Insert(teleuser);

            this.write(`Registered as ${username}}`);

            return true;
        }

        return false;
    }

    public async OnInfo(message: string): Promise<boolean>
    {
        const inforegex = new RegExp("\/info");
        if (inforegex.test(message)) {

            const player = await Player.GetById(this.playerId);

            if (!player) {
                this.write("Something went wrong with retrieving player");
                return;
            }

            this.write(`Player: ${player.username}\n---\nCash: ${player.cash}`);

            return true;
        }

        return false;
    }

    public async OnFactoryGet(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return;
            }

            this.write(JSON.stringify(factory));

            return true;
        }

        return false;
    }

    public async OnFactorySetSalary(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) set salary ([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);
            const salary = Number.parseInt(matches[2], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return;
            }

            if (!salary) {
                this.write("Wrong salary");
                return;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return;
            }

            factory.salary = salary;

            Factory.Update(factory);

            this.write("Salary set to " + salary);

            return true;
        }

        return false;
    }

    public async OnFactorySetWorkers(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) set workers ([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);
            const workers = Number.parseInt(matches[2], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return;
            }

            if (!workers) {
                this.write("Wrong workers count");
                return;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return;
            }

            factory.targetEmployees = workers;

            Factory.Update(factory);

            this.write("Workers set to " + workers);

            return true;
        }

        return false;
    }

    public async OnFactoryQueueGet(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) queue$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return;
            }

            const dbo = await ProductionQueue.GetWithFactory(factory);

            if (!dbo) {
                await ProductionQueue.Create(factory, []);
                return;
            }

            const queue = dbo.Queue;

            this.writeList<IQueueEntry>(queue, (x) => x.Order, (x) => `Recipe: ${x.RecipeId}, Amount: ${x.Amount}`, "Factory production queue");

            return true;
        }

        return false;
    }

    public async OnFactoryQueueClear(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) queue clear$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return;
            }

            const queue = await ProductionQueue.GetWithFactory(factory);

            if (!queue) {
                return;
            }

            ProductionQueue.Clear(queue.id);

            this.write("Queue cleared");

            return true;
        }

        return false;
    }

    public async OnFactoryQueueAdd(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) queue add ([0-9]+) ([0-9]*)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);
            const recipeid = Number.parseInt(matches[2], 10);
            let amount = Number.parseInt(matches[3], 10);

            if (!amount) {
                amount = 1;
            }

            if (!factoryid) {
                this.write("Wrong factory id");
                return true;
            }

            if (!recipeid) {
                this.write("Wrong recipe id");
                return true;
            }

            const factory = await Factory.GetById(factoryid);
            const recipe = RecipesService.GetById(recipeid);

            if (!factory) {
                this.write("No such factory");
                return true;
            }

            if (!recipe) {
                this.write("No such recipe");
                return true;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return true;
            }

            await ProductionQueue.AddWithFactory(factory, {
                RecipeId: recipeid,
                Amount: amount,
            });

            this.write("Queue updated");

            return true;
        }

        return false;
    }

    public async OnFactoryQueueDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory ([0-9]+) queue delete ([0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const factoryid = Number.parseInt(matches[1], 10);
            const orderid = Number.parseInt(matches[2], 10);

            if (!factoryid) {
                this.write("Wrong factory id");
                return true;
            }

            if (!orderid) {
                this.write("Wrong order id");
                return true;
            }

            const factory = await Factory.GetById(factoryid);

            if (!factory) {
                this.write("No such factory");
                return true;
            }

            if (factory.getOwnerId() !== this.playerId) {
                this.write("That's not your factory");
                return true;
            }

            const dbo = await ProductionQueue.GetWithFactory(factory);

            if (!dbo) {
                await ProductionQueue.Create(factory, []);
                return;
            }

            dbo.Queue = dbo.Queue.filter((x) => x.Order !== orderid);

            await ProductionQueue.Update(dbo);

            this.write("Queue updated");

            return true;
        }

        return false;
    }

    public async OnFactories(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/factory$");
        if (registerregex.test(message)) {

            const factories = await Player.GetFactoriesById(this.playerId);

            this.writeList<Factory>(factories,
                (x) => x.id,
                (x) => `Employees: ${x.employeesCount} / ${x.targetEmployees}, salary: ${x.salary}`,
                "Your factories");

            return true;
        }

        return false;
    }

    public async OnRecipes(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/recipe list");
        if (registerregex.test(message)) {

            const recipes = RecipesService.All;

            for (const recipe of recipes) {
                this.write(JSON.stringify(recipe));
            }

            return true;
        }

        return false;
    }

    public async OnGoods(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/goods");
        if (registerregex.test(message)) {

            const goods = await Good.All();

            this.writeList<Good>(goods, (x) => x.id, async (x) =>
            {
                const lastrecord = await PriceRecord.GetLatestWithGood(x);

                if (lastrecord) {
                    return `${x.name}, price: ${lastrecord.minprice}-${lastrecord.maxprice} traded ${lastrecord.tradeamount}`;
                }
                else {
                    return `${x.name}`;
                }
            });

            return true;
        }

        return false;
    }

    public async OnMarketBuy(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market buy add ([0-9]+) ([0-9]+) ([0-9]*)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const goodid = Number.parseInt(matches[1], 10);
            const price = Number.parseInt(matches[2], 10);
            let amount = Number.parseInt(matches[3], 10);

            if (!amount) {
                amount = 1;
            }

            if (!goodid) {
                this.write("Wrong good id");
                return;
            }

            const good = await Good.GetById(goodid);

            if (!good) {
                this.write("No such good");
                return;
            }

            const player = await Player.GetById(this.playerId);
            const actor = await player.getActor();

            const id = await MarketService.AddBuyOffer(actor, good, amount, price);

            this.write("Added buy offer id " + id);

            return true;
        }

        return false;
    }

    public async OnMarketBuyDelete(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market buy delete ([0-9]+)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const offerid = Number.parseInt(matches[1], 10);

            if (!offerid) {
                this.write("Wrong offer id");
                return;
            }

            const offer = await BuyOffer.GetById(offerid);

            if (offer.getActorId() !== this.actorId) {
                this.write("That's not your offer");
                return;
            }

            await BuyOffer.Delete(offer.id);

            this.write("Deleted buy offer id " + offer.id);

            return true;
        }

        return false;
    }

    public async OnMarketBuyList(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/market buy$");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.playerId);
            const actor = await player.getActor();

            const res = await BuyOffer.GetWithActor(actor.id);

            this.writeList<BuyOffer>(res, (x) => x.id, async (x) => `${x.amount} ${(await x.getGood()).name} for ${x.price} each`);

            return true;
        }

        return false;
    }

    public async OnMarketSell(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/market sell add ([0-9]+) ([0-9]+) ([0-9]*)");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const goodid = Number.parseInt(matches[1], 10);
            const price = Number.parseInt(matches[2], 10);
            let amount = Number.parseInt(matches[3], 10);

            if (!amount) {
                amount = 1;
            }

            if (!goodid) {
                this.write("Wrong good id");
                return;
            }

            const good = await Good.GetById(goodid);

            if (!good) {
                this.write("No such good");
                return;
            }

            const player = await Player.GetById(this.playerId);
            const actor = await player.getActor();

            const id = await MarketService.AddSellOffer(actor, good, amount, price);

            this.write("Added sell offer id " + id);

            return true;
        }

        return false;
    }

    public async OnMarketSellDelete(message: string): Promise<boolean>
    {
        const marketsellregex = new RegExp("\/market sell delete ([0-9]+)");
        if (marketsellregex.test(message)) {
            const matches = marketsellregex.exec(message);

            const offerid = Number.parseInt(matches[1], 10);

            if (!offerid) {
                this.write("Wrong offer id");
                return;
            }

            const offer = await SellOffer.GetById(offerid);

            if (offer.getActorId() !== this.actorId) {
                this.write("That's not your offer");
                return;
            }

            await SellOffer.Delete(offer.id);

            this.write("Deleted sell offer id " + offer.id);

            return true;
        }

        return false;
    }

    public async OnMarketSellList(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^\/market sell$");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.playerId);
            const actor = await player.getActor();

            const res = await SellOffer.GetWithActor(actor.id);

            this.writeList<SellOffer>(res, (x) => x.id, async (x) => `${x.amount} ${(await x.getGood()).name} for ${x.price} each`);

            return true;
        }

        return false;
    }

    public async OnStorageView(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/storage");
        if (registerregex.test(message)) {

            const player = await Player.GetById(this.playerId);
            const actor = await player.getActor();

            const storages = await Storage.GetWithActor(actor);

            this.writeList<Storage>(storages,
                async (x) => (await x.getGood()).name + ` (${x.id})`,
                (x) => x.amount + "",
                "Your storage");

            return true;
        }

        return false;
    }

    public async CheckLogin(message: string): Promise<boolean>
    {
        if (!this.playerId) {
            this.write("You need to login first");
            return true;
        }

        return false;
    }

    public async UnknownCommand(message: string): Promise<boolean>
    {
        this.write("Unknown command");
        return true;
    }

    public async write(msg: string)
    {
        console.log(msg);

        await bot.sendMessage(this.chatId, msg, {
            parse_mode: "Markdown",
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
