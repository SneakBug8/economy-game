import * as express from "express";
import { body, param, query, validationResult } from "express-validator";
import * as bodyParser from "body-parser";
import { PlayerService } from "services/PlayerService";
import { Good } from "entity/Good";
import { PriceRecord } from "entity/PriceRecord";
import { RecipesService } from "services/RecipesService";
import { RGOType } from "entity/RGOType";
import { RGOManagementService } from "services/RGOManagementService";
import { Config } from "config";
import { Player } from "entity/Player";
import { Storage } from "entity/Storage";
import { Factory } from "entity/Factory";
import { RGO } from "entity/RGO";
import { ProductionQueue } from "entity/ProductionQueue";
import { FactoryManagementService } from "services/FactoryManagementService";
import { PlayerLog } from "entity/PlayerLog";
import { MarketService } from "services/MarketService";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";
import { StorageService } from "services/StorageService";
import { Market } from "entity/Market";
import { RGOMarketToType } from "entity/RGOMarketToType";
import { RGOService } from "services/RGOService";
import { LogisticsService } from "services/LogisticsService";

export class WebClientRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        // router.use(this.LoadBackLink);

        router.get("/", this.onHome);

        router.use(bodyParser.urlencoded({ extended: true }));

        router.get("/register", this.onRegister);
        router.post("/register", [
            body("login", "Empty login").trim().isLength({ min: 4 }).escape(),
            body("password", "Empty password").notEmpty(),
            body("password", "Password too short").trim().isLength({ min: 6 }).escape(),
            body("passwordconfirm", "Empty passwordconfirmation").trim().isLength({ min: 6 }).escape(),
            body("passwordconfirm", "Pasword confirm must be same as password").custom((value, { req }) => req.body && req.body.password === value),
        ], this.registerAction);

        router.get("/login", this.onLogin);
        router.post("/login", [
            body("login", "Empty login").trim().isLength({ min: 1 }).escape(),
            body("password", "Empty password").trim().isLength({ min: 1 }).escape(),
        ], this.loginAction);

        router.get("/goods", this.onGoods);
        router.get("/recipes", this.onRecipes);
        router.get("/rgotypes", this.onRGOTypes);

        router.use(WebClientUtil.RedirectUnlogined);

        router.get("/factories", this.onFactories);
        router.post("/factory/:id([0-9]+)/salary", [
            body("salary").isNumeric(),
        ], this.factorySalaryAction);
        router.post("/factory/:id([0-9]+)/workers", [
            body("workers").isNumeric(),
        ], this.factoryWorkersAction);
        router.get("/factory/:id([0-9]+)/upgrade", this.onFactoryUpgrade);
        router.get("/factory/:id([0-9]+)/delete", this.factoryDeleteAction);
        router.get("/factory/:id([0-9]+)/queue", [WebClientUtil.LoadRecipes], this.onFactoryProductionQueue);
        router.get("/factory/:id([0-9]+)/queue/delete/:order([0-9]+)", this.onFactoryProductionQueueDelete);
        router.post("/factory/:id([0-9]+)/queue/add", [
            body("recipeId", "Wrong recipeId").isNumeric(),
            body("amount", "Wrong amount").isNumeric(),
        ], this.onFactoryProductionQueueAdd);
        router.get("/factory/build", this.factoryBuildAction);

        router.get("/rgos", [WebClientUtil.LoadBuildableTypes], this.onRGOs);
        router.get("/rgo/:id([0-9]+)/delete", this.rgoDeleteAction);
        router.get("/rgo/:id([0-9]+)/upgrade", this.onRGOUpgrade);
        router.post("/rgo/:id([0-9]+)/salary", [
            body("salary").isNumeric(),
        ], this.rgoSalaryAction);
        router.post("/rgo/:id([0-9]+)/workers", [
            body("workers").isNumeric(),
        ], this.rgoWorkersAction);
        router.post("/rgo/build", [
            body("typeId").isNumeric(),
        ], this.rgoBuildAction);

        router.get("/storage", [
            WebClientUtil.LoadGoods,
            WebClientUtil.LoadLogisticRoutes],
            this.onStorage);
        router.post("/storage/transfer", [
            body("goodId", "Wrong goodId").isNumeric().notEmpty(),
            body("amount", "Wrong amount").isNumeric().notEmpty(),
            body("routeId", "Wrong routeId").isNumeric().notEmpty(),
        ],
            this.onStorageTransferAction);
        router.post("/storage/send", [
            body("username", "Wrong username").isAlphanumeric().notEmpty().trim().escape(),
            body("goodId", "Wrong goodId").isNumeric().notEmpty(),
            body("amount", "Wrong amount").isNumeric().notEmpty(),
        ],
            this.onStorageSendAction);

        /*router.post("/money/send", [
            body("username", "Wrong username").isAlphanumeric().notEmpty().trim().escape(),
            body("amount", "Wrong amount").isNumeric().notEmpty(),
        ],
            this.onMoneySendAction);*/

        router.get("/markets", this.onMarkets);
        router.get("/market/:id([0-9]+)", this.onMarket);
        router.post("/market/:id([0-9]+)/buy", [
            body("price").isNumeric(),
            body("amount").isNumeric(),
        ], this.onMarketBuy);
        router.post("/market/:id([0-9]+)/sell", [
            body("price").isNumeric(),
            body("amount").isNumeric(),
        ], this.onMarketSell);
        router.get("/market/:id([0-9]+)/redeembuy/:offer([0-9]+)",
            [
                query("amount").isNumeric().optional(),
            ]
            , this.onMarketRedeemBuy);
        router.get("/market/:id([0-9]+)/redeemsell/:offer([0-9]+)", [
            query("amount").isNumeric().optional(),
        ], this.onMarketRedeemSell);

        router.get("/buyoffer/:id([0-9]+)/delete", this.onDeleteBuyOffer);
        router.get("/selloffer/:id([0-9]+)/delete", this.onDeleteSellOffer);

        router.get("/logout", this.onLogout);

        return router;
    }

    /*public static LoadBackLink(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (!req.client || !req.client.getUrl()) {
            res.locals.backurl = "/";
            next();
            return;
        }

        if (req.url === req.client.getUrl()) {
            console.log("pop");
            req.client.popUrl();
            console.log(req.client.getUrl());
        }

        res.locals.backurl = req.client.getUrl();
        next();
    }*/

    public static async onHome(req: IMyRequest, res: express.Response)
    {
        if (!WebClientUtil.isLogined(req)) {
            WebClientUtil.render(req, res, "unlogined");
            return;
        }

        const playerId = req.client.playerId;
        const logs = await PlayerLog.GetWithPlayer(playerId);

        for (const log of logs) {
            (log as any).date = new Date(log.timestamp).toLocaleString("ru-RU");
        }

        WebClientUtil.render(req, res, "home", { logs });
    }

    public static onRegister(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "register", {}, false);
    }

    public static async registerAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            return WebClientUtil.error(req, res, errors.array()[0].msg);
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Register(login, password);
        await req.client.attach(user);

        res.redirect("/");
    }

    public static onLogin(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "login", {}, false);
    }

    public static async loginAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            return WebClientUtil.error(req, res, errors.array()[0].msg);
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Login(login, password);

        if (user) {
            await req.client.attach(user.id);
        }
        else {
            return WebClientUtil.error(req, res, "Wrong login or password");
        }

        res.redirect("/");
    }

    public static async onStorage(req: IMyRequest, res: express.Response)
    {
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;
        const r2 = await Storage.AGetWithPlayer(player.id);
        if (!r2.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const storages = r2.data;

        const data = [];
        for (const x of storages) {
            data.push({
                name: (await x.getGood()).name + " (" + (await x.getGood()).id + ")",
                amount: x.amount,
            });
        }

        WebClientUtil.render(req, res, "storage", {
            data,
        });
    }

    public static async onStorageTransferAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodId = Number.parseInt(req.body.goodId, 10);
        const destinationId = Number.parseInt(req.body.routeId, 10);
        const amount = Number.parseInt(req.body.amount, 10);

        const r2 = await Player.GetCurrentMarketId(req.client.playerId);
        if (!r2.result) {
            return WebClientUtil.error(req, res, r2.message);
        }

        const fromId = r2.data;

        const r1 = await LogisticsService.TransferGoodsBetweenMarkets(
            req.client.playerId,
            fromId,
            destinationId,
            goodId,
            amount,
        );

        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }

        req.client.infoToShow = "Successfully sent goods";
        res.redirect("/storage");
    }

    public static async onStorageSendAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodId = Number.parseInt(req.body.goodId, 10);

        const username = req.body.username;
        const receiverplayer = await Player.GetWithLogin(username);

        if (!receiverplayer) {
            WebClientUtil.error(req, res, "No such player");
            return;
        }

        const amount = Number.parseInt(req.body.amount, 10);

        const r1 = await Player.GetCurrentMarketId(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }

        const r2 = await StorageService.TransferGoodsBetweenPlayers(
            r1.data,
            req.client.playerId,
            receiverplayer.id,
            goodId,
            amount,
        );
        if (!r2.result) {
            return WebClientUtil.error(req, res, r2.message);
        }
        const answer = r2.data;
        req.client.infoToShow = "Successfully sent goods";

        res.redirect("/storage");
    }

    public static async onMoneySendAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const username = req.body.username;
        const receiverplayer = await Player.GetWithLogin(username);

        if (!receiverplayer) {
            WebClientUtil.error(req, res, "No such player");
            return;
        }

        const amount = Number.parseInt(req.body.amount, 10);

        const answer = await Player.TransferCash(req.client.playerId,
            receiverplayer.id,
            amount,
        );

        if (typeof answer !== "boolean") {
            WebClientUtil.error(req, res, answer as any);
            return;
        }

        req.client.infoToShow = "Successfully sent cash";

        res.redirect("/markets");
    }

    public static async onFactories(req: IMyRequest, res: express.Response)
    {
        const r1 = await Player.GetCurrentMarketId(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const factories = await Player.GetFactoriesById(
            r1.data,
            req.client.playerId,
        );

        const data = [];

        for (const factory of factories) {
            const lastrecipe = RecipesService.GetById(factory.lastRecipeId);
            data.push(Object.assign(factory, {
                targetEmployees: factory.getTargetEmployees(),
                maxWorkers: factory.getMaxWorkers(),
                upgradecost: await FactoryManagementService.GetUpgradeCostString(factory.id),
                currentManufacturingEfficiency: factory.currentManufacturingEfficiency * 100,
                growth: Config.ManufacturingEfficiencyGrowth * 100,
                lastRecipe: (lastrecipe && lastrecipe.name) || null,
            }));
        }

        WebClientUtil.render(req, res, "factories", {
            data,
            newfactorycoststring: await FactoryManagementService.NewFactoryCostsString()
        });
    }

    public static async factoryWorkersAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const factoryid = Number.parseInt(req.params.id, 10);
        const workers = req.body.workers;

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        if (workers > factory.getMaxWorkers()) {
            WebClientUtil.error(req, res, "More workers than max");
            return;
        }

        factory.setTargetEmployees(workers);

        await Factory.Update(factory);

        res.redirect("/factories");
    }

    public static async factorySalaryAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const factoryid = Number.parseInt(req.params.id, 10);
        const salary = Number.parseInt(req.body.salary || 0, 10);

        if (!salary || salary < 1) {
            WebClientUtil.error(req, res, "Salary can't be less than 1");
            return;
        }

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        factory.salary = salary;

        await Factory.Update(factory);

        res.redirect("/factories");
    }

    public static async onFactoryProductionQueue(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        let dbo = await ProductionQueue.GetWithFactory(factory);

        if (!dbo) {
            await ProductionQueue.Create(factory, []);
            dbo = await ProductionQueue.GetWithFactory(factory);
        }

        const queue = dbo.Queue;

        const data = [];
        for (const x of queue) {
            data.push({
                order: x.Order,
                RecipeId: x.RecipeId,
                Amount: x.Amount,
            });
        }

        WebClientUtil.render(req, res, "queue", { data, factoryId: id });
    }

    public static async onFactoryUpgrade(req: IMyRequest, res: express.Response)
    {
        const playerid = req.client.playerId;
        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        const response = await FactoryManagementService.UpgradeFactory(playerid, factory.id);

        if (typeof response === "string") {
            WebClientUtil.error(req, res, response as string);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onRGOUpgrade(req: IMyRequest, res: express.Response)
    {
        const playerid = req.client.playerId;
        const id = Number.parseInt(req.params.id, 10);
        const rgo = await RGO.GetById(id);

        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        const response = await RGOManagementService.UpgradeRGO(playerid, rgo.id);

        if (typeof response === "string") {
            WebClientUtil.error(req, res, response as string);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onFactoryProductionQueueDelete(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);
        const orderid = Number.parseInt(req.params.order, 10);

        if (!orderid) {
            WebClientUtil.error(req, res, "Wrong order id");
            return true;
        }

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return true;
        }

        const dbo = await ProductionQueue.GetWithFactory(factory);

        if (!dbo) {
            await ProductionQueue.Create(factory, []);
            return;
        }

        dbo.Queue = dbo.Queue.filter((x) => x.Order !== orderid);

        await ProductionQueue.Update(dbo);

        WebClientUtil.renderLast(req, res);
    }

    public static async onFactoryProductionQueueAdd(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);
        const recipeId = Number.parseInt(req.body.recipeId, 10);
        const amount = req.body.amount;

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return true;
        }

        const recipe = await RecipesService.GetById(recipeId);
        if (!recipe) {
            WebClientUtil.error(req, res, "No such recipe");
            return true;
        }

        const dbo = await ProductionQueue.GetWithFactory(factory);

        if (!dbo) {
            await ProductionQueue.Create(factory, []);
            return;
        }

        await ProductionQueue.AddWithFactory(factory, {
            RecipeId: recipeId,
            Amount: amount,
        });

        WebClientUtil.renderLast(req, res);
    }

    public static async onRGOs(req: IMyRequest, res: express.Response)
    {
        const r1 = await Player.GetCurrentMarketId(req.client.playerId);
        if (!r1.result) {
            WebClientUtil.error(req, res, r1.message);
        }
        const rgos = await Player.GetRGOsById(
            r1.data,
            req.client.playerId,
        );

        const data = [];

        for (const rgo of rgos) {
            data.push({
                id: rgo.id,
                employeesCount: rgo.employeesCount,
                targetEmployees: rgo.getTargetEmployees(),
                salary: rgo.salary,
                level: rgo.level,
                maxWorkers: rgo.getMaxWorkers(),
            });
        }

        WebClientUtil.render(req, res, "rgos", { data });
    }

    public static async factoryDeleteAction(req: IMyRequest, res: express.Response)
    {
        const factoryid = Number.parseInt(req.params.id, 10);

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your factory");
            return;
        }

        await Factory.Delete(factoryid);

        WebClientUtil.renderLast(req, res);
    }

    public static async rgoDeleteAction(req: IMyRequest, res: express.Response)
    {
        const rgoid = Number.parseInt(req.params.id, 10);

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your RGO");
            return;
        }

        await RGO.Delete(rgoid);

        WebClientUtil.renderLast(req, res);
    }

    public static async rgoWorkersAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const rgoid = Number.parseInt(req.params.id, 10);
        const workers = req.body.workers;

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your RGO");
            return;
        }

        if (workers > rgo.getMaxWorkers()) {
            WebClientUtil.error(req, res, "Workers more than max");
            return;
        }

        rgo.setTargetEmployees(workers);

        await RGO.Update(rgo);

        res.redirect("/rgos");
    }


    public static async rgoSalaryAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const rgoid = Number.parseInt(req.params.id, 10);
        const salary = req.body.salary;

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientUtil.error(req, res, "That's not your RGO");
            return;
        }

        rgo.salary = salary;

        await RGO.Update(rgo);

        res.redirect("/rgos");
    }

    public static async rgoBuildAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const typeId = Number.parseInt(req.body.typeId, 10);
        const playerId = req.client.playerId;

        const response = await RGOManagementService.ConstructNew(playerId, typeId);

        if (typeof response !== "number") {
            WebClientUtil.error(req, res, response as string);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async factoryBuildAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const playerId = req.client.playerId;
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }

        const player = r1.data;

        const response = await FactoryManagementService.ConstructNew(playerId, player.CurrentMarketId);

        if (!response.result) {
            WebClientUtil.error(req, res, response.message);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onMarkets(req: IMyRequest, res: express.Response)
    {
        const goods = await MarketService.GetTradeableGoods();

        const data = [];

        for (const good of goods) {
            const lastrecord = await PriceRecord.GetLastWithGood(good.id);

            if (lastrecord && lastrecord.tradeamount) {
                data.push({
                    id: good.id,
                    name: good.name + `(${good.id})`,
                    prices: `${lastrecord.minprice}-${lastrecord.maxprice}`,
                    amount: lastrecord.tradeamount,
                });
            }
            else if (lastrecord) {
                data.push({
                    id: good.id,
                    name: good.name + `(${good.id})`,
                    prices: "",
                    amount: lastrecord.tradeamount,
                });
            }
            else {
                data.push({
                    id: good.id,
                    name: good.name + `(${good.id})`,
                    prices: "",
                    amount: 0,
                });
            }
        }

        WebClientUtil.render(req, res, "markets", { data });
    }

    public static async onMarket(req: IMyRequest, res: express.Response)
    {
        const goodid = Number.parseInt(req.params.id, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientUtil.error(req, res, "No such market");
            return;
        }

        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;
        const marketId = player.CurrentMarketId;

        const demand = await MarketService.CountDemandGlobal(goodid);
        const supply = await MarketService.CountSupplyGlobal(goodid);
        const demandlocal = await MarketService.CountDemandLocal(goodid, marketId);
        const supplylocal = await MarketService.CountSupplyLocal(goodid, marketId);

        const bo = await BuyOffer.GetWithGoodAndMarket(marketId, goodid);
        const so = await SellOffer.GetWithGoodAndMarket(marketId, goodid);
        so.reverse();

        const buyoffers = [];
        const selloffers = [];
        for (const s of so) {
            const player = await Player.GetById(s.playerId);
            selloffers.push({
                id: s.id,
                amount: s.amount,
                price: s.price,
                player,
            });
        }

        for (const b of bo) {
            const player = await Player.GetById(b.playerId);
            buyoffers.push({
                id: b.id,
                amount: b.amount,
                price: b.price,
                player,
            });
        }

        const storage = await Storage.Amount(player.CurrentMarketId, req.client.playerId, good.id);

        WebClientUtil.render(req, res, "market", {
            good,
            buyoffers,
            selloffers,
            demand,
            supply,
            demandlocal,
            supplylocal,
            storage,
            helpers: { notequal: ((x, y) => x !== y), equal: ((x, y) => x === y) },
        });
    }

    public static async onMarketSell(req: IMyRequest, res: express.Response)
    {
        // TODO: Удаление офферов
        // TODO: Частичный выкуп оффера
        // TODO: Модалки получше
        // TODO: оформление Homm3
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodid = Number.parseInt(req.params.id, 10);
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;
        const amount = Number.parseInt(req.body.amount, 10);
        const price = Number.parseInt(req.body.price, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientUtil.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.AddSellOffer(player.CurrentMarketId, player.id, good.id, amount, price);

        if (typeof data === "string") {
            WebClientUtil.error(req, res, data);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onMarketBuy(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientUtil.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodid = Number.parseInt(req.params.id, 10);
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;
        const amount = Number.parseInt(req.body.amount, 10);
        const price = Number.parseInt(req.body.price, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientUtil.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.AddBuyOffer(player.CurrentMarketId, player.id, good.id, amount, price);

        if (typeof data === "string") {
            WebClientUtil.error(req, res, data);
            return;
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onMarketRedeemSell(req: IMyRequest, res: express.Response)
    {
        const offerId = Number.parseInt(req.params.offer, 10);
        const amount = Number.parseInt(req.query.amount as string, 10);

        const data = await MarketService.RedeemSellOffer(req.client.playerId, offerId, amount);

        if (!data.result) {
            return WebClientUtil.error(req, res, data.message);
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onMarketRedeemBuy(req: IMyRequest, res: express.Response)
    {
        const offerId = Number.parseInt(req.params.offer, 10);
        const amount = Number.parseInt(req.query.amount as string, 10);

        const data = await MarketService.RedeemBuyOffer(req.client.playerId, offerId, amount);

        if (!data.result) {
            return WebClientUtil.error(req, res, data.message);
        }

        WebClientUtil.renderLast(req, res);
    }

    public static async onDeleteBuyOffer(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        const buyoffer = await BuyOffer.GetById(id);

        const playerId = req.client.playerId;
        const r1 = await Player.GetById(playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;

        if (buyoffer.playerId !== playerId) {
            WebClientUtil.error(req, res, "That's not your buy offer");
            return;
        }

        if (buyoffer.marketId !== player.CurrentMarketId) {
            WebClientUtil.error(req, res, "Вы не в рынке этого оффера");
            return;
        }

        await BuyOffer.Delete(buyoffer.id);
        WebClientUtil.renderLast(req, res);
    }
    public static async onDeleteSellOffer(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        const selloffer = await SellOffer.GetById(id);

        const playerId = req.client.playerId;
        const r1 = await Player.GetById(playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const player = r1.data;

        if (selloffer.playerId !== playerId) {
            WebClientUtil.error(req, res, "That's not your sell offer");
            return;
        }

        if (selloffer.marketId !== player.CurrentMarketId) {
            WebClientUtil.error(req, res, "Вы не в рынке этого оффера");
            return;
        }

        await SellOffer.Delete(selloffer.id);
        WebClientUtil.renderLast(req, res);
    }

    public static async onGoods(req: IMyRequest, res: express.Response)
    {
        const goods = await Good.All();

        let data = [];

        for (const good of goods) {
            const lastrecord = await PriceRecord.GetLastWithGood(good.id);

            if (lastrecord && lastrecord.tradeamount) {
                data.push({
                    name: good.name,
                    id: good.id,
                    prices: `${lastrecord.minprice}-${lastrecord.maxprice}`,
                    amount: lastrecord.tradeamount,
                });
            }
            else if (lastrecord) {
                data.push({
                    name: good.name,
                    id: good.id,
                    prices: "",
                    amount: lastrecord.tradeamount,
                });
            }
            else {
                data.push({
                    name: good.name,
                    id: good.id,
                    prices: "",
                    amount: 0,
                });
            }
        }

        WebClientUtil.render(req, res, "goods", { data });
    }
    public static async onRecipes(req: IMyRequest, res: express.Response)
    {
        const recipes = RecipesService.All;

        const data = [];
        for (const recipe of recipes) {
            data.push(await RecipesService.PrepareToRender(recipe));
        }

        WebClientUtil.render(req, res, "recipes", { data });
    }
    public static async onRGOTypes(req: IMyRequest, res: express.Response)
    {
        const types = await RGOType.All();

        let data = [];

        for (const type of types) {
            const links = await RGOMarketToType.GetWithType(type.id);

            for (const link of links) {
                const market = await Market.GetById(link.marketId);

                data.push({
                    id: type.id,
                    name: type.name,
                    makes: await type.getProducesString(),
                    maxamount: link.maxAmount,
                    efficiency: RGOService.CalculateEfficiency(type, link),
                    already: await RGO.CountWithType(market.id, type.id),
                    market: market.name,
                    resources: await RGOManagementService.NewRGOCostsString(type.id),
                    instrument: (type.InstrumentGoodId) ? await (await Good.GetById(type.InstrumentGoodId)).name : null,
                    chance: type.InstrumentBreakChance * 100,
                });
            }
        }

        WebClientUtil.render(req, res, "rgotypes", { data });
    }

    public static onLogout(req: IMyRequest, res: express.Response)
    {
        if (WebClientUtil.isLogined(req)) {
            WebClientUtil.clients = WebClientUtil.clients.filter(x => x.clientId !== req.client.clientId);
        }

        res.redirect("/");
    }
}
