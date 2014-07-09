var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var eb = vertx.eventBus;

eb.registerHandler('com.knallisworld.persistor', function(message, callback) {
  console.log(JSON.stringify(message));
  if (message.action === 'findone' && message.collection === 'users') {
    console.log("username:" + message.matcher.username);
    if (message.matcher.username === 'valid') {
      callback({
        status: 'ok',
        result: {
          username: 'validuser'
        }
      });
    } else {
      callback({
        status: 'denied',
        message: 'Could not found'
      });
    }
  } else {
    callback({
      status: 'error',
      message: 'Unknown collection or action'
    });
  }
  console.log(JSON.stringify(message));
});
