var Router = require("vertx-web-js/router");
var SockJSHandler = require("vertx-web-js/sock_js_handler");

var server = vertx.createHttpServer();
var router = Router.router(vertx);

var sockJSHandler = SockJSHandler.create(vertx);
var options = {
};
sockJSHandler.bridge(options);

router.route("/eventbus/*").handler(sockJSHandler.handle);

server.requestHandler(router.accept).listen(8080);
