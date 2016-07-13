var express = require("express");
var router = express.Router();
var fs = require("fs");

//scan each file into router/view folder and execute function route
fs.readdirSync(__dirname + "/view").map(function(file) {
    require(__dirname + "/view/" + file).route(router);
});

module.exports = router;
