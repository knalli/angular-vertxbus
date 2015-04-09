###
  An AngularJS wrapper for projects using the VertX Event Bus

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
angular.module('knalli.angular-vertxbus')
.provider('vertxEventBus', () ->

  CONSTANTS =
    MODULE: 'angular-vertxbus'
    COMPONENT: 'wrapper'

  DEFAULT_OPTIONS =
    enabled: true
    debugEnabled: false
    prefix: 'vertx-eventbus.'
    urlServer: "#{location.protocol}//#{location.hostname}#{if location.port then ':' + location.port else ''}"
    urlPath: '/eventbus'
    reconnectEnabled: true
    sockjsStateInterval: 10000
    sockjsReconnectInterval: 10000
    sockjsOptions: {}
    messageBuffer: 0

  options = angular.extend({}, DEFAULT_OPTIONS)

  @enable = (value = DEFAULT_OPTIONS.enabled) ->
    options.enabled = value is true
    return this
  @enable.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.enable"

  @useDebug = (value = DEFAULT_OPTIONS.debugEnabled) ->
    options.debugEnabled = value is true
    return this
  @useDebug.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useDebug"

  @usePrefix = (value = DEFAULT_OPTIONS.prefix) ->
    options.prefix = value
    return this
  @usePrefix.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.usePrefix"

  @useUrlServer = (value = DEFAULT_OPTIONS.urlServer) ->
    options.urlServer = value
    return this
  @useUrlServer.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useUrlServer"

  @useUrlPath = (value = DEFAULT_OPTIONS.urlPath) ->
    options.urlPath = value
    return this
  @useUrlPath.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useUrlPath"

  @useReconnect = (value = DEFAULT_OPTIONS.reconnectEnabled) ->
    options.reconnectEnabled = value
    return this
  @useReconnect.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useReconnect"

  @useSockJsStateInterval = (value = DEFAULT_OPTIONS.sockjsStateInterval) ->
    options.sockjsStateInterval = value
    return this
  @useSockJsStateInterval.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useSockJsStateInterval"

  @useSockJsReconnectInterval = (value = DEFAULT_OPTIONS.sockjsReconnectInterval) ->
    options.sockjsReconnectInterval = value
    return this
  @useSockJsReconnectInterval.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useSockJsReconnectInterval"

  @useSockJsOptions = (value = DEFAULT_OPTIONS.sockjsOptions) ->
    options.sockjsOptions = value
    return this
  @useSockJsOptions.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useSockJsOptions"

  @useMessageBuffer = (value = DEFAULT_OPTIONS.messageBuffer) ->
    options.messageBuffer = value
    return this
  @useMessageBuffer.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: provider.useMessageBuffer"

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
  @$get = ($timeout, $log) ->
    # Extract options (with defaults)
    { enabled, debugEnabled, prefix, urlServer, urlPath, reconnectEnabled,
      sockjsStateInterval, sockjsReconnectInterval, sockjsOptions
    } = angular.extend {}, DEFAULT_OPTIONS, options

    EventBusStub = null
    EventBusOriginal = vertx?.EventBus

    if enabled and EventBusOriginal
      url = "#{urlServer}#{urlPath}"
      $log.debug("[Vert.x EB Stub] Enabled: connecting '#{url}'") if debugEnabled
      # Because we have rebuild an EventBus object (because it have to rebuild a SockJS object)
      # we must wrap the object. Therefore, we have to mimic the behavior of onopen and onclose each time.
      eventBus = null
      disconnectTimeoutEnabled = yes

      connect = ->
        eventBus = new EventBusOriginal url, undefined, sockjsOptions
        eventBus.onopen = ->
          $log.debug("[Vert.x EB Stub] Connected") if debugEnabled
          EventBusStub.onopen() if typeof EventBusStub.onopen is 'function'
          return #void
        eventBus.onclose = ->
          EventBusStub.onclose() if typeof EventBusStub.onclose is 'function'
          unless disconnectTimeoutEnabled
            $log.debug("[Vert.x EB Stub] Reconnect immediately") if debugEnabled
            disconnectTimeoutEnabled = yes
            connect()
          else
            if reconnectEnabled
              $log.debug("[Vert.x EB Stub] Reconnect in #{sockjsReconnectInterval}ms") if debugEnabled
              $timeout(connect, sockjsReconnectInterval)
          return #void
        return #void
      connect()

      EventBusStub =
        reconnect: (immediately = no) ->
          if eventBus.readyState() is EventBusStub.EventBus.OPEN
            disconnectTimeoutEnabled = no if immediately
            eventBus.close()
          else
            connect()
        close: ->
          eventBus.close()
        login: (username, password, replyHandler) ->
          eventBus.login(username, password, replyHandler)
        send: (address, message, replyHandler) ->
          eventBus.send(address, message, replyHandler)
        publish: (address, message) ->
          eventBus.publish(address, message)
        registerHandler: (address, handler) ->
          eventBus.registerHandler(address, handler)
          ### and return the deregister callback ###
          deconstructor = ->
            EventBusStub.unregisterHandler(address, handler)
            return #void
          deconstructor.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.registerHandler (deconstructor)"
          return deconstructor
        unregisterHandler: (address, handler) ->
          # the handler is only valid when connected
          if eventBus.readyState() is EventBusStub.EventBus.OPEN
            eventBus.unregisterHandler(address, handler)
        readyState: ->
          eventBus.readyState()
        ### expose current used internal instance of actual EventBus ###
        EventBus: EventBusOriginal
        getOptions: ->
          angular.extend({}, options)

      EventBusStub.reconnect.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.reconnect"
      EventBusStub.close.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.close"
      EventBusStub.login.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.login"
      EventBusStub.send.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.send"
      EventBusStub.publish.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.publish"
      EventBusStub.registerHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.registerHandler"
      EventBusStub.unregisterHandler.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.unregisterHandler"
      EventBusStub.readyState.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.readyState"
      EventBusStub.getOptions.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: EventBusStub.getOptions"

    else
      $log.debug("[Vert.x EB Stub] Disabled") if debugEnabled

    return EventBusStub

  @$get.displayName = "#{CONSTANTS.MODULE}/#{CONSTANTS.COMPONENT}: Factory.get"

  return #void
)
