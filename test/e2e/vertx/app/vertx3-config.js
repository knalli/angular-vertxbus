var Router = require("vertx-web-js/router");
var SockJSHandler = require("vertx-web-js/sock_js_handler");

var router = Router.router(vertx);

var options = {
  'inboundPermitteds': [
    // Allow calls to login and authorise
    {
      'address': 'vertx.basicauthmanager.login'
    }
  ],
  'outboundPermitteds' : [
    {
      'address': 'what-time-is-it'
    }
  ]
};

// We need cookies, sessions and request bodies
//router.route().handler(CookieHandler.create().handle);
//router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)).handle);

router.route("/eventbus/*").handler(SockJSHandler.create(vertx).bridge(options).handle);

vertx.createHttpServer().requestHandler(router.accept).listen(8080);

// de-knallisworld-mock

vertx.eventBus().consumer('vertx.basicauthmanager.login', function(message) {
  var messageBody = message.body();
  if (messageBody.action === 'findone' && messageBody.collection === 'users') {
    console.log("username:" + messageBody.matcher.username);
    if (messageBody.matcher.username === 'valid') {
      message.reply({
        status: 'ok',
        result: {
          username: 'validuser'
        }
      });
    } else {
      message.reply({
        status: 'denied',
        message: 'Could not found'
      });
    }
  } else {
    message.reply({
      status: 'error',
      message: 'Unknown collection or action'
    });
  }
});

vertx.setPeriodic(1000, function (timerId) {
  vertx.eventBus().publish('what-time-is-it', {
    time: new Date().getTime()
  });
});
