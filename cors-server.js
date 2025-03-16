import { createServer } from "cors-anywhere";
var host = "0.0.0.0";
var port = 36325;

createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ["origin", "x-requested-with"],
    removeHeaders: ["cookie", "cookie2"],
    })
    .listen(port, host, function () {
        // eslint-disable-next-line no-undef
        console.log("Running CORS Anywhere on " + host + ":" + port);
    });
