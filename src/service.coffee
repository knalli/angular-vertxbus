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
angular.module('knalli.angular-vertxbus')
.service('vertxEventBusService', ($rootScope, $q, $interval, $timeout, vertxEventBus) ->

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
  } = vertxEventBus.getOptions()

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
