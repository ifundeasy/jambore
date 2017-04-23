var express = require('express');
var router = express.Router();
//
module.exports = function (args) {
    var info = args.info;
    router.get('/test', function(req, res, next) {
        res.send(req.auth);
    });
    router.get('/login', function(req, res, next) {
        res.render('login');
    });
    router.get('/', function(req, res, next) {
        res.render('index', {
            auth : req.auth,
            title : info.settings.title,
            username : req.auth.username
        });
    });
    return router;
};