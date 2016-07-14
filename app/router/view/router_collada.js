module.exports = {
    route: function (router) {
        router.route("/collada")
            .get(function (req, res) {
                require("../../view/collada.js")(req, res);
            });
    }
};
