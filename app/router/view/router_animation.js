module.exports = {
    route: function (router) {
        router.route("/animation")
            .get(function (req, res) {
                require("../../view/animation.js")(req, res);
            });
    }
};
