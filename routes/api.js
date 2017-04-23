var express = require('express');
var router = express.Router();
var columnsMap = {
    jambore : {
        sum : {
            date : "date,date1",
            branch : "branch",
            sub_branch : "sub_branch",
            count : "total_check_in",
            cnt_out : "total_check_out"
        },
        detail : {
            peserta_name : "peserta",
            sex : "sex",
            branch : "branch",
            subbranch : "sub_branch",
            camp : "camp",
            date : "check_in,date2",
            date_out : "check_out,date2",
            panitia_name : "panitia"
        }
    },
    camp : {
        sum : {
            date : "date,date1",
            camp : "camp",
            count : "total_check_in",
            cnt_out : "total_check_out"
        },
        detail : {
            peserta_name : "peserta",
            sex : "sex",
            branch : "branch",
            subbranch : "sub_branch",
            camp : "camp",
            date : "check_in,date2",
            date_out : "check_out,date2",
            panitia_name : "panitia"
        }
    },
    kegiatan : {
        sum : {
            date : "date,date1",
            group : "group",
            sanggar : "sanggar",
            count : "total_check_in",
            cnt_out : "total_check_out"
        },
        detail : {
            peserta_name : "peserta",
            sex : "sex",
            branch : "branch",
            subbranch : "sub_branch",
            camp : "camp",
            kegiatan_name : "kegiatan",
            date : "check_in,date2",
            date_out : "check_out,date2",
            panitia_name : "panitia"
        }
    }
};
var dateFormat = function (date) {
    var values = {};
    var keys = ["y", "m", "d", "h", "i", "s"];
    var d = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ].map(function (e, i) {
        var x = e.toString();
        if (x.length == 1) {
            x = "0" + x;
        }
        values[keys[i]] = x;
        return x;
    });
    return {
        date : function () {
            return date;
        },
        val : function () {
            return values;
        },
        parse : function (format) {
            var x = "";
            for (var i in format) x += values[format[i]] || format[i];
            return x
        }
    }
};
//
module.exports = function (args) {
    var info = args.info;
    var dn = args.dn;
    var Db = require(dn + '/libs/db');
    var db = new Db();
    var FILE = function (data, format) {
        var txt = "";
        var columns = Object.keys(format).map(function (e) {
            return JSON.stringify(format[e].split(',')[0])
        });
	var counter=1;
        for (var i in data) {
            var row = JSON.parse(JSON.stringify(data[i]));
            if (i == 0) txt += 'No,'+columns.join() + "\n";
            txt += counter+','+Object.keys(format).map(function (j, k) {
                    var val = (row[j] || "").toString().replace(/\t|\t+/g, "").replace(/\"/g, "'");
                    var is = format[j].split(',')[1];
                    if (!val.replace(/\s|\s+/g, "")) val = "";
                    if (val) {
                        if (is == "date1") {
                            val = dateFormat(new Date(val)).parse("y-m-d")
                        } else if (is == "date2") {
                            val = dateFormat(new Date(val)).parse("y-m-d h:i:s")
                        }
                    }
                    return JSON.stringify(val)
                }).join() + "\n";
		counter++;
        }
        return txt
    };
    router.all('/', function (req, res, next) {
        res.send({
            message : "hello world!"
        });
    });
    router.all('/maps', function (req, res, next) {
        //todo : READ
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        db.getMaps({}, function (e, ngo) {
            if (e) R.message["mongo"] = e;
            else {
                R.success = true;
                R.data = {
                    fields : [
                        "date", "panitia_name", "branch", "subbranch",
                        "camp", "peserta_name", "code", "sex", "lat", "long"
                    ],
                    rows : ngo.map(function (d) {
                        var panitia = d.panitia_id || {};
                        var peserta = d.peserta_id || {};
                        return [
                            d.date, panitia.name, d.branch, d.subbranch,
                            d.camp, peserta.name, d.code, d.sex, d.lat, d.long
                        ]
                    })
                };
            }
            res.send(R);
        });
    });
    router.get('/event', function (req, res, next) {
        //todo : READ
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        db.getPanic({}, function (err, ngo) {
            if (err) R.message["mongo"] = err;
            else {
                R.success = true;
                R.data = ngo;
            }
            res.send(R);
        })
    });
    router.all('/aJambore', function (req, res, next) {
        //todo : CREATE & READ
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        if (req.method == "GET") {
            var qstring = req.query;
            var mode = qstring.q;
            var isDL = qstring.hasOwnProperty("download");
            var isF = qstring.hasOwnProperty("filter");
            if (["sum", "detail"].indexOf(mode) > -1) {
                if (mode == "sum") {
                    db.summaryAbsenJambore({}, function (e, ngo) {
                        if (e) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo.map(function (el) {
                                var r = el._id;
                                var o = {
                                    date : r.date,
                                    branch : r.branch,
                                    sub_branch : r.subbranch,
                                    //camp : r.camp,
                                    count : el.count,
                                    cnt_out : el.cnt_out
                                };
                                return o;
                            })
                        }
                        if (isDL && R.success && R.data.length) {
                            res.set({
                                "Content-Disposition" : "attachment; filename=presensi-jambore-m-" + new Date().getTime() + ".csv",
                                'Content-type' : 'text/csv'
                            }).send(FILE(R.data, columnsMap.jambore.sum)).end();
                        } else {
                            res.send(R)
                        }
                    });
                } else {
                    var s = (function () {
                        var d = {};
                        if (isF) {
                            var tc, b = qstring.filter;
                            try {
                                tc = JSON.parse(b);
                                d = {
                                    date : tc.date,
                                    branch : tc.branch,
                                    subbranch : tc.subbranch//,
                                    //camp : tc.camp
                                };
                                for (var i in d) {
                                    if (!d[i]) R.message[i] = "invalid";
                                    else if (d[i].constructor !== String) R.message[i] = "please post a string";
                                }
                            } catch (e) {
                                R.message["filter"] = "invalid JSON"
                            }
                        }
                        return d;
                    })();
                    if (Object.keys(R.message).length) {
                        res.send(R)
                    } else {
                        var now = new Date();
                        var gte = new Date(s.date);
                        gte.setHours(0);
                        if ((gte.getTime() > 0) && (now.getTime() > gte.getTime())) {
                            var lt = new Date(gte);
                            lt.setDate(lt.getDate() + 1);
                            s.date = {
                                "$gte" : gte,
                                "$lte" : lt
                            };
                            db.getAbsenJambore(s, function (e, ngo) {
                                if (e) {
                                    R.message["mongo"] = err;
                                } else {
                                    R.success = true;
                                    R.data = ngo.map(function (d) {
                                        var panitia = d.panitia_id || {};
                                        var peserta = d.peserta_id || {};
                                        return {
                                            "_id" : d._id,
                                            "date" : d.date,
                                            "date_out" : d.date_out || "  ",
                                            "peserta_id" : peserta._id || "  ",
                                            "peserta_name" : peserta.name || "  ",
                                            "camp" : d.camp,
                                            "subbranch" : d.subbranch,
                                            "branch" : d.branch,
                                            "code" : d.code,
                                            "sex" : d.sex,
                                            "lat" : d.lat,
                                            "long" : d.long,
                                            "panitia_id" : panitia._id || "  ",
                                            "panitia_name" : panitia.name || "  "
                                        };
                                    });
                                }
                                if (isDL && R.success && R.data.length) {
                                    res.set({
                                        "Content-Disposition" : "attachment; filename=presensi-jambore-d-" + new Date().getTime() + ".csv",
                                        'Content-type' : 'text/csv'
                                    }).send(FILE(R.data, columnsMap.jambore.detail)).end();
                                } else {
                                    res.send(R)
                                }
                            });
                        } else {
                            R.message["date"] = "invalid date!";
                            res.send(R)
                        }
                    }
                }
            } else {
                R.message["q"] = "invalid";
                res.send(R)
            }
        } else if (req.method == "POST") {
            var b = req.body;
            var d = {
                panitia_id : b.panitia_id,
                code : b.code
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                if (b.in == true || b.in == "true") {
                    db.absenJamnas(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else if (b.in == false || b.in == "false") {
                    db.absenJamnasOut(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else {
                    R.message["in"] = "invalid";
                    res.send(R)
                }
            }
        } else {
            next()
        }
    });
    router.all('/aCamp', function (req, res, next) {
        //todo : CREATE & READ
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        if (req.method == "GET") {
            var qstring = req.query;
            var mode = qstring.q;
            var isDL = qstring.hasOwnProperty("download");
            var isF = qstring.hasOwnProperty("filter");
            if (["sum", "detail"].indexOf(mode) > -1) {
                if (mode == "sum") {
                    db.summaryAbsenCamp({}, function (e, ngo) {
                        if (e) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo.map(function (el) {
                                var r = el._id;
                                var o = {
                                    date : r.date,
                                    //branch : r.branch,
                                    //sub_branch : r.sub,
                                    camp : r.camp,
                                    count : el.count,
                                    cnt_out : el.cnt_out
                                };
                                return o;
                            })
                        }
                        if (isDL && R.success && R.data.length) {
                            res.set({
                                "Content-Disposition" : "attachment; filename=presensi-camp-m-" + new Date().getTime() + ".csv",
                                'Content-type' : 'text/csv'
                            }).send(FILE(R.data, columnsMap.camp.sum)).end();
                        } else {
                            res.send(R)
                        }
                    });
                } else {
                    var s = (function () {
                        var d = {};
                        if (isF) {
                            var tc, b = qstring.filter;
                            try {
                                tc = JSON.parse(b);
                                d = {
                                    date : tc.date,
                                    //branch : tc.branch,
                                    //subbranch : tc.subbranch,
                                    camp : tc.camp
                                };
                                for (var i in d) {
                                    if (!d[i]) R.message[i] = "invalid";
                                    else if (d[i].constructor !== String) R.message[i] = "please post a string";
                                }
                            } catch (e) {
                                R.message["filter"] = "invalid JSON"
                            }
                        }
                        return d;
                    })();
                    if (Object.keys(R.message).length) {
                        res.send(R)
                    } else {
                        var now = new Date();
                        var gte = new Date(s.date);
                        gte.setHours(0);
                        if ((gte.getTime() > 0) && (now.getTime() > gte.getTime())) {
                            var lt = new Date(gte);
                            lt.setDate(lt.getDate() + 1);
                            s.date = {
                                "$gte" : gte,
                                "$lte" : lt
                            };
                            db.getAbsenCamp(s, function (e, ngo) {
                                if (e) {
                                    R.message["mongo"] = err;
                                } else {
                                    R.success = true;
                                    R.data = ngo.map(function (d) {
                                        var panitia = d.panitia_id || {};
                                        var peserta = d.peserta_id || {};
                                        return {
                                            "_id" : d._id,
                                            "date" : d.date,
                                            "date_out" : d.date_out || "  ",
                                            "peserta_id" : peserta._id || "  ",
                                            "peserta_name" : peserta.name || "  ",
                                            "camp" : d.camp,
                                            "subbranch" : d.subbranch,
                                            "branch" : d.branch,
                                            "code" : d.code,
                                            "sex" : d.sex,
                                            "lat" : d.lat,
                                            "long" : d.long,
                                            "panitia_id" : panitia._id || "  ",
                                            "panitia_name" : panitia.name || "  "
                                        };
                                    });
                                }
                                if (isDL && R.success && R.data.length) {
                                    res.set({
                                        "Content-Disposition" : "attachment; filename=presensi-camp-d-" + new Date().getTime() + ".csv",
                                        'Content-type' : 'text/csv'
                                    }).send(FILE(R.data, columnsMap.camp.detail)).end();
                                } else {
                                    res.send(R)
                                }
                            });
                        } else {
                            R.message["date"] = "invalid date!";
                            res.send(R)
                        }
                    }
                }
            } else {
                R.message["q"] = "invalid";
                res.send(R)
            }
        } else if (req.method == "POST") {
            var b = req.body;
            var d = {
                panitia_id : b.panitia_id,
                code : b.code
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                if (b.in == true || b.in == "true") {
                    db.absenCamp(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else if (b.in == false || b.in == "false") {
                    db.absenCampOut(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else {
                    R.message["in"] = "invalid";
                    res.send(R)
                }
            }
        } else {
            next()
        }
    });
    router.all('/aKegiatan', function (req, res, next) {
        //todo : CREATE & READ
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        if (req.method == "GET") {
            var qstring = req.query;
            var mode = qstring.q;
            var isDL = qstring.hasOwnProperty("download");
            var isF = qstring.hasOwnProperty("filter");
            if (["sum", "detail"].indexOf(mode) > -1) {
                if (mode == "sum") {
                    db.summaryAbsenKegiatan({}, function (e, ngo) {
                        if (e) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo.map(function (el) {
                                var r = el._id;
                                var kegiatan_id = el.kegiatan_id || {};
                                var o = {
                                    date : r.date,
                                    //branch : r.branch,
                                    //sub_branch : r.sub,
                                    //camp : r.camp,
                                    kegiatan_id : kegiatan_id._id || " ",
                                    group : kegiatan_id.group || " ",
                                    sanggar : kegiatan_id.sanggar || " ",
                                    count : el.count,
                                    cnt_out : el.cnt_out
                                };
                                return o;
                            })
                        }
                        if (isDL && R.success && R.data.length) {
                            res.set({
                                "Content-Disposition" : "attachment; filename=presensi-kegiatan-m-" + new Date().getTime() + ".csv",
                                'Content-type' : 'text/csv'
                            }).send(FILE(R.data, columnsMap.kegiatan.sum)).end();
                        } else {
                            res.send(R)
                        }
                    });
                } else {
                    var s = (function () {
                        var d = {};
                        if (isF) {
                            var tc, b = qstring.filter;
                            try {
                                tc = JSON.parse(b);
                                d = {
                                    date : tc.date,
                                    //branch : tc.branch,
                                    //subbranch : tc.subbranch,
                                    //camp : tc.camp,
                                    kegiatan_id : tc.kegiatan_id
                                };
                                for (var i in d) {
                                    if (!d[i]) R.message[i] = "invalid";
                                    else if (d[i].constructor !== String) R.message[i] = "please post a string";
                                }
                            } catch (e) {
                                R.message["filter"] = "invalid JSON"
                            }
                        }
                        return d;
                    })();
                    if (Object.keys(R.message).length) {
                        res.send(R)
                    } else {
                        var now = new Date();
                        var gte = new Date(s.date);
                        gte.setHours(0);
                        if ((gte.getTime() > 0) && (now.getTime() > gte.getTime())) {
                            var lt = new Date(gte);
                            lt.setDate(lt.getDate() + 1);
                            s.date = {
                                "$gte" : gte,
                                "$lte" : lt
                            };
                            db.getAbsenKegiatan(s, function (e, ngo) {
                                if (e) {
                                    R.message["mongo"] = err;
                                } else {
                                    R.success = true;
                                    R.data = ngo.map(function (d) {
                                        var kegiatan = d.kegiatan_id || {};
                                        var panitia = d.panitia_id || {};
                                        var peserta = d.peserta_id || {};
                                        return {
                                            "_id" : d._id,
                                            "date" : d.date,
                                            "date_out" : d.date_out || "  ",
                                            "peserta_id" : peserta._id || "  ",
                                            "peserta_name" : peserta.name || "  ",
                                            "camp" : d.camp,
                                            "subbranch" : d.subbranch,
                                            "branch" : d.branch,
                                            "code" : d.code,
                                            "sex" : d.sex,
                                            "kegiatan_id" : kegiatan._id || "  ",
                                            "kegiatan_name" : kegiatan.sanggar || "  ",
                                            "lat" : d.lat,
                                            "long" : d.long,
                                            "panitia_id" : panitia._id || "  ",
                                            "panitia_name" : panitia.name || "  "
                                        };
                                    });
                                }
                                if (isDL && R.success && R.data.length) {
                                    res.set({
                                        "Content-Disposition" : "attachment; filename=presensi-kegiatan-d-" + new Date().getTime() + ".csv",
                                        'Content-type' : 'text/csv'
                                    }).send(FILE(R.data, columnsMap.kegiatan.detail)).end();
                                } else {
                                    res.send(R)
                                }
                            });
                        } else {
                            R.message["date"] = "invalid date!";
                            res.send(R)
                        }
                    }
                }
            } else {
                R.message["q"] = "invalid";
                res.send(R)
            }
        } else if (req.method == "POST") {
            var b = req.body;
            var d = {
                panitia_id : b.panitia_id,
                kegiatan : b.kegiatan_id,
                code : b.code
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                if (b.in == true || b.in == "true") {
                    db.absenKegiatan(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else if (b.in == false || b.in == "false") {
                    db.absenKegiatanOut(d, function (err, ngo) {
                        if (err) {
                            R.message["mongo"] = err;
                        } else {
                            R.success = true;
                            R.data = ngo;
                        }
                        res.send(R);
                    })
                } else {
                    R.message["in"] = "invalid";
                    res.send(R)
                }
            }
        } else {
            next()
        }
    });
    router.all('/schedule', function (req, res, next) {
        //todo : CREATE, READ, UPDATE, DELETE
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        if (req.method == "GET") {
            db.getKegiatan({}, function (err, ngo) {
                if (err) R.message["mongo"] = err;
                else {
                    R.success = true;
                    R.data = [];
                    ngo.forEach(function (data) {
                        R.data.push({
                            _id : data._id,
                            group : data.group,
                            sanggar : data.sanggar
                        })
                    });
                }
                res.send(R);
            })
        } else if (req.method == "POST") {
            var b = req.body;
            var d = {
                group : b.group,
                sanggar : b.sanggar
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.insertKegiatan(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else if (req.method == "PUT") {
            var b = req.body;
            var d = {
                _id : b._id,
                group : b.group,
                sanggar : b.sanggar
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.updateKegiatan(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else if (req.method == "DELETE") {
            var b = req.body;
            var d = {_id : b._id};
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.deleteKegiatan(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else {
            next()
        }
    });
    router.all('/panitia', function (req, res, next) {
        //todo : CREATE, READ, UPDATE, DELETE
        var R = {
            success : false,
            message : {},
            data : undefined
        };
        if (req.method == "GET") {
            db.getPanitia({}, function (err, ngo) {
                if (err) R.message["mongo"] = err;
                else {
                    R.success = true;
                    R.data = [];
                    ngo.forEach(function (data) {
                        R.data.push({
                            _id : data._id,
                            name : data.name,
                            user_name : data.user_name
                        })
                    });
                }
                res.send(R);
            })
        } else if (req.method == "POST") {
            var b = req.body;
            var d = {
                name : b.name,
                user_name : b.user_name,
                password : b.password
            };
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.insertPanitia(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else if (req.method == "PUT") {
            var b = req.body, d = {};
            if (b.MODE == "password") {
                d = {
                    query : {
                        _id : b._id,
                        password : b.old_password
                    },
                    data : {password : b.new_password}
                };
                if (!d.query._id) R.message["_id"] = "invalid";
                else if (d.query._id.constructor !== String) R.message["_id"] = "please post a string";
                if (!d.query.password) R.message["old_password"] = "invalid";
                else if (d.query.password.constructor !== String) R.message["old_password"] = "please post a string";
                if (!d.data.password) R.message["new_password"] = "invalid";
                else if (d.data.password.constructor !== String) R.message["new_password"] = "please post a string";
            } else if (b.MODE == "updating") {
                d = {
                    query : {_id : b._id},
                    data : {
                        name : b.name,
                        user_name : b.user_name
                    }
                };
                if (!d.query._id) R.message["_id"] = "invalid";
                else if (d.query._id.constructor !== String) R.message["_id"] = "please post a string";
                if (!d.data.name) R.message["name"] = "invalid";
                else if (d.data.name.constructor !== String) R.message["name"] = "please post a string";
                if (!d.data.user_name) R.message["user_name"] = "invalid";
                else if (d.data.user_name.constructor !== String) R.message["user_name"] = "please post a string";
            } else {
                R.message["MODE"] = "choose 'updating' OR 'password'";
            }
            //
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.updatePanitia(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else if (req.method == "DELETE") {
            var b = req.body;
            var d = {_id : b._id};
            for (var i in d) {
                if (!d[i]) R.message[i] = "invalid";
                else if (d[i].constructor !== String) R.message[i] = "please post a string";
            }
            if (Object.keys(R.message).length) {
                res.send(R)
            } else {
                db.deletePanitia(d, function (err, ngo) {
                    if (err) R.message["mongo"] = err;
                    else {
                        R.success = true;
                        R.data = ngo;
                    }
                    res.send(R);
                })
            }
        } else {
            next()
        }
    });
    return router;
};
