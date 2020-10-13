import { Load } from "../moduleloader";
import { sleep } from "utility/sleep";

let sync = true;
(async () =>
{
    await Load();
    sync = false;
})();

while (sync) {
    require("deasync").sleep(100);
}