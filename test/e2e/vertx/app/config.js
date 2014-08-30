var vertx = require('vertx');
var container = require('vertx/container');

// Configuration for the web server
var webServerConf = {

  // Normal web server stuff

  port: 8080,
  host: 'localhost',
  ssl: false,

  // Configuration for the event bus client side bridge
  // This bridges messages from the client side to the server side event bus
  bridge: true,

  inbound_permitted: [
    // Allow calls to login and authorise
    {
      address: 'vertx.basicauthmanager.login'
    }
  ],

  // This defines which messages from the server we will let through to the client
  outbound_permitted: [
    {}
  ]
};

container.deployModule('io.vertx~mod-auth-mgr~2.0.0-final', {
  persistor_address: "com.knallisworld.persistor"
});

container.deployModule('de.knallisworld~mock~1.0');
container.deployModule('io.vertx~mod-web-server~2.0.0-final', webServerConf);
