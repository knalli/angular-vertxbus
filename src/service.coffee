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
.provider('vertxEventBusService', () ->

  CONSTANTS =
    MODULE: 'angular-vertxbus'
    COMPONENT: 'service'

  DEFAULT_OPTIONS =
    loginRequired: false
    loginBlockForSession: false #NYI
    skipUnauthorizeds: true #NYI

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

  class SimpleMap
    keys: null
    values: null
    constructor: ->
      @keys = []
      @values = []
    put: (key, value) ->
      idx = @_indexForKey key
      if idx > -1
        @values[idx] = value
      else
        @keys.push key
        @values.push value
      return this
    _indexForKey: (key) ->
      for k, i in @keys when key is k
        return i
      return -1
    _indexForValue: (value) ->
      for v, i in @values when value is v
        return i
      return -1
    containsKey: (key) ->
      idx = @_indexForKey key
      return idx > -1
    containsValue: (value) ->
      idx = @_indexForValue value
      return idx > -1
    get: (key) ->
      idx = @_indexForKey key
      if idx > -1
        return @values[idx]
      return undefined
    remove: (key) ->
      idx = @_indexForKey key
      if idx > -1
        @keys[idx] = undefined
        @values[idx] = undefined
      return undefined
    clear: ->
      @keys = []
      @values = []
      return this

  options = angular.extend({}, DEFAULT_OPTIONS)

  # private
  @requireLogin = (value = options.loginRequired) ->
    options.loginRequired = value
    return this
  @requireLogin.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: requireLogin"

  # private: NYI
  @blockForSession = (value = options.loginBlockForSession) ->
    options.loginBlockForSession = value
    return this
  @blockForSession.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: blockForSession"

  # private: NYI
  @skipUnauthorizeds = (value = options.skipUnauthorizeds) ->
    options.skipUnauthorizeds = value
    return this
  @skipUnauthorizeds.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: skipUnauthorizeds"

  @$get = ($rootScope, $q, $interval, $timeout, vertxEventBus) ->
    # Extract options (with defaults)
    { enabled, debugEnabled, prefix, urlServer, urlPath, reconnectEnabled,
      sockjsStateInterval, sockjsReconnectInterval, sockjsOptions,
      messageBuffer
    } = vertxEventBus?.getOptions() or {}

    connectionState = vertxEventBus?.EventBus?.CLOSED
    validSession = false
    loginPromise = null
    messageQueueHolder = new MessageQueueHolder(messageBuffer)

    fnWrapperMap = new SimpleMap # handlers are wrapped, so we have to keep track

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
        return #void
      vertxEventBus.onclose = ->
        wrapped.getConnectionState(true)
        $rootScope.$broadcast "#{prefix}system.disconnected"
      vertxEventBus.onclose.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: 'onclose' handler"

    ensureOpenConnection = (fn) ->
      if wrapped.getConnectionState() is vertxEventBus.EventBus.OPEN
        fn()
        return true
      else if messageBuffer
        messageQueueHolder.push(fn)
        return true
      return false
    ensureOpenConnection.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: ensureOpenConnection"

    ensureOpenAuthConnection = (fn) ->
      unless options.loginRequired
        # easy: no login required
        ensureOpenConnection fn
      else
        wrapFn = ->
          if validSession
            fn()
            return true
          else
            # ignore this message
            console.debug("[VertX EB Service] Message was not sent because login is required") if debugEnabled
            return false
        wrapFn.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: ensureOpenAuthConnection function wrapper"
        ensureOpenConnection wrapFn
    ensureOpenAuthConnection.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: ensureOpenAuthConnection"

    # All utility methods working directly on the event bus object.
    # The object "vertxEventBus" must be available.
    util =
      # Register a callback handler for the specified address match.
      registerHandler : (address, callback) ->
        return unless typeof callback is 'function'
        console.debug("[VertX EB Service] Register handler for #{address}") if debugEnabled
        return fnWrapperMap.get(callback) if fnWrapperMap.containsKey(callback) # already known
        deconstructor = (message, replyTo) ->
          callback(message, replyTo)
          $rootScope.$digest()
        deconstructor.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.registerHandler (deconstructor)"
        fnWrapperMap.put(callback, deconstructor)
        vertxEventBus.registerHandler address, fnWrapperMap.get(callback)
      # Remove a callback handler for the specified address match.
      unregisterHandler : (address, callback) ->
        return unless typeof callback is 'function'
        console.debug("[VertX EB Service] Unregister handler for #{address}") if debugEnabled
        vertxEventBus.unregisterHandler address, fnWrapperMap.get(callback)
        fnWrapperMap.remove(callback)
        return #void
      # Send a message to the specified address (using EventBus.send).
      # @param address a required string for the targeting address in the bus
      # @param message a required piece of message data
      # @param timeout an optional number for a timout after which the promise will be rejected
      send : (address, message, timeout = 10000) ->
        deferred = $q.defer()
        next = ->
          vertxEventBus.send address, message, (reply) ->
            if deferred then deferred.resolve reply
          # Register timeout for promise rejecting.
          if deferred then $timeout (-> deferred.reject()), timeout
        next.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.send (ensureOpenAuthConnection callback)"
        dispatched = ensureOpenAuthConnection next
        if deferred and !dispatched then deferred.reject()
        return deferred?.promise
      # Publish a message to the specified address (using EventBus.publish).
      # @param address a required string for the targeting address in the bus
      # @param message a required piece of message data
      publish : (address, message) ->
        next = ->
          vertxEventBus.publish address, message
        next.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.publish (ensureOpenAuthConnection callback)"
        dispatched = ensureOpenAuthConnection next
        return dispatched
      # Send a login message
      # @param username
      # @param password
      # @param timeout
      login : (username, password, timeout = 5000) ->
        deferred = $q.defer()
        next = (reply) ->
          if reply?.status is 'ok'
            deferred.resolve reply
            $rootScope.$broadcast "#{prefix}system.login.succeeded", (status: reply?.status)
          else
            deferred.reject reply
            $rootScope.$broadcast "#{prefix}system.login.failed", (status: reply?.status)
        next.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.login (callback)"
        vertxEventBus.login username, password, next
        $timeout (-> deferred.reject()), timeout
        return deferred.promise

    util.registerHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.registerHandler"
    util.unregisterHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.unregisterHandler"
    util.send.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.send"
    util.publish.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.publish"
    util.login.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: util.login"

    # Wrapping methods for the api
    wrapped =
      # Store of all handlers using as a cache when the event bus is not online
      handlers : {}
      # Stub for util.registerHandler: Hold back all registers which will be performed when the
      # EventBus will be online
      registerHandler : (address, callback) ->
        wrapped.handlers[address] = [] unless wrapped.handlers[address]
        wrapped.handlers[address].push callback
        unregisterFn = null
        if connectionState is vertxEventBus.EventBus.OPEN
          unregisterFn = util.registerHandler(address, callback)
        ### and return the deregister callback ###
        return ->
          unregisterFn() if unregisterFn
          # Remove from internal map
          if wrapped.handlers[address]
            index = wrapped.handlers[address].indexOf(callback)
            wrapped.handlers[address].splice(index, 1) if index > -1
          return #void
      # Stub for util.unregisterHandler (see registerHandler)
      unregisterHandler : (address, callback) ->
        # Remove from internal map
        if wrapped.handlers[address]
          index = wrapped.handlers[address].indexOf(callback)
          wrapped.handlers[address].splice(index, 1) if index > -1
        # Remove from real instance
        if connectionState is vertxEventBus.EventBus.OPEN then util.unregisterHandler(address, callback)
      # Stub for util.send
      send : (address, message, timeout = 10000) ->
        util.send(address, message, timeout)
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
      isValidSession: -> validSession
      login : (username, password) ->
        util.login(username, password)
        .then (reply) ->
          validSession = true
          return reply
        .catch (reply) ->
          validSession = false
          return reply

    wrapped.registerHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.registerHandler"
    wrapped.unregisterHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.unregisterHandler"
    wrapped.send.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.send"
    wrapped.publish.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.publish"
    wrapped.getConnectionState.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.getConnectionState"
    wrapped.isValidSession.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.isValidSession"
    wrapped.login.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: wrapped.login"

    # Update the current connection state periodially.
    connectionIntervalCheck = -> wrapped.getConnectionState(true)
    connectionIntervalCheck.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: periodic connection check"
    $interval connectionIntervalCheck, sockjsStateInterval

    ### building and exposing the actual service API ###
    return (
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
      isValidSession : -> validSession
      login : wrapped.login
    )
  @$get.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: initializer"

  return #void
)
