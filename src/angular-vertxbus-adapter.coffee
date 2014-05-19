# jshint undef: true
# global SockJS: false, vertx: false

DEFAULT_OPTIONS =
  enabled: true
  debugEnabled: false
  prefix: 'vertx-eventbus.'
  urlServer: "#{location.protocol}//#{location.hostname}:#{location.port or 80}"
  urlPath: '/eventbus'
  reconnectEnabled: true
  sockjsStateInterval: 10000
  sockjsReconnectInterval: 10000
  sockjsOptions: {}
  messageBuffer: 0

###
  An AngularJS wrapper for projects using the VertX Event Bus

  This module as some options (as constant property object "angularVertxbusOptions")

  * enabled (default true): if false, the usage of the Event Bus will be disabled (actually, no vertx.EventBus will be created)
  * debugEnabled (default false): if true, some additional debug loggings will be displayed
  * prefix (default 'vertx-eventbus.'): a prefix used for the global broadcasts
  * urlServer (default location.protocol + '//' + location.hostname + ':' + (location.port || 80): full URL to the server (change it if the server is not the origin)
  * urlPath (default '/eventbus'): path to the event bus
  * reconnectEnabled (default true): if false, the disconnect will be recognized but no further actions
  * sockjsStateInterval (default 10000 ms): defines the check interval of the underlayling SockJS connection
  * sockjsReconnectInterval (default 10000 ms): defines the wait time for a reconnect after a disconnect has been recognized
  * sockjsOptions (default {}): optional SockJS options (new SockJS(url, undefined, options))
###
module = angular.module('knalli.angular-vertxbus', ['ng'])
.constant('angularVertxbusOptions', angular.extend({}, DEFAULT_OPTIONS))

.provider('vertxEventBus', (angularVertxbusOptions) ->

  @enable = (value = DEFAULT_OPTIONS.enabled) ->
    angularVertxbusOptions.enabled = value is true
    return this

  @useDebug = (value = DEFAULT_OPTIONS.debugEnabled) ->
    angularVertxbusOptions.debugEnabled = value is true
    return this

  @usePrefix = (value = DEFAULT_OPTIONS.prefix) ->
    angularVertxbusOptions.prefix = value
    return this

  @useUrlServer = (value = DEFAULT_OPTIONS.urlServer) ->
    angularVertxbusOptions.urlServer = value
    return this

  @useUrlPath = (value = DEFAULT_OPTIONS.urlPath) ->
    angularVertxbusOptions.urlPath = value
    return this

  @useReconnect = (value = DEFAULT_OPTIONS.reconnectEnabled) ->
    angularVertxbusOptions.reconnectEnabled = value
    return this

  @useSockJsStateInterval = (value = DEFAULT_OPTIONS.sockjsStateInterval) ->
    angularVertxbusOptions.sockjsStateInterval = value
    return this

  @useSockJsReconnectInterval = (value = DEFAULT_OPTIONS.sockjsReconnectInterval) ->
    angularVertxbusOptions.sockjsReconnectInterval = value
    return this

  @useSockJsOptions = (value = DEFAULT_OPTIONS.sockjsOptions) ->
    angularVertxbusOptions.sockjsOptions = value
    return this

  @useMessageBuffer = (value = DEFAULT_OPTIONS.messageBuffer) ->
    angularVertxbusOptions.messageBuffer = value
    return this

  ###
    A stub representing the VertX Event Bus (core functionality)

    Because the Event Bus cannot handle a reconnect (because of the underlaying SockJS), a new instance of the bus have to be created.
    This stub ensures only one object holding the current active instance of the bus.

    The stub supports theses VertX Event Bus APIs:
    - close()
    - login(username, password, replyHandler)
    - send(address, message, handler)
    - publish(address, message)
    - registerHandler(adress, handler)
    - unregisterHandler(address, handler)
    - readyState()

    Furthermore, the stub supports theses extra APIs:
    - recconnect()
  ###
  @$get = (angularVertxbusOptions, $timeout) ->
    # Extract options (with defaults)
    { enabled, debugEnabled, prefix, urlServer, urlPath, reconnectEnabled,
      sockjsStateInterval, sockjsReconnectInterval, sockjsOptions
    } = angular.extend {}, DEFAULT_OPTIONS, angularVertxbusOptions

    stub = null
    EventBus_ = vertx?.EventBus
    if enabled and EventBus_
      url = "#{urlServer}#{urlPath}"
      console.debug("[Vertex EventBus] Enabled: connecting '#{url}'") if debugEnabled
      # Because we have rebuild an EventBus object (because it have to rebuild a SockJS object)
      # we must wrap the object. Therefore, we have to mimic the behavior of onopen and onclose each time.
      eventBus = null
      connect = ->
        eventBus = new EventBus_ url, undefined, sockjsOptions
        eventBus.onopen = ->
          console.debug("[VertX EventBus] Connected") if debugEnabled
          stub.onopen() if typeof stub.onopen is 'function'
          return
        eventBus.onclose = ->
          console.debug("[VertX EventBus] Reconnect in #{sockjsReconnectInterval}ms") if debugEnabled
          stub.onclose() if typeof stub.onclose is 'function'
          $timeout(connect, sockjsReconnectInterval) if reconnectEnabled
          return
        return
      connect()
      stub =
        reconnect: ->
          eventBus.close()
        close: -> eventBus.close()
        login: (username, password, replyHandler) -> eventBus.login(username, password, replyHandler)
        send: (address, message, replyHandler) -> eventBus.send(address, message, replyHandler)
        publish: (address, message) -> eventBus.publish(address, message)
        registerHandler: (address, handler) ->
          eventBus.registerHandler(address, handler)
          () ->
            stub.unregisterHandler(address, handler)
            return
        unregisterHandler: (address, handler) -> eventBus.unregisterHandler(address, handler)
        readyState: -> eventBus.readyState()
        EventBus: EventBus_ #expose used object
    else
      console.debug("[VertX EventBus] Disabled") if debugEnabled
    return stub

  return
)

###
  A service utilitzing an underlaying Vertx Event Bus

  The advanced features of this service are:
  - broadcasting the connection changes (vertx-eventbus.system.connected, vertx-eventbus.system.disconnected) on $rootScope
  - registering all handlers again when a reconnect had been required
  - supporting a promise when using send()
  - adding aliases on (registerHandler), un (unregisterHandler) and emit (publish)

  Basic usage:
  module.controller('MyController', function('vertxEventService'){
    vertxEventService.on('my.address', function(message) {
      console.log("JSON Message received: ", message)
    });
    vertxEventService.publish('my.other.address', {type: 'foo', data: 'bar'});
  });

  Note the additional configuration of the module itself.
###
module.service('vertxEventBusService', ($rootScope, $q, $interval, $timeout, vertxEventBus, angularVertxbusOptions) ->

  class MessageQueueHolder
    constructor: (@maxSize = 10) ->
      @items = []
    push: (item) ->
      @items.push(item)
      return @recalibrateBufferSize()
    recalibrateBufferSize: ->
      @first() while @items.length > @maxSize
      return this
    last: -> @items.pop()
    first: -> @items.shift(0)
    size: -> @items.length

  # Extract options (with defaults)
  { enabled, debugEnabled, prefix, urlServer, urlPath, reconnectEnabled,
    sockjsStateInterval, sockjsReconnectInterval, sockjsOptions,
    messageBuffer
  } = angular.extend {}, DEFAULT_OPTIONS, angularVertxbusOptions

  connectionState = vertxEventBus?.EventBus?.CLOSED
  messageQueueHolder = new MessageQueueHolder(messageBuffer)

  if enabled and vertxEventBus
    vertxEventBus.onopen = ->
      wrapped.getConnectionState(true)
      $rootScope.$broadcast "#{prefix}system.connected"
      for own address, callbacks of wrapped.handlers
        for callback in callbacks
          util.registerHandler(address, callback)
      $rootScope.$digest()
      # consume message queue?
      if messageBuffer and messageQueueHolder.size()
        while messageQueueHolder.size()
          fn = messageQueueHolder.first()
          fn() if typeof fn is 'function'
        $rootScope.$digest()
      return
    vertxEventBus.onclose = ->
      wrapped.getConnectionState(true)
      $rootScope.$broadcast "#{prefix}system.disconnected"

  ensureOpenConnection = (fn) ->
    if wrapped.getConnectionState() is vertxEventBus.EventBus.OPEN
      fn()
      return true
    else if messageBuffer
      messageQueueHolder.push(fn)
      return true
    return false

  # All utility methods working directly on the event bus object.
  # The object "vertxEventBus" must be available.
  util =
    # Register a callback handler for the specified address match.
    registerHandler : (address, callback) ->
      return unless typeof callback is 'function'
      console.debug("[VertX EventBus] Register handler for #{address}") if debugEnabled
      vertxEventBus.registerHandler address, (message, replyTo) ->
        callback(message, replyTo)
        $rootScope.$digest()
    # Remove a callback handler for the specified address match.
    unregisterHandler : (address, callback) ->
      return unless typeof callback is 'function'
      console.debug("[VertX EventBus] Unregister handler for #{address}") if debugEnabled
      vertxEventBus.unregisterHandler address, callback
    # Send a message to the specified address (using EventBus.send).
    # @param address a required string for the targeting address in the bus
    # @param message a required piece of message data
    # @param expectReply an optional true which returns a promise waiting for a direct reply
    # @param timeout an optional number for a timout after which the promise will be rejected
    send : (address, message, expectReply, timeout = 10000) ->
      deferred = $q.defer() if expectReply
      dispatched = ensureOpenConnection ->
        vertxEventBus.send address, message, (reply) ->
          if deferred then deferred.resolve reply
          if typeof expectReply is 'function' then expectReply(reply) # Handle a "callback"
        # Register timeout for promise rejecting.
        if deferred then $timeout (-> deferred.reject()), timeout
      if deferred and !dispatched then deferred.reject()
      return deferred?.promise
  # Publish a message to the specified address (using EventBus.publish).
  # @param address a required string for the targeting address in the bus
  # @param message a required piece of message data
    publish : (address, message) ->
      dispatched = ensureOpenConnection ->
        vertxEventBus.publish address, message
      return dispatched

  # Wrapping methods for the api
  wrapped =
    # Store of all handlers using as a cache when the event bus is not online
    handlers : {}
    # Stub for util.registerHandler: Hold back all registers which will be performed when the
    # EventBus will be online
    registerHandler : (address, callback) ->
      wrapped.handlers[address] = [] unless wrapped.handlers[address]
      wrapped.handlers[address].push callback
      if connectionState is vertxEventBus.EventBus.OPEN then util.registerHandler(address, callback)
      () ->
        wrapped.unregisterHandler(address, callback)
        return
    # Stub for util.unregisterHandler (see registerHandler)
    unregisterHandler : (address, callback) ->
      # Remove from internal map
      if wrapped.handlers[address]
        index = wrapped.handlers[address].indexOf(callback)
        wrapped.handlers[address].splice(index, 1) if index > -1
      # Remove from real instance
      if connectionState is vertxEventBus.EventBus.OPEN then util.unregisterHandler(address, callback)
    # Stub for util.send
    send : (address, message, expectReply, timeout = 10000) ->
      util.send(address, message, expectReply, timeout)
  # Stub for util.publish
    publish : (address, message) ->
      util.publish(address, message)
    # Get the current connection state of the event bus.
    # @param immediate if true the state will be re-fetched from the event bus
    getConnectionState : (immediate) ->
      if vertxEventBus?.EventBus
        if enabled
          connectionState = vertxEventBus.readyState() if immediate
        else
          connectionState = vertxEventBus.EventBus.CLOSED
      else
        connectionState = 3 # CLOSED
      return connectionState

  # Update the current connection state periodially.
  $interval (-> wrapped.getConnectionState(true)), sockjsStateInterval

  api =
    on : wrapped.registerHandler
    addListener : wrapped.registerHandler
    un : wrapped.unregisterHandler
    removeListener : wrapped.unregisterHandler,
    send : wrapped.send
    publish : wrapped.publish
    emit : wrapped.publish
    readyState : wrapped.getConnectionState
    isEnabled : -> enabled
    getBufferCount: -> messageQueueHolder.size()
  return api
)
