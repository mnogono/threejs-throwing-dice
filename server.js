var app = require(__dirname + "/app");
var port = process.env.PORT || 8082;

var server = app.listen(port, function() {
	console.log("Server started: " + port);
});

module.exports = server;
