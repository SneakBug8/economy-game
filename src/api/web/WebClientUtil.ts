import { WebClient } from "./WebClient";
import * as express from "express";
import { Logger } from "utility/Logger";
import { RecipesService } from "services/RecipesService";
import { Good } from "entity/Good";
import { RGOType } from "entity/RGOType";
import { Player } from "entity/Player";
import { Market } from "entity/Market";

export class WebClientUtil {
    public static clients = new Array<WebClient>();

    public static LoadPlayerData(req: IMyRequest, res: express.Response, next: () => void)
    {
        for (const client of WebClientUtil.clients) {
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
        WebClientUtil.clients.push(client);

        req.client = client;
        next();
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
            req.client.appendUrl(req.url);
        }

        res.render(template, {
            ...res.locals,
            layout: this.getInfopagesLayout(req),
            ...data,
            error: req.client.errorToShow,
            title: req.url,
            isLogined: this.isLogined(req),
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

    public static getInfopagesLayout(req: IMyRequest)
    {
        if (!this.isLogined(req)) {
            return "logout";
        }

        return "main";
    }

    public static isLogined(req: IMyRequest)
    {
        return req.client && req.client.playerId && req.client.actorId;
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

    public static async FillPlayercardData(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (WebClientUtil.isLogined(req)) {
            const player = await Player.GetById(req.client.playerId);
            res.locals.player = player;
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
}
