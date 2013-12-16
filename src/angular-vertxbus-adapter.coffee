# jshint undef: true
# global SockJS: false, vertx: false

###
  An AngularJS wrapper for projects using the VertX Event Bus

  This module as some options

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
.value('enabled', true)
.value('debugEnabled', false)
.value('prefix', 'vertx-eventbus.')
.value('urlServer', "#{location.protocol}//#{location.hostname}:#{location.port or 80}")
.value('urlPath', '/eventbus')
.value('reconnectEnabled', true)
.value('sockjsStateInterval', 10000)
.value('sockjsReconnectInterval', 10000)
.value('sockjsOptions', {})

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
module.factory('vertxEventBus', ($timeout, prefix, urlServer, urlPath, sockjsOptions, enabled, debugEnabled, reconnectEnabled, sockjsReconnectInterval) ->
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
      registerHandler: (address, handler) -> eventBus.registerHandler(address, handler)
      unregisterHandler: (address, handler) -> eventBus.unregisterHandler(address, handler)
      readyState: -> eventBus.readyState()
      EventBus: EventBus_ #expose used object
  else
    console.debug("[VertX EventBus] Disabled") if debugEnabled
  return stub
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
module.service('vertxEventBusService', ($rootScope, $q, $interval, $timeout, vertxEventBus, prefix, enabled, sockjsStateInterval) ->

  connectionState = vertxEventBus?.EventBus?.CLOSED

  if enabled and vertxEventBus
    vertxEventBus.onopen = ->
      wrapped.getConnectionState(true)
      $rootScope.$broadcast "#{prefix}system.connected"
      for own address, callbacks of wrapped.handlers
        for callback in callbacks
          util.registerHandler(address, callback)
      $rootScope.$digest()
    vertxEventBus.onclose = ->
      wrapped.getConnectionState(true)
      $rootScope.$broadcast "#{prefix}system.disconnected"

  # All utility methods working directly on the event bus object.
  # The object "vertxEventBus" must be available.
  util =
    # Register a callback handler for the specified address match.
    registerHandler : (address, callback) ->
      return unless typeof callback is 'function'
      if debugEnabled then  console.debug "[VertX EventBus] Register handler for #{address}"
      vertxEventBus.registerHandler address, (message, replyTo) ->
        callback(message, replyTo)
        $rootScope.$digest()
    # Remove a callback handler for the specified address match.
    unregisterHandler : (address, callback) ->
      return unless typeof callback is 'function'
      if debugEnabled then  console.debug "[VertX EventBus] Unregister handler for #{address}"
      vertxEventBus.unregisterHandler address, callback
    # Send a message to the specified address (using EventBus.send).
    # @param address a required string for the targeting address in the bus
    # @param message a required piece of message data
    # @param expectReply an optional true which returns a promise waiting for a direct reply
    # @param timeout an optional number for a timout after which the promise will be rejected
    send : (address, message, expectReply, timeout = 10000) ->
      deferred = $q.defer() if expectReply
      vertxEventBus.send address, message, (reply) ->
        if deferred then deferred.resolve reply
        if typeof expectReply is 'function' then expectReply(reply) # Handle a "callback"
      # Register timeout for promise rejecting.
      if deferred then $timeout (-> deferred.reject()), timeout
      return deferred?.promise
  # Publish a message to the specified address (using EventBus.publish).
  # @param address a required string for the targeting address in the bus
  # @param message a required piece of message data
    publish : (address, message) ->
      vertxEventBus.publish address, message
      $q.resolve() # direct resolve because of publish

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
    # Stub for util.unregisterHandler (see registerHandler)
    unregisterHandler : (address, callback) ->
      # Remove from internal map
      if wrapped.handlers[address] and callback wrapped.handlers[address]
        index = wrapped.handlers[address].indexOf(callback)
        wrapped.handlers[address].splice(index, 1) if index > -1
      # Remove from real instance
      if connectionState is vertxEventBus.EventBus.OPEN then util.unregisterHandler(address, callback)
    # Stub for util.send
    send : (address, message, expectReply, timeout = 10000) ->
      if connectionState is vertxEventBus.EventBus.OPEN then util.send(address, message, expectReply, timeout) else $q.reject()
  # Stub for util.publish
    publish : (address, message) ->
      if connectionState is vertxEventBus.EventBus.OPEN then util.publish(address, message) else $q.reject()
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
  return api
)
