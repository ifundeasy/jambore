var main = function () {
    var XX = {
        "\"" : "q6te6weyrb7wr74652re423",
        "\'" : "q6te6wi3rtb7wsjdf344je3"
    };
    var ajaxGet = function (url, cb) {
        $.ajax({
            url : url,
            method : "GET",
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert(url + "\nError READ\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            cb(res.data);
                        } else {
                            App.alert(url + "\nError READ\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert(url + "\nError READ\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        })
    };
    var me = this;
    var p = me.p;
    var gsanggar = {};
    var el = {
        url : p.find('#url'),
        in : p.find('#in'),
        camp : p.find('#camp'),
        branch : p.find('#branch'),
        subbranch : p.find('#subbranch'),
        code : p.find('#code'),
        sex : p.find('#sex'),
        gsanggar : p.find('#gsanggar'),
        sanggar : p.find('#sanggar'),
        peserta_id : p.find('#peserta_id'),
        panitia_id : App.auth.panitia_id,
        submit : p.find('#submit'),
        reset : p.find('#reset')
    };
    var camp = {};
    var branch = {};
    var subbranch = {};
    var code = {};
    var sanggar = {};
    var GET = function () {
        el.reset.click();
        ajaxGet("/api/schedule", function (sanggar) {
            sanggar.forEach(function (data, i) {
                var gval = data.group.replace(/\"/g, XX["\""]).replace(/\'/g, XX["\'"]);
                if (!el.gsanggar.find('option[value="' + gval + '"]').length) {
                    el.gsanggar.append('<option value="' + gval + '">' + data.group + '</option>');
                }
                gsanggar[gval] = gsanggar[gval] || {};
                gsanggar[gval][data._id] = data.sanggar;
            });
            init();
        })
    };
    var POST = function (url, data) {
        $.ajax({
            url : "/api/" + url,
            method : "POST",
            data : data,
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert(JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            App.success("Presensi tersimpan");
                            el.reset.click();
                        } else {
                            App.alert(res.message.mongo ? JSON.stringify(res.message.mongo) : "Mohon isi dengan benar")
                            el.reset.click();
                        }
                    } else {
                        App.alert(JSON.stringify(jqXHR.responseText))
                    }
                }
            }
        })
    };
    var init = function (res) {
        p.find('[txt]').tooltip({
            container : 'body',
            title : function () {
                return $(this).attr('txt')
            }
        });
        //
        $.Pages.initSelect2Plugin();
        el.url.on("change", function () {
            var s = el.sanggar.closest('.row');
            var gs = el.gsanggar.closest('.row');
            if ($(this).val() == "aKegiatan") {
                s.show();
                gs.show();
            } else {
                s.hide();
                gs.hide();
            }
        });
        el.url.select2("val", "aKegiatan");
        el.camp.closest('.row').hide();
        el.branch.closest('.row').hide();
        el.subbranch.closest('.row').hide();
        el.peserta_id.closest('.row').hide();
        el.sex.closest('.row').hide();
        el.sanggar.closest('.row').show();
        el.gsanggar.closest('.row').show();
        el.gsanggar.on("change", function () {
            var val = $(this).select2("val");
            el.sanggar.html('');
            for (var s in gsanggar[val]) el.sanggar.append('<option value="' + s + '">' + gsanggar[val][s] + '</option>')
        });
        el.gsanggar.val(el.gsanggar.find('option').first().val());
        el.gsanggar.trigger('change')
    };
    var prefix = function (val) {
        val = val || "";
        for (var x in XX) val = val.replace(new RegExp(XX[x], 'ig'), x);
        return val
    };
    //
    el.reset.on("click", function () {
        //el.camp.select2("val", "");
        //el.branch.select2("val", "");
        //el.subbranch.select2("val", "");
        //el.sanggar.select2("val", "");
        //el.peserta_id.val("");
        el.code.val("");
        el.code.focus();
    });
    el.code.keyup(function (e) {
        var code = e.which; // recommended to use e.which, it's normalized across browsers
        if (code == 13)e.preventDefault();
        if (code == 32 || code == 13 || code == 188 || code == 186) {
            el.submit.click()
        }
    });
    el.submit.on("click", function () {
        var obj, url = el.url.select2("val");
        var is = el.in.select2("val") == "true" ? true : false;
        if (url == "aKegiatan") {
            obj = {
                in : is,
                kegiatan_id : prefix(el.sanggar.select2("val")),
                panitia_id : el.panitia_id,
                code : el.code.val()
            };
        } else {
            obj = {
                in : is,
                code : el.code.val(),
                panitia_id : el.panitia_id
            };
        }
        POST(url, obj)
    });
    GET();
};
//
App.ctrl = App.ctrl || {};
$(App.current).ready(function () {
    var Fn = new Function();
    Fn.prototype.p = $(App.current);
    Fn.prototype.init = main;
    //
    App.ctrl[App.todo] = new Fn();
    App.ctrl[App.todo].init();
});