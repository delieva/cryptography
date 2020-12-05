const https = require("https");
const fs = require("fs");
const express = require("express");

const options = {
	cert: fs.readFileSync('server.crt'),
	key: fs.readFileSync('server.key')
};

const app = express();

app.use((req, res) => {
	res.writeHead(200);
	res.end("hello world\n");
});

app.listen(8000);

https.createServer(options, app).listen(8443);
