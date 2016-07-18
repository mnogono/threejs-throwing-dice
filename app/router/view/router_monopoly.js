module.exports = {
    route: function (router) {
        router.route("/monopoly")
            .get(function (req, res) {
                require("../../view/monopoly.js")(req, res);
            });
    }
};
