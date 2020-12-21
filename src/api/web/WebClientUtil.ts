import { WebClient } from "./WebClient";
import * as express from "express";
import { Logger } from "utility/Logger";
import { RecipesService } from "services/RecipesService";
import { Good } from "entity/Good";
import { RGOType } from "entity/RGOType";
import { Player } from "entity/Player";
import { Market } from "entity/Market";
import { MarketService } from "services/MarketService";
import { RGOService } from "services/RGOService";
import { asyncForEach } from "utility/asyncForEach";
import { RGOManagementService } from "services/RGOManagementService";

export class WebClientUtil
{
    public static clients = new Array<WebClient>();

    public static GenerateRequestId(req: IMyRequest, res: express.Response, next: () => void)
    {
        req.id = Math.round(Math.random() * 100000);
        next();
    }

    public static LoadPlayerData(req: IMyRequest, res: express.Response, next: () => void)
    {
        for (const client of WebClientUtil.clients) {
            if (req.cookies.id && req.cookies.id + "" === client.clientId + "") {
                client.lastAccess = Date.now();
                req.client = client;
                next();
                return;
            }
        }

        let id = req.cookies.id || Number.parseInt(req.cookies.id, 10) || 0;
        if (!id) {
            id = Math.round(Math.random() * 100000);
        }

        Logger.info(`New client id ${id} from ${req.ip} in request ${req.id}`);

        res.cookie("id", id);

        const client = new WebClient(id);
        WebClientUtil.clients.push(client);

        req.client = client;
        next();
    }

    public static ClearPlayersList()
    {
        WebClientUtil.clients = WebClientUtil.clients.filter((x) => Date.now() - x.lastAccess < 60 * 60 * 1000);
    }

    public static RedirectUnlogined(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (!WebClientUtil.isLogined(req)) {
            res.redirect("/");
            return;
        }

        next();
    }

    public static render(req: IMyRequest, res: express.Response, template: string, data?: object, remember: boolean = true)
    {
        if (remember) {
            req.client.appendUrl(req.originalUrl);
        }

        res.render(template, {
            ...res.locals,
            layout: this.getInfopagesLayout(req),
            ...data,
            error: req.client.errorToShow,
            info: req.client.infoToShow,
            title: req.url,
            isLogined: this.isLogined(req),
            baseUrl: req.baseUrl,
        });

        req.client.errorToShow = null;
        req.client.infoToShow = null;
    }

    public static renderLast(req: IMyRequest, res: express.Response)
    {
        if (req.client.getUrl()) {
            res.redirect(req.client.getUrl());
        }
        else {
            res.redirect("/");
        }
    }

    public static error(req: IMyRequest, res: express.Response, msg: string)
    {
        Logger.warn(msg);
        req.client.errorToShow = msg;
        res.redirect(req.client.getUrl());
    }

    public static getInfopagesLayout(req: IMyRequest)
    {
        if (!this.isLogined(req)) {
            return "logout";
        }

        return "main";
    }

    public static isLogined(req: IMyRequest)
    {
        return req.client && req.client.playerId;
    }

    public static async LoadOnlinePlayers(req: IMyRequest, res: express.Response, next: () => void)
    {
        const players = [];
        const clients = [];
        for (const cl of WebClientUtil.clients) {
            if (cl.playerId) {
                const r1 = await Player.GetById(cl.playerId);
                if (!r1.result) {
                    continue;
                }
                players.push(r1.data.username);
            }
            else {
                clients.push(cl.clientId);
            }
        }
        res.locals.players = players.concat(clients);
        next();
    }

    public static async LoadRecipes(req: IMyRequest, res: express.Response, next: () => void)
    {
        const recipes = RecipesService.All;
        const entries = [];
        await asyncForEach(recipes, async (x) => entries.push(await RecipesService.PrepareToRender(x)));
        res.locals.recipes = entries;
        next();
    }

    public static async LoadRGOTypes(req: IMyRequest, res: express.Response, next: () => void)
    {
        const rgotypes = await RGOType.All();
        res.locals.rgotypes = rgotypes;
        next();
    }

    public static async LoadBuildableTypes(req: IMyRequest, res: express.Response, next: () => void)
    {
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            Logger.warn(r1.toString());
        }
        const player = r1.data;
        const rgotypes = await RGOService.BuildableWithinRegion(player.CurrentMarketId);
        await asyncForEach(rgotypes, async (x) => (x as any).costs = await RGOManagementService.NewRGOCostsString(x.id));
        res.locals.rgotypes = rgotypes;
        next();
    }

    public static async LoadGoods(req: IMyRequest, res: express.Response, next: () => void)
    {
        const goods = await Good.All();
        res.locals.goods = goods;
        next();
    }

    public static async LoadTradeableGoods(req: IMyRequest, res: express.Response, next: () => void)
    {
        const goods = await MarketService.GetTradeableGoods();
        res.locals.goods = goods;
        next();
    }

    public static async LoadMarkets(req: IMyRequest, res: express.Response, next: () => void)
    {
        const markets = await Market.All();
        res.locals.markets = markets;
        next();
    }

    public static async FillPlayercardData(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (WebClientUtil.isLogined(req)) {
            const r1 = await Player.GetById(req.client.playerId);
            if (!r1.result) {
                Logger.warn(r1.toString());
            }
            const player = r1.data;
            res.locals.player = player;
            res.locals.mycash = await player.AgetCash();
            res.locals.currency = (await Market.GetCashGood(player.CurrentMarketId)).name;
            res.locals.playerfactoryworkers = await player.getFactoriesWorkers();
            res.locals.playerrgoworkers = await player.getRGOWorkers();

            const market = await Market.GetById(player.CurrentMarketId);
            res.locals.CurrentMarket = market;
        }
        next();
    }

}

export interface IMyRequest extends express.Request
{
    client?: WebClient;
    id?: number;
}
