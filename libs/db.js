var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var uri = 'mongodb://localhost:27017/jamnas2016';
mongoose.connect(uri);
var scout_branch = mongoose.model('scout_branch', {name : String});
var scout_group = mongoose.model('scout_group', {name : String});
var scout = mongoose.model('scout', {
    name : String,
    branch : {type : mongoose.Schema.Types.ObjectId, ref : 'scout_branch'},
    subbranch : {type : mongoose.Schema.Types.ObjectId, ref : 'scout_branch'}
});
var absenJambore = mongoose.model('absenJambore', {
    panitia_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'panitia'
    },
    peserta_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'scout'
    },
    branch : String,
    subbranch : String,
    camp : String,
    code : String,
    sex : String,
    date : {type : Date},
    date_out : {type : Date},
    date_string : String,
    cnt_out : Number,
    in : {type : Boolean, default : false},
    long : String,
    lat : String
});
var absenCamp = mongoose.model('absenCamp', {
    panitia_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'panitia'
    },
    peserta_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'scout'
    },
    branch : String,
    subbranch : String,
    camp : String,
    code : String,
    sex : String,
    date : {type : Date},
    date_out : {type : Date},
    date_string : String,
    cnt_out : Number,
    in : {type : Boolean, default : false},
    long : String,
    lat : String
});
var absenKegiatan = mongoose.model('absenKegiatan', {
    panitia_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'panitia'
    },
    peserta_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'scout'
    },
    kegiatan_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'kegiatan'
    },
    branch : String,
    subbranch : String,
    camp : String,
    code : String,
    sex : String,
    date : {type : Date},
    date_out : {type : Date},
    date_string : String,
    cnt_out : Number,
    in : {type : Boolean, default : false},
    long : String,
    lat : String
});
var panitia = mongoose.model('panitia', {name : String, user_name : String, password : String});
var kegiatan = mongoose.model('kegiatan', {date : String, group : String, sanggar : String});
var panic = mongoose.model('panic', {
    panitia_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'panitia'
    },
    date : {type : Date},
    type : String,
    message : String,
    long : String,
    lat : String
});
var db = function () {
}
var tzOffset = 1;
db.prototype.summaryAbsenJambore = function (body, cb) {
    absenJambore.aggregate([{
        $group : {
            _id : {branch : "$branch", subbranch : "$subbranch", date : "$date_string"},
            count : {$sum : 1},
            cnt_out : {$sum : "$cnt_out"}
        }
    }], function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.summaryAbsenCamp = function (body, cb) {
    absenCamp.aggregate([{$group : {_id : {camp : "$camp", date : "$date_string"}, count : {$sum : 1}, cnt_out : {$sum : "$cnt_out"}}}], function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.summaryAbsenKegiatan = function (body, cb) {
    absenKegiatan.aggregate([{
        $group : {
            _id : {kegiatan_id : "$kegiatan_id", date : "$date_string"},
            kegiatan_id : {$first : "$kegiatan_id"},
            count : {$sum : 1},
            cnt_out : {$sum : "$cnt_out"}
        }
    }], function (err, res) {
        if (err) {
            cb(err)
        } else {
            //cb(null,res)
            absenKegiatan.populate(res, {"path" : "kegiatan_id"}, function (err, res2) {
                if (err)
                    cb(err)
                else
                    cb(null, JSON.parse(JSON.stringify(res2)))
            })
        }
    });
}
db.prototype.insertPanitia = function (body, cb) {
    var data = new panitia(body)
    data.save(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.getPanitia = function (body, cb) {
    panitia.find(body, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.updatePanitia = function (body, cb) {
    //var data=new panitia(body)
    //var query=body.query
    panitia.update(body.query, body.data, {}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            if (res.nModified != 0)
                cb(null, res)
            else
                cb('gagal')
        }
    });
}
db.prototype.deletePanitia = function (body, cb) {
    var data = new panitia(body)
    var query = {_id : body._id}
    panitia.remove(body, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.insertPanic = function (body, cb) {
    body.date = new Date();
    var data = new panic(body)
    console.log(body)
    panitia.find({_id : body.panitia_id}, function (err, res2) {
        if (!err && res2.length > 0) {
            var res2 = JSON.parse(JSON.stringify(res2[0]))
            data.save(function (err, res) {
                if (err) {
                    cb(err)
                } else {
                    var res = JSON.parse(JSON.stringify(res))
                    res.panitia_id = res2.name
                    cb(null, res)
                }
            });
        } else {
            cb('panita tidak terdaftar')
        }
    })
}
db.prototype.getPanic = function (body, cb) {
    panic.find(body).populate('panitia_id').sort({date : 'desc'}).exec(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.insertKegiatan = function (body, cb) {
    var data = new kegiatan(body)
    data.save(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.getKegiatan = function (body, cb) {
    kegiatan.find(body, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.getMaps = function (body, cb) {
    var d = new Date((new Date) * 1 - 1000 * 3600 * 2);
    absenKegiatan.find({lat : {$ne : null}, date : {"$gte" : d}}).populate('peserta_id').populate('panitia_id').exec(function (err, res) {
        // absenKegiatan.find({lat:{$ne:null}}).populate('peserta_id').populate('panitia_id').exec(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.updateKegiatan = function (body, cb) {
    //var data=new kegiatan(body)
    var query = {_id : body._id}
    kegiatan.update(query, body, {}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.deleteKegiatan = function (body, cb) {
    var data = new kegiatan(body)
    var query = body
    kegiatan.remove(query, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.insertAbsenJambore = function (body, cb) {
    //var data=new absenJambore(body)
    body.in = false;
    var date = new Date();
    body.date = date;
    body.date_string = date.getFullYear() + '-' + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1) ) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
    var query = {peserta_id : body.peserta_id}
    absenJambore.update(query, body, {upsert : true}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.insertCheckoutJambore = function (body, cb) {
    var data = {}
    data.in = true;
    data.cnt_out = 1;
    data.date_out = new Date();
    //var data=new absenJambore(body)
    var query = {peserta_id : body.peserta_id}
    absenJambore.update(query, data, {upsert : true}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.getAbsenJambore = function (body, cb) {
    absenJambore.find(body).populate('peserta_id').populate('panitia_id').exec(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.absenJamnas = function (b, cb) {
    var me = this;
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        me.getAbsenJambore({peserta_id : b.qr}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.code = res.code;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenJambore(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                } else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        })
    } else {
        me.getAbsenJambore({code : b.code}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.peserta_id = res._id;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenJambore(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                } else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        })
    }
}
db.prototype.absenJamnasOut = function (b, cb) {
    var me = this
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        me.getAbsenJambore({peserta_id : b.qr}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res))
                            me.insertCheckoutJambore(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    } else {
        me.getAbsenJambore({code : b.code}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res))
                            b.peserta_id = res._id;
                            me.insertCheckoutJambore(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    }
}
db.prototype.insertAbsenCamp = function (body, cb) {
    body.in = false;
    var query = {peserta_id : body.peserta_id}
    var date = new Date();
    body.date = date;
    body.date_string = date.getFullYear() + '-' + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1) ) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
    absenCamp.update(query, body, {upsert : true}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.insertCheckoutCamp = function (body, cb) {
    var data = {}
    data.in = true;
    data.cnt_out = 1;
    data.date_out = new Date();
    var query = {peserta_id : body.peserta_id}
    absenCamp.update(query, data, {}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.getAbsenCamp = function (body, cb) {
    absenCamp.find(body).populate('peserta_id').populate('panitia_id').exec(function (err, res) {
        if (err) {
            cb(err)
        } else {
            cb(null, res)
        }
    });
}
db.prototype.absenCamp = function (b, cb) {
    var me = this;
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        me.getAbsenCamp({peserta_id : b.qr}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.code = res.code;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenCamp(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                } else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        })
    } else {
        me.getAbsenCamp({code : b.code}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.peserta_id = res._id;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenCamp(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                } else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        })
    }
}
db.prototype.absenCampOut = function (b, cb) {
    var me = this
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        me.getAbsenCamp({peserta_id : b.qr}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res))
                            me.insertCheckoutCamp(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    } else {
        me.getAbsenCamp({code : b.code}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res))
                            b.peserta_id = res._id;
                            me.insertCheckoutCamp(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    }
}
db.prototype.absenKegiatan = function (b, cb) {
    var me = this
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        b.kegiatan_id = b.kegiatan;
        me.getAbsenKegiatan({peserta_id : b.qr, kegiatan_id : b.kegiatan}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.code = res.code;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenKegiatan(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        });
    } else {
        b.kegiatan_id = b.kegiatan;
        me.getAbsenKegiatan({code : b.code, kegiatan_id : b.kegiatan}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length == 0) {
                    scout.find({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err || res.length == 0) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res[0]))
                            b.participant_role = res.participant_role;
                            b.sex = res.sex;
                            b.peserta_id = res._id;
                            b.type = res.type;
                            b.branch = res.branch.name;
                            b.subbranch = res.subbranch.name;
                            if (b.sex = 'female')
                                b.camp = res.subbranch.camp_name.split('&')[1].trim()
                            else
                                b.camp = res.subbranch.camp_name.split('&')[0].trim()
                            me.insertAbsenKegiatan(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "absen peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                } else {
                    cb("peserta sudah melakukan absensi sebelumnya");
                }
            }
        })
    }
}
db.prototype.absenKegiatanOut = function (b, cb) {
    var me = this
    if (b.qr != undefined) {
        b.peserta_id = b.qr;
        b.kegiatan_id = b.kegiatan;
        me.getAbsenKegiatan({peserta_id : b.qr, kegiatan_id : b.kegiatan}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({_id : b.peserta_id}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            res = JSON.parse(JSON.stringify(res))
                            me.insertCheckoutKegiatan(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    } else {
        b.kegiatan_id = b.kegiatan;
        me.getAbsenKegiatan({code : b.code, kegiatan_id : b.kegiatan}, function (err, ngo2) {
            if (err) {
                cb("absen gagal");
            } else {
                if (ngo2.length > 0 && ngo2[0].in == false) {
                    scout.findOne({code : b.code}).populate('subbranch').populate('branch').exec(function (err, res) {
                        if (err) {
                            cb("absen gagal peserta tidak terdaftar");
                        } else {
                            /*kegiatan.findOne({_id:b.kegiatan}function(err,keg){
                                if(err){
                                    cb("absen gagal kegiatan tidak terdaftar");
                                }else{*/
                            res = JSON.parse(JSON.stringify(res))
                            b.peserta_id = res._id;
                            me.insertCheckoutKegiatan(b, function (err, ngo) {
                                if (err) {
                                    cb("absen gagal");
                                } else {
                                    cb(null, "checkout peserta " + res.name + " berhasil");
                                }
                            });
                            /*}
                        })*/
                        }
                    });
                }
                else {
                    cb("checkout gagal,peserta belum melakukan absensi sebelumnya atau sudah checkout");
                }
            }
        });
    }
}
db.prototype.insertAbsenKegiatan = function (body, cb) {
    body.in = false;
    var date = new Date();
    body.date = date;
    body.date_string = date.getFullYear() + '-' + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1) ) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
    var query = {peserta_id : body.peserta_id, kegiatan_id : body.kegiatan_id}
    absenKegiatan.update(query, body, {upsert : true}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            absenKegiatan.find({})
            .populate('panitia_id')
            .exec(function (error, posts) {
                cb(null, posts)
            })
            //cb(null,res)
        }
    });
}
db.prototype.insertCheckoutKegiatan = function (body, cb) {
    var data = {}
    data.in = true;
    data.cnt_out = 1;
    data.date_out = new Date();
    var query = {peserta_id : body.peserta_id, kegiatan_id : body.kegiatan_id}
    absenKegiatan.update(query, data, {}, function (err, res) {
        if (err) {
            cb(err)
        } else {
            absenKegiatan.find({})
            .populate('panitia_id')
            .exec(function (error, posts) {
                cb(null, posts)
            })
            //cb(null,res)
        }
    });
}
db.prototype.getAbsenKegiatan = function (body, cb) {
    absenKegiatan.find(body).populate('peserta_id').populate('panitia_id').populate('kegiatan_id').exec(function (err, posts) {
        if (err) {
            cb(err)
        } else
            cb(null, posts)
    });
}
module.exports = db;

