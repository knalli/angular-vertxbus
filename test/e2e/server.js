const express = require('express');
const app = express();

app.use(express.static(__dirname + '/web'));
app.use(express.static(__dirname + '/../../'));

let server = app.listen(3000, () => console.log(`Listening on port ${server.address().port}`));
