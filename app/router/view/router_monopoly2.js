module.exports = {
    route: function (router) {
        router.route("/monopoly2")
            .get(function (req, res) {
                require("../../view/monopoly2.js")(req, res);
            });
    }
};
