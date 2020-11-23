import { Factory } from "entity/Factory";
import { Turn } from "entity/Turn";
import * as express from "express";
import { toUnicode } from "punycode";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class StatisticsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => WebClientUtil.LoadPlayerData(req, res, next));

        router.get("/", this.onHome);
        router.get("/inflation", this.OnInflation);
        router.get("/workers", this.OnWorkers);
        router.get("/cashperplayer", this.OnCashPerPlayer);
        router.get("/totalcash", this.OnTotalCash);

        return router;
    }

    public static async onHome(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "statistics/home");
    }

    public static async OnInflation(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const props = [];
        const labels = [];
        const relative = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            props.push(turn.freecash || 0);
            relative.push((turn.freecash || 0) * 100 / (turn.totalcash || 1));
        }

        WebClientUtil.render(req, res, "statistics/inflation", {
            data: JSON.stringify(props),
            labels: JSON.stringify(labels),
            relative: JSON.stringify(relative),
        });
    }

    public static async OnTotalCash(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const props = [];
        const labels = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            props.push(turn.totalcash || 0);
        }

        WebClientUtil.render(req, res, "statistics/totalcash", {
            data: JSON.stringify(props),
            labels: JSON.stringify(labels),
        });
    }

    public static async OnCashPerPlayer(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const props = [];
        const labels = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            props.push(turn.cashperplayer || 0);
        }

        WebClientUtil.render(req, res, "statistics/cashperplayer", {
            data: JSON.stringify(props),
            labels: JSON.stringify(labels),
        });
    }

    public static async OnWorkers(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const average = [];
        const median = [];
        const total = [];
        const labels = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            average.push(turn.averageworkers || 0);
            median.push(turn.medianworkers || 0);
            total.push(turn.totalworkers || 0) ;
        }

        WebClientUtil.render(req, res, "statistics/workers", {
            total: JSON.stringify(total),
            average: JSON.stringify(average),
            median: JSON.stringify(median),
            labels: JSON.stringify(labels),
        });
    }
}
