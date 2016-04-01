var Router = require("vertx-web-js/router");
var SockJSHandler = require("vertx-web-js/sock_js_handler");

var router = Router.router(vertx);

var options = {
  'inboundPermitteds' : [
    {
      'address' : 'commands'
    }
  ],
  'outboundPermitteds' : [
    {
      'address' : 'what-time-is-it'
    }
  ]
};

// We need cookies, sessions and request bodies
//router.route().handler(CookieHandler.create().handle);
//router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)).handle);

router.route("/eventbus/*").handler(SockJSHandler.create(vertx).bridge(options).handle);

vertx.createHttpServer().requestHandler(router.accept).listen(8080);

// de-knallisworld-mock

vertx.eventBus().consumer('commands', function (message) {
  var headers = message.headers();
  var body = message.body();
  var token = headers.get('token');
  console.log('Intercepted token: ' + token);
  if (token && token.substring(0, 6) === 'VALID-') {
    if (body.type === 'PING') {
      message.reply({
        type : 'PONG'
      });
    } else {
      message.reply({
        type : 'NON-PING'
      });
    }
  } else {
    message.reply({
      type : 'NO_AUTH'
    });
  }
});

vertx.setPeriodic(1000, function (timerId) {
  vertx.eventBus().publish('what-time-is-it', {
    time : new Date().getTime()
  });
});
