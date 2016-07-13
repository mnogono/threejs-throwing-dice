var bodyParser = require("body-parser");
var handlebars = require("handlebars");
var express_handlebars = require("express-handlebars");
var app = express();
app.use(express.static("public"));
app.engine(".html", express_handlebars({defaultLayout: "single", extname: ".html"}));
app.set("view engine", ".html");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var router = express.Router();

app.use("/", require(__dirname + "/router/router_redirect.js"));
app.use("/view", require(__dirname + "/router/router_view.js"));

module.exports = app;
