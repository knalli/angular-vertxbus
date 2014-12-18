class SockJS

  onopen: undefined
  onclose: undefined
  onmessage: undefined
  sessionId: undefined

  # for mocks
  nextLoginState: true

  @mockInstances: []
  @currentMockInstance: null

  constructor: (@url, @whitelist, @options, mockOptions) ->
    SockJS.mockInstances.push this
    SockJS.currentMockInstance = this
    fn = =>
        @onopen() if typeof @onopen is 'function'
        return
    if mockOptions?.timeout
      window.setTimeout fn, mockOptions.timeout
    else
      window.setTimeout fn, 1

  log: ->
    log = SockJS.currentMockInstance?.$log or window.console
    log.debug.apply(this, arguments)

  close: (mockOptions)->
    @log "[MOCK] SockJS.close()"
    fn = =>
        @onclose() if typeof @onclose is 'function'
        return
    if mockOptions?.timeout
      window.setTimeout fn, mockOptions.timeout
    else
      fn()
    return

  send: (message) ->
    json = JSON.parse message
    return if json.type isnt 'send'
    data = null
    try
      data = @_unwrapFromEvent(message)
    catch e
      return
    @log "[MOCK] SockJS.send(#{message})"
    if data.address is 'vertx.basicauthmanager.login'
      reply = if @nextLoginState
                @_buildLoginReplyAsSuccess(data.body.username, data.body.password)
              else
                @_buildLoginReplyAsFail(data.body.username, data.body.password)
      @onmessage @_wrapToEvent data.replyAddress, reply
    return

  onmessage: null

  _unwrapFromEvent: (msg) ->
    JSON.parse msg

  _wrapToEvent: (address, body, replyAddress) ->
    data: JSON.stringify {address, body, replyAddress}

  _buildLoginReplyAsSuccess: (username, password) ->
    @sessionId = "SESSION#{Math.round 1000000 * Math.random()}"
    # return
    status: 'ok'
    sessionID: @sessionId

  _buildLoginReplyAsFail: (username, password) ->
    # return
    status: 'fail'
