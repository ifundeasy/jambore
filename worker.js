var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    favicon = require('serve-favicon');
//
module.exports.run = function (worker) {
    var app = express(),
        opts = worker.options,
        pid = process.pid,
        httpServer, scServer, count;
    //
    var dn = opts.paths.appDirPath + "/",
        name = opts.appName,
        port = opts.port,
        sessionAge = opts.sessionAge,
        crypt = require(dn + "/libs/crypt"),
        getip = require(dn + '/libs/getip'),
        ip = (function () {
            var addr = "localhost";
            try {
                addr = getip();
            } catch (e) {
            }
            return addr;
        })(),
        Db = require(dn + '/libs/db'),
        db = new Db();
    //
    var auth = function (req, res, next) {
        auth.fails = auth.fails || [];
        var now = new Date().getTime();
        var R = req.auth = {
            is : false,
            path : req._parsedUrl.pathname,
            method : req.method,
            sessionId : req.cookies[name],
            qstring : req.query,
            body : req.body
        };
        console.log("!!", JSON.stringify(R,0,2));
        if (R.sessionId) {
            var decryptd;
            try {
                decryptd = crypt.de(R.sessionId);
                decryptd = decryptd.split('$');
            } catch (e) {
            }
            //
            if (decryptd) {
                var uname = decryptd[0];
                var created = parseInt(decryptd[1]);
                var until = created + sessionAge;
                var fail = function () {
                    res.clearCookie(name);
                    res.redirect('/');
                };
                db.getPanitia({
                    user_name : uname
                }, function (err, ngo) {
                    if (err) {
                        fail();
                    } else if ((ngo.length == 1) && (now < until)) {
                        if (R.path == '/logout') fail();
                        else {
                            var session = [uname, now].join('$');
                            R.sessionId = crypt.en(session);
                            res.cookie(name, R.sessionId, {maxAge : now + sessionAge, httpOnly : true});
                            if (R.path == '/login') res.redirect('/');
                            else {
                                req.auth.is = true;
                                req.auth.user_name = ngo[0].user_name;
                                req.auth.panitia_id = ngo[0]._id;
                                req.auth.name = ngo[0].name;
                                next();
                            }
                        }
                    } else fail();
                });
            }
        } else {
            if (R.method == 'POST') {
                var b = req.body;
                auth.fails = [];
                switch (R.path) {
                    case '/getMaps':
                        db.getMaps({}, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', maps : ngo2});
                            }
                        });
                        break;
                    case '/summaryAbsenJambore':
                        db.summaryAbsenJambore({}, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/summaryAbsenCamp':
                        db.summaryAbsenCamp({}, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/summaryAbsenKegiatan':
                        db.summaryAbsenKegiatan({}, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/getAbsenJambore':
                        db.getAbsenJambore(b, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/getAbsenCamp':
                        db.getAbsenCamp(b, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/getAbsenKegiatan':
                        db.getAbsenKegiatan(b, function (err2, ngo2) {
                            if (err2) {
                                res.send({msg : 'failed'});
                            } else {
                                res.send({msg : 'success', absen : ngo2});
                            }
                        });
                        break;
                    case '/getKegiatan':
                        db.getKegiatan({}, function (err2, ngo2) {
                            if (err2) {
                                var msg = {msg : "error"};
                                res.send(msg);
                            } else {
                                var keg = '';
                                for (var i in ngo2) {
                                    keg += ngo2[i].group + '-' + ngo2[i].sanggar + '-' + ngo2[i]._id + ';'
                                }
                                var msg = {msg : "success", kegiatan : keg};
                                res.send(msg);
                            }
                        });
                        break;
                    case '/sendPanic':
                        console.log('..', 'PANIC :', JSON.stringify(b,0,2));
                        db.insertPanic(b, function (err, ngo) {
                            if (err) {
                                console.log('..', 'PANIC :', JSON.stringify(err));
                                res.send({msg : 'failed'});
                            } else {
console.log(ngo)
                                scServer.exchange.publish('panic', ngo, function (err) {
                                    if (err) console.log(err);
                                });
                                res.send({msg : 'success'});
                            }
                        });
                        break;
                    case '/auth':
                        if (!b.hasOwnProperty(b.user_name) && !b.user_name) auth.fails.push("username");
                        if (!b.hasOwnProperty(b.password) && !b.password) auth.fails.push("password");
                        console.log("!!", "what the fails?", auth.fails);
                        if (!auth.fails.length) {
                            db.getPanitia({
                                user_name : b.user_name,
                                password : b.password
                            }, function (err, ngo) {
                                if (!err && ngo.length == 1) {
                                    var session = [b.user_name, now].join('$');
                                    R.sessionId = crypt.en(session);
                                    R.is = true;
                                    R.user_name = ngo[0].user_name;
                                    R.panitia_id = ngo[0]._id;
                                    R.name = ngo[0].name;
                                    res.cookie(name, R.sessionId, {maxAge : now + sessionAge, httpOnly : true});
                                } else {
                                    auth.fails.push("username", "password");
                                }
                                res.redirect('/');
                            });
                        } else {
                            res.redirect('/');
                        }
                        break;
                    case '/loginAPK':
                        db.getPanitia({
                            user_name : b.user_name,
                            password : b.password
                        }, function (err, ngo) {
                            if (!err && ngo.length == 1) {
                                var msg = {msg : 'login success'};
                                msg.panitia_id = ngo[0]._id;
                                res.send(msg);
                            } else {
                                var msg = {msg : 'login fail'};
                                //auth.fails.push("username", "password");
                                res.send(msg);
                            }
                        });
                        break;
                    case '/absenJamnas':
                        var msg;
                        db.absenJamnas(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/absenJamnasOut':
                        var msg;
                        db.absenJamnasOut(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/absenCamp':
                        var msg;
                        db.absenCamp(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/absenCampOut':
                        var msg;
                        db.absenCampOut(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/absenKegiatan':
                        var msg;
                        db.absenKegiatan(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/absenKegiatanOut':
                        var msg;
                        db.absenKegiatanOut(b, function (err, res2) {
                            if (err) {
                                msg = {msg : err};
                            } else {
                                msg = {msg : res2};
                            }
                            res.send(msg);
                        })
                        break;
                    case '/changePassword':
                        var msg = {msg : "failed"};
                        var data = {};
                        //data._id=b.panitia_id;
                        //data.password=b.password;
                        data.query = {_id : b.panitia_id, password : b.old_password}
                        data.data = {password : b.new_password}
                        db.updatePanitia(data, function (err, ngo) {
                            if (!err)
                                msg.msg = 'success';
                            res.send(msg);
                        });
                        break;
                    default:
                        res.send(R);
                        break;
                }
            } else {
                res.clearCookie(name);
                if (R.path == '/login') res.render('login', {
                    title : name,
                    fails : auth.fails
                });
                else res.redirect('/login');
            }
        }
    };
    //
    console.log('    >> Worker PID:', pid);
    //
    app.set('title', name);
    app.set('port', port);
    app.set('x-powered-by', false);
    app.set('views', path.join(dn, 'views/'));
    app.set('view engine', 'ejs');
    //app.set('env', 'production');
    //
    app.use(cookieParser());
    app.use(express.static(path.join(dn, 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(favicon(dn + '/public/image/favicon/favicon.ico'));
    app.use(cors());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(auth);
    app.use(function (req, res, next) {
        console.log("..", JSON.stringify(req.auth,0,2));
        next();
    });
    app.use('/', require(dn + 'routes/page')({
        info : app.locals,
        name : name,
        ip : ip,
        port : port,
        pid : pid,
        dn : dn
    }));
    app.use('/api', require(dn + 'routes/api')({
        info : app.locals,
        name : name,
        ip : ip,
        port : port,
        pid : pid,
        dn : dn
    }));
    //
    httpServer = worker.httpServer;
    scServer = worker.scServer;
    //
    httpServer.timeout = opts.timeOut;
    httpServer.on('request', app);
    /*
     * In here we handle our incoming realtime connections and listen for events.
     */
    scServer.on('connection', function (socket) {
        socket.on('panicEvent', function (data) {
            console.log('..', 'SOCKET : panicEvent', JSON.stringify(data,0,2));
        });
        socket.on('disconnect', function (data) {
            console.log('..', 'SOCKET : disconnect', data);
        });
    });
};

