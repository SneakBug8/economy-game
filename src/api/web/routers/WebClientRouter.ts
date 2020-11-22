import * as express from "express";
import { Logger } from "utility/Logger";
import { WebClient } from "api/web/WebClient";
import { body, param, validationResult } from "express-validator";
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
import { MarketActor } from "entity/MarketActor";
import { Consumption } from "entity/Consumption";
import { Production } from "entity/Production";
import { LeaderboardService } from "services/LeaderboardService";

export class WebClientRouter
{
    public static clients = new Array<WebClient>();

    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => this.LoadPlayerData(req, res, next));
        router.use(this.FillPlayercardData);
        router.use(this.LoadBackLink);

        router.get("/", this.onHome);

        router.use(bodyParser.urlencoded({ extended: true }));

        router.get("/register", this.onRegister);
        router.post("/register", [
            body("login", "Empty login").trim().isLength({ min: 4 }).escape(),
            body("password", "Empty password").trim().isLength({ min: 6 }).escape(),
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
        router.get("/leaderboard", this.onLeaderboard);
        router.get("/leaderboard/cash", this.onLeaderboardRichest);
        router.get("/leaderboard/factoryworkers", this.onLeaderboardFactoryWorkers);
        router.get("/leaderboard/rgoworkers", this.onLeaderboardRGOWorkers);

        router.use(this.RedirectUnlogined);

        router.get("/factories", this.onFactories);
        router.post("/factory/:id([0-9]+)/salary", [
            body("salary").isNumeric(),
        ], this.factorySalaryAction);
        router.post("/factory/:id([0-9]+)/workers", [
            body("workers").isNumeric(),
        ], this.factoryWorkersAction);
        router.get("/factory/:id([0-9]+)/upgrade", this.onFactoryUpgrade);
        router.get("/factory/:id([0-9]+)/delete", this.factoryDeleteAction);
        router.get("/factory/:id([0-9]+)/queue", [this.LoadRecipes], this.onFactoryProductionQueue);
        router.get("/factory/:id([0-9]+)/queue/delete/:order([0-9]+)", this.onFactoryProductionQueueDelete);
        router.post("/factory/:id([0-9]+)/queue/add", [
            body("recipeId").isNumeric(),
            body("amount").isNumeric(),
        ], this.onFactoryProductionQueueAdd);
        router.get("/factory/build", this.factoryBuildAction);

        router.get("/rgos", [this.LoadRGOTypes], this.onRGOs);
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

        router.get("/storage", this.onStorage);

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
                param("amount").isNumeric().optional(),
            ]
            , this.onMarketRedeemBuy);
        router.get("/market/:id([0-9]+)/redeemsell/:offer([0-9]+)", [
            param("amount").isNumeric().optional(),
        ], this.onMarketRedeemSell);

        router.get("/logout", this.onLogout);

        router.use(this.on404);

        return router;
    }

    public static LoadPlayerData(req: IMyRequest, res: express.Response, next: () => void)
    {
        for (const client of this.clients) {
            if (req.cookies.id && req.cookies.id === client.clientId) {
                req.client = client;
                next();
                return;
            }
        }

        let id = req.cookies.id || Number.parseInt(req.cookies.id, 10) || 0;
        if (!id) {
            id = Math.round(Math.random() * 100000);
        }

        Logger.info("New client id " + id);

        res.cookie("id", id);

        const client = new WebClient(id);
        this.clients.push(client);

        req.client = client;
        next();
    }

    public static LoadBackLink(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (req.url === req.client.getUrl()) {
            res.locals.backurl = req.client.popUrl();
        }
        else {
            res.locals.backurl = req.client.getUrl();
        }
        next();
    }

    public static LoadRecipes(req: IMyRequest, res: express.Response, next: () => void)
    {
        const recipes = RecipesService.All;
        res.locals.recipes = recipes;
        next();
    }

    public static async LoadRGOTypes(req: IMyRequest, res: express.Response, next: () => void)
    {
        const rgotypes = await RGOType.All();
        res.locals.rgotypes = rgotypes;
        next();
    }

    public static async LoadGoods(req: IMyRequest, res: express.Response, next: () => void)
    {
        const goods = await Good.All();
        res.locals.goods = goods;
        next();
    }

    public static render(req: IMyRequest, res: express.Response, template: string, data?: object, remember: boolean = true)
    {
        if (remember) {
            req.client.appendUrl(req.url)
        }

        res.render(template, {
            ...res.locals,
            layout: WebClientRouter.getInfopagesLayout(req),
            ...data,
            error: req.client.errorToShow,
        });

        req.client.errorToShow = null;
    }

    public static renderLast(req: IMyRequest, res: express.Response)
    {
        if (req.client.getUrl()) {
            res.redirect(req.client.popUrl());
        }
        else {
            res.redirect("/");
        }
    }

    public static error(req: IMyRequest, res: express.Response, msg: string)
    {
        req.client.errorToShow = msg;
        res.redirect(req.client.popUrl());
    }

    public static RedirectUnlogined(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (!WebClientRouter.isLogined(req)) {
            res.redirect("/");
            return;
        }

        next();
    }

    public static async FillPlayercardData(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (WebClientRouter.isLogined(req)) {
            const player = await Player.GetById(req.client.playerId);
            res.locals.player = player;
            res.locals.playerfactoryworkers = await player.getFactoriesWorkers();
            res.locals.playerrgoworkers = await player.getRGOWorkers();
        }
        next();
    }

    public static getInfopagesLayout(req: IMyRequest)
    {
        if (!WebClientRouter.isLogined(req)) {
            return "logout";
        }

        return "main";
    }

    public static isLogined(req: IMyRequest)
    {
        return req.client && req.client.playerId && req.client.actorId;
    }

    public static async onHome(req: IMyRequest, res: express.Response)
    {
        if (!WebClientRouter.isLogined(req)) {
            WebClientRouter.render(req, res, "unlogined");
            return;
        }

        const playerId = req.client.playerId;
        const logs = await PlayerLog.GetWithPlayer(playerId);

        WebClientRouter.render(req, res, "home", { logs });
    }

    public static onRegister(req: IMyRequest, res: express.Response)
    {
        WebClientRouter.render(req, res, "register", {}, false);
    }

    public static async registerAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Register(login, password);
        await req.client.attach(user);

        res.redirect("/");
    }

    public static onLogin(req: IMyRequest, res: express.Response)
    {
        WebClientRouter.render(req, res, "login", {}, false);
    }

    public static async loginAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Login(login, password);
        await req.client.attach(user.id);

        res.redirect("/");
    }

    public static onInfo(req: IMyRequest, res: express.Response) { }
    public static async onStorage(req: IMyRequest, res: express.Response)
    {
        const player = await Player.GetById(req.client.playerId);
        const actor = await player.getActor();

        const storages = await Storage.GetWithActor(actor);

        const data = [];
        for (const x of storages) {
            data.push({
                name: (await x.getGood()).name + "(" + (await x.getGood()).id + ")",
                amount: x.amount,
            });
        }

        WebClientRouter.render(req, res, "storage", {
            data,
        });
    }
    public static async onFactories(req: IMyRequest, res: express.Response)
    {
        const factories = await Player.GetFactoriesById(req.client.playerId);

        const data = [];

        for (const factory of factories) {
            data.push({
                id: factory.id,
                employeesCount: factory.employeesCount,
                targetEmployees: factory.getTargetEmployees(),
                salary: factory.salary,
                level: factory.level,
                maxWorkers: factory.getMaxWorkers(),
            });
        }

        WebClientRouter.render(req, res, "factories", { data });
    }

    public static async factoryWorkersAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const factoryid = Number.parseInt(req.params.id, 10);
        const workers = req.body.workers;

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return;
        }

        if (workers > factory.getMaxWorkers()) {
            WebClientRouter.error(req, res, "More workers than max");
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
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const factoryid = Number.parseInt(req.params.id, 10);
        const salary = req.body.salary;

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
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
            WebClientRouter.error(req, res, "That's not your factory");
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

        WebClientRouter.render(req, res, "queue", { data, factoryId: id });
    }

    public static async onFactoryUpgrade(req: IMyRequest, res: express.Response)
    {
        const playerid = req.client.playerId;
        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return;
        }

        const response = await FactoryManagementService.UpgradeFactory(playerid, factory.id);

        if (typeof response === "string") {
            WebClientRouter.error(req, res, response as string);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onRGOUpgrade(req: IMyRequest, res: express.Response)
    {
        const playerid = req.client.playerId;
        const id = Number.parseInt(req.params.id, 10);
        const rgo = await RGO.GetById(id);

        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return;
        }

        const response = await RGOManagementService.UpgradeRGO(playerid, rgo.id);

        if (typeof response === "string") {
            WebClientRouter.error(req, res, response as string);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onFactoryProductionQueueDelete(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);
        const orderid = Number.parseInt(req.params.order, 10);

        if (!orderid) {
            WebClientRouter.error(req, res, "Wrong order id");
            return true;
        }

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return true;
        }

        const dbo = await ProductionQueue.GetWithFactory(factory);

        if (!dbo) {
            await ProductionQueue.Create(factory, []);
            return;
        }

        dbo.Queue = dbo.Queue.filter((x) => x.Order !== orderid);

        await ProductionQueue.Update(dbo);

        WebClientRouter.renderLast(req, res);
    }

    public static async onFactoryProductionQueueAdd(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const id = Number.parseInt(req.params.id, 10);
        const factory = await Factory.GetById(id);
        const recipeId = Number.parseInt(req.body.recipeId, 10);
        const amount = req.body.amount;

        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return true;
        }

        const recipe = await RecipesService.GetById(recipeId);
        if (!recipe) {
            WebClientRouter.error(req, res, "No such recipe");
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

        WebClientRouter.renderLast(req, res);
    }

    public static async onRGOs(req: IMyRequest, res: express.Response)
    {
        const rgos = await Player.GetRGOsById(req.client.playerId);

        const data = [];

        for (const rgo of rgos) {
            data.push({
                id: rgo.id,
                employeesCount: rgo.employeesCount,
                targetEmployees: rgo.targetEmployees,
                salary: rgo.salary,
                level: rgo.level,
                maxWorkers: rgo.getMaxWorkers(),
            });
        }

        WebClientRouter.render(req, res, "rgos", { data });
    }

    public static async factoryDeleteAction(req: IMyRequest, res: express.Response)
    {
        const factoryid = Number.parseInt(req.params.id, 10);

        const factory = await Factory.GetById(factoryid);
        if (!factory || factory.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your factory");
            return;
        }

        await Factory.Delete(factoryid);

        WebClientRouter.renderLast(req, res);
    }

    public static async rgoDeleteAction(req: IMyRequest, res: express.Response)
    {
        const rgoid = Number.parseInt(req.params.id, 10);

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your RGO");
            return;
        }

        await RGO.Delete(rgoid);

        WebClientRouter.renderLast(req, res);
    }

    public static async rgoWorkersAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const rgoid = Number.parseInt(req.params.id, 10);
        const workers = req.body.workers;

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your RGO");
            return;
        }

        rgo.targetEmployees = workers;

        await RGO.Update(rgo);

        res.redirect("/rgos");
    }


    public static async rgoSalaryAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const rgoid = Number.parseInt(req.params.id, 10);
        const salary = req.body.salary;

        const rgo = await RGO.GetById(rgoid);
        if (!rgo || rgo.getOwnerId() !== req.client.playerId) {
            WebClientRouter.error(req, res, "That's not your RGO");
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
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const typeId = Number.parseInt(req.body.typeId, 10);
        const playerId = req.client.playerId;

        const response = await RGOManagementService.ConstructNew(playerId, typeId);

        if (typeof response !== "number") {
            WebClientRouter.error(req, res, response as string);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async factoryBuildAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const playerId = req.client.playerId;

        const response = await FactoryManagementService.ConstructNew(playerId);

        if (typeof response !== "number") {
            WebClientRouter.error(req, res, response as string);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onMarkets(req: IMyRequest, res: express.Response)
    {
        const goods = await Good.All();

        let data = [];

        for (const good of goods) {
            const lastrecord = await PriceRecord.GetLatestWithGood(good);

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

        WebClientRouter.render(req, res, "markets", { data });
    }

    public static async onMarket(req: IMyRequest, res: express.Response)
    {
        const goodid = Number.parseInt(req.params.id, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientRouter.error(req, res, "No such market");
            return;
        }

        const demand = await MarketService.CountDemand(good);
        const supply = await MarketService.CountSupply(good);
        const bo = await BuyOffer.GetWithGoodOrdered(good);
        const so = await SellOffer.GetWithGoodOrdered(good);
        const cons = await Consumption.GetWithGood(good);
        const prods = await Production.GetWithGood(good);
        so.reverse();

        const buyoffers = [];
        const selloffers = [];
        const consumptions = [];
        const productions = [];

        for (const prod of prods) {
            productions.push({
                amount: prod.amount,
                price: "От " + prod.minprice,
                player: {
                    username: "State",
                },
            });
        }
        for (const s of so) {
            const actor = await s.getActor();
            const player = await Player.GetWithActor(actor);
            selloffers.push({
                id: s.id,
                amount: s.amount,
                price: s.price,
                actor,
                player,
            });
        }

        for (const b of bo) {
            const actor = await b.getActor();
            const player = await Player.GetWithActor(actor);
            buyoffers.push({
                id: b.id,
                amount: b.amount,
                price: b.price,
                actor,
                player,
            });
        }
        for (const con of cons) {
            consumptions.push({
                amount: con.amount,
                price: "До " + con.maxprice,
                player: {
                    username: "State",
                },
            });
        }

        const actor = await MarketActor.GetById(req.client.actorId);
        const storage = await Storage.Amount(actor, good);

        WebClientRouter.render(req, res, "market", {
            good, buyoffers, selloffers, demand, supply, storage,
            consumptions, productions, helpers: { notequal: ((x, y) => x !== y), equal: ((x, y) => x === y) },
        });
    }

    public static async onMarketSell(req: IMyRequest, res: express.Response)
    {
        //TODO: Удаление офферов
        // TODO: Частичный выкуп оффера
        // TODO: Модалки получше
        // TODO: оформление Homm3
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodid = Number.parseInt(req.params.id, 10);
        const player = await Player.GetById(req.client.clientId);
        const actor = await MarketActor.GetById(req.client.actorId);
        const amount = Number.parseInt(req.body.amount, 10);
        const price = Number.parseInt(req.body.price, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientRouter.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.AddSellOffer(actor, good, amount, price);

        if (typeof data === "string") {
            WebClientRouter.error(req, res, data);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onMarketBuy(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            WebClientRouter.error(req, res, errors.array()[0].msg);
            return;
        }

        const goodid = Number.parseInt(req.params.id, 10);
        const player = await Player.GetById(req.client.clientId);
        const actor = await MarketActor.GetById(req.client.actorId);
        const amount = Number.parseInt(req.body.amount, 10);
        const price = Number.parseInt(req.body.price, 10);

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientRouter.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.AddBuyOffer(actor, good, amount, price);

        if (typeof data === "string") {
            WebClientRouter.error(req, res, data);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onMarketRedeemSell(req: IMyRequest, res: express.Response)
    {
        const goodid = Number.parseInt(req.params.id, 10);
        const player = await Player.GetById(req.client.clientId);
        const actor = await MarketActor.GetById(req.client.actorId);
        const offerId = Number.parseInt(req.params.offer, 10);
        const offer = await SellOffer.GetById(offerId);

        if (!offer) {
            WebClientRouter.error(req, res, "No such offer");
        }

        const amount = Number.parseInt(req.params.amount, 10) || offer.amount;

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientRouter.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.RedeemSellOffer(actor, offer, amount);

        if (typeof data === "string") {
            WebClientRouter.error(req, res, data);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onMarketRedeemBuy(req: IMyRequest, res: express.Response)
    {
        const goodid = Number.parseInt(req.params.id, 10);
        const player = await Player.GetById(req.client.clientId);
        const actor = await MarketActor.GetById(req.client.actorId);
        const offerId = Number.parseInt(req.params.offer, 10);
        const offer = await BuyOffer.GetById(offerId);

        if (!offer) {
            WebClientRouter.error(req, res, "No such offer");
        }

        const amount = Number.parseInt(req.params.amount, 10) || offer.amount;

        const good = await Good.GetById(goodid);

        if (!good) {
            WebClientRouter.error(req, res, "No such market");
            return;
        }

        const data = await MarketService.RedeemBuyOffer(actor, offer, amount);

        if (typeof data === "string") {
            WebClientRouter.error(req, res, data);
            return;
        }

        WebClientRouter.renderLast(req, res);
    }

    public static async onGoods(req: IMyRequest, res: express.Response)
    {
        const goods = await Good.All();

        let data = [];

        for (const good of goods) {
            const lastrecord = await PriceRecord.GetLatestWithGood(good);

            if (lastrecord && lastrecord.tradeamount) {
                data.push({
                    name: good.name + `(${good.id})`,
                    prices: `${lastrecord.minprice}-${lastrecord.maxprice}`,
                    amount: lastrecord.tradeamount,
                });
            }
            else if (lastrecord) {
                data.push({
                    name: good.name + `(${good.id})`,
                    prices: "",
                    amount: lastrecord.tradeamount,
                });
            }
            else {
                data.push({
                    name: good.name + `(${good.id})`,
                    prices: "",
                    amount: 0,
                });
            }
        }

        WebClientRouter.render(req, res, "goods", { data });
    }
    public static onRecipes(req: IMyRequest, res: express.Response)
    {
        const recipes = RecipesService.All;

        const data = [];
        for (const recipe of recipes) {
            let entry = {
                id: recipe.id,
                requisites: "",
                results: "",
                workers: recipe.employeesneeded,
            };

            for (const input of recipe.Requisites) {
                entry.requisites += `${input.amount} ${input.Good.name}`;
            }
            for (const output of recipe.Results) {
                entry.results += `${output.amount} ${output.Good.name}`;
            }

            data.push(entry);
        }

        WebClientRouter.render(req, res, "recipes", { data });
    }
    public static async onRGOTypes(req: IMyRequest, res: express.Response)
    {
        const types = await RGOType.All();

        let data = [];

        for (const type of types) {
            data.push({
                id: type.id,
                name: type.name,
                makes: (await type.getGood()).name,
                workers: 1 / type.efficiency,
                maxamount: type.maxAmount,
                already: await RGOManagementService.CountOfType(type.id),
                resources: await WebClientRouter.formResourcesString(type),
            });
        }

        WebClientRouter.render(req, res, "rgotypes", { data });
    }

    private static async formResourcesString(x: RGOType)
    {
        let res = "";
        const costs = Config.RGOCostsDictionary.get(x.id);

        for (const req of costs) {
            const good = await Good.GetById(req.goodId);
            res += `${req.Amount} ${good.name}`;
        }

        return res;
    }

    public static async onLeaderboard(req: IMyRequest, res: express.Response)
    {
        WebClientRouter.render(req, res, "leaderboards/home");
    }

    public static async onLeaderboardRichest(req: IMyRequest, res: express.Response)
    {
        const data = await LeaderboardService.GetRichestPlayers();

        let i = 0;
        const props = [];
        for (const entry of data) {
            i++;
            props.push({
                order: i,
                ...entry,
            });
        }

        WebClientRouter.render(req, res, "leaderboards/richest", {
            data: props,
        });
    }

    public static async onLeaderboardRGOWorkers(req: IMyRequest, res: express.Response)
    {
        const data = await LeaderboardService.GetMostRGOWorkers();

        const props = [];
        let i = 0;
        for (const entry of data) {
            i++;
            const player = await Player.GetById(entry.playerId);
            props.push({
                order: i,
                player,
                workers: entry.c,
            });
        }

        WebClientRouter.render(req, res, "leaderboards/rgoworkers", {
            data: props,
        });
    }

    public static async onLeaderboardFactoryWorkers(req: IMyRequest, res: express.Response)
    {
        const data = await LeaderboardService.GetMostFactoryWorkers();

        let i = 0;
        const props = [];
        for (const entry of data) {
            i++;
            const player = await Player.GetById(entry.playerId);
            props.push({
                order: i,
                player,
                workers: entry.c,
            });
        }

        WebClientRouter.render(req, res, "leaderboards/factoryworkers", {
            data: props,
        });
    }

    public static onLogout(req: IMyRequest, res: express.Response)
    {
        if (WebClientRouter.isLogined(req)) {
            WebClientRouter.clients.splice(WebClientRouter.clients.indexOf(req.client), 1);
            res.redirect("/");
        }
    }

    public static on404(req: IMyRequest, res: express.Response)
    {
        WebClientRouter.render(req, res, "404", {}, false);
    }

}

interface IMyRequest extends express.Request
{
    client?: WebClient;
}
