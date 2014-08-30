express = require 'express'
app = express()

app.use express.static(__dirname + '/web')
app.use express.static(__dirname + '/../../')

server = app.listen 3000, ->
  console.log "Listening on port #{server.address().port}"
