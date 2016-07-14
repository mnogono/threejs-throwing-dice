var express = require("express");

var router = express.Router();

router.get("/", function(req, res){
    res.writeHeader(302, {
        "Location": "/view/throwing"
    });
    res.end();
});

module.exports = router;
