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

  options = angular.extend({}, DEFAULT_OPTIONS)

  @enable = (value = DEFAULT_OPTIONS.enabled) ->
    options.enabled = value is true
    return this

  @useDebug = (value = DEFAULT_OPTIONS.debugEnabled) ->
    options.debugEnabled = value is true
    return this

  @usePrefix = (value = DEFAULT_OPTIONS.prefix) ->
    options.prefix = value
    return this

  @useUrlServer = (value = DEFAULT_OPTIONS.urlServer) ->
    options.urlServer = value
    return this

  @useUrlPath = (value = DEFAULT_OPTIONS.urlPath) ->
    options.urlPath = value
    return this

  @useReconnect = (value = DEFAULT_OPTIONS.reconnectEnabled) ->
    options.reconnectEnabled = value
    return this

  @useSockJsStateInterval = (value = DEFAULT_OPTIONS.sockjsStateInterval) ->
    options.sockjsStateInterval = value
    return this

  @useSockJsReconnectInterval = (value = DEFAULT_OPTIONS.sockjsReconnectInterval) ->
    options.sockjsReconnectInterval = value
    return this

  @useSockJsOptions = (value = DEFAULT_OPTIONS.sockjsOptions) ->
    options.sockjsOptions = value
    return this

  @useMessageBuffer = (value = DEFAULT_OPTIONS.messageBuffer) ->
    options.messageBuffer = value
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
  @$get = ($timeout) ->
    # Extract options (with defaults)
    { enabled, debugEnabled, prefix, urlServer, urlPath, reconnectEnabled,
      sockjsStateInterval, sockjsReconnectInterval, sockjsOptions
    } = angular.extend {}, DEFAULT_OPTIONS, options

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
        getOptions: -> angular.extend({}, options)
    else
      console.debug("[VertX EventBus] Disabled") if debugEnabled
    return stub

  return
)
