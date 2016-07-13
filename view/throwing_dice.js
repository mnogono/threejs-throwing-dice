var handlebars = require('handlebars');
var fs = require('fs');

module.exports = function(req, res) {
	fs.readFile(__dirname + "/throwing_dice.html", {encoding: "utf-8"}, function(err, data) {
		if (err) {
			return res.send(err.message);
		}
		
		var template = handlebars.compile(data);
		var html = template({
			customers: customers
		});
		res.send(html);		
	});		
}