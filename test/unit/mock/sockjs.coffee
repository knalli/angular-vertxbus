class SockJS

  constructor: (@url, @whitelist, @options) ->
    console.log "[MOCK] SockJS Constructur(#{url})"

  close: ->
    console.log "[MOCK] SockJS.close()"

  send: (message) ->
    console.log "[MOCK] SockJS.send(#{message})"