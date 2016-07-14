module.exports = {
    route: function (router) {
        router.route("/body")
            .get(function (req, res) {
                require("../../view/body.js")(req, res);
            });
    }
};
