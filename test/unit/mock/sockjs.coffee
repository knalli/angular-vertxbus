class SockJS

  onopen: undefined
  onclose: undefined
  onmessage: undefined

  @mockInstances: []
  @currentMockInstance: null

  constructor: (@url, @whitelist, @options, mockOptions) ->
    SockJS.mockInstances.push this
    SockJS.currentMockInstance = this
    console.debug "[MOCK] SockJS Constructur(#{url})"
    fn = =>
        @onopen() if typeof @onopen is 'function'
        return
    if mockOptions?.timeout
      window.setTimeout fn, mockOptions.timeout
    else
      window.setTimeout fn, 1

  close: (mockOptions)->
    console.debug "[MOCK] SockJS.close()"
    fn = =>
        @onclose() if typeof @onclose is 'function'
        return
    if mockOptions?.timeout
      window.setTimeout fn, mockOptions.timeout
    else
      fn()
    return

  send: (message) ->
    console.debug "[MOCK] SockJS.send(#{message})"
