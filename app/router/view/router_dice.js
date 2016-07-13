module.exports = {
    route: function (router) {
        router.route("/throwing")
            .get(function (req, res) {
                require("../../view/throwing_dice.js")(req, res);
            });
    }
};
