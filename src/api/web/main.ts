import * as express from "express";
import * as exphbs from "express-handlebars";
import { WebAPI } from "./WebAPI";
import * as cookieParser from "cookie-parser";
import { Logger } from "utility/Logger";
import { WebClientUtil } from "./WebClientUtil";

const app = express();
const port = 3000;

const hbs = exphbs.create({ extname: ".hbs"});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

app.listen(port, () =>
{
    Logger.info(`Server listening at http://localhost:${port}`);
});

app.use((req, res, next) =>
{
    Logger.verbose(req.method + " to " + req.url);
    next();
});

WebAPI.Init(app);
