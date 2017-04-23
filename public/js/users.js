var main = function () {
    var me = this;
    var p = me.p;
    var mode, el = {
        tablecontainer : p.find('#tablecontainer'),
        search : p.find('#search'),
        info : p.find('#info'),
        id : p.find('#_id'),
        name : p.find('#name'),
        user_name : p.find('#user_name'),
        password : p.find('#password'),
        old_password : p.find('#old_password'),
        new_password : p.find('#new_password'),
        submit : p.find('#submit'),
        reset : p.find('#reset')
    };
    var GET = function () {
        $.ajax({
            url : "/api/panitia",
            method : "GET",
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error READ\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            el.reset.click();
                            initDataTable(res || {});
                        } else {
                            App.alert("Error READ\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert("Error READ\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        })
    };
    var DELETE = function (data) {
        $.ajax({
            url : "/api/panitia",
            method : "DELETE",
            data : data,
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error DELETE\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            App.success("Hapus panitia berhasil");
                            GET();
                        } else {
                            App.alert("Error DELETE\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert("Error DELETE\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        })
    };
    var PUT = function (data) {
        $.ajax({
            url : "/api/panitia",
            method : "PUT",
            data : data,
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error UPDATE\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            App.success("Perubahan panitia berhasil");
                            GET();
                        } else {
                            App.alert("Error UPDATE\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert("Error UPDATE\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        })
    };
    var POST = function (data) {
        $.ajax({
            url : "/api/panitia",
            method : "POST",
            data : data,
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error CREATE\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            App.success("Penambahan panitia berhasil");
                            GET();
                        } else {
                            App.alert("Error CREATE\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert("Error CREATE\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        })
    };
    var initDataTable = function (res) {
        var data = [];
        var settings = {
            "sDom": "<'table-responsive't><'row'<p i>>",
            "sPaginationType": "bootstrap",
            "destroy": true,
            "scrollCollapse": true,
            "oLanguage": {
                "sLengthMenu": "_MENU_ ",
                "sInfo": "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
            },
            "iDisplayLength": 10
        };
        //
        el.tablecontainer.html("");
        el.table = $('<table class="table table-striped table-condensed table-hover  no-footer" id="user_table" role="grid">');
        el.table.append(
            '<thead>' +
            '<tr role="row">' +
            '<th>Nama</th>' +
            '<th>Username</th>' +
            '<th>Aksi</th>' +
            '</tr>' +
            '</thead>'
        );
        el.tbody = el.table.append('<tbody></tbody>');
        el.tablecontainer.append(el.table)
        if (res.success) data = res.data;
        data.forEach(function(d){
            var tr = $('<tr>');
            var td = $('<td>');
            tr.append('<td txt="' + d.name + '">' + d.name + '</td>');
            tr.append('<td txt="' + d.user_name + '">' + d.user_name + '</td>');
            tr.append(td);
            td.append('<button class="btn btn-xs btn-primary --update" txt="ubah password"><i class="fa fa-edit --update"></i></button>');
            td.append('&nbsp;&nbsp;');
            td.append('<button class="btn btn-xs btn-danger --remove" txt="hapus panitia ini"><i class="fa fa-remove --remove"></i></button>');
            tr.data(d);
            el.tbody.append(tr);
        });
        p.find('[txt]').tooltip({
            container : 'body',
            title : function(){
                return $(this).attr('txt')
            }
        });
        el.tbody.find("tr").on("click", function (e){
            if (!$(e.target).hasClass("--update") && !$(e.target).hasClass("--remove")) {
                var d = $(this).closest("tr").data();
                mode = "updating";
                el.info.text('Merubah : ' + d.name);
                el.id.val(d._id);
                el.name.val(d.name);
                el.user_name.val(d.user_name);
                el.password.val('');
                el.old_password.val('');
                el.new_password.val('');
                //
                el.id.parent().hide();
                el.name.parent().show();
                el.user_name.parent().show();
                el.password.parent().hide();
                el.old_password.parent().hide();
                el.new_password.parent().hide();
            }
        });
        el.tbody.find("tr td .--update").on("click", function (){
            var d = $(this).closest("tr").data();
            mode = "password";
            el.info.text('Ubah password "' + d.name + '"');
            el.id.val(d._id);
            el.name.val('');
            el.user_name.val('');
            el.password.val('');
            el.old_password.val('');
            el.new_password.val('');
            //
            el.id.parent().hide();
            el.name.parent().hide();
            el.user_name.parent().hide();
            el.password.parent().hide();
            el.old_password.parent().show();
            el.new_password.parent().show();
        });
        el.tbody.find("tr td .--remove").on("click", function (){
            DELETE({_id: $(this).closest("tr").data("_id")})
        });
        el.table.dataTable(settings);
        el.search.keyup(function() {
            el.table.fnFilter($(this).val());
        });
    };
    //
    el.reset.on("click", function () {
        el.info.text('Buat baru');
        el.id.val('');
        el.name.val('');
        el.user_name.val('');
        el.password.val('');
        el.old_password.val('');
        el.new_password.val('');
        //
        el.id.parent().hide();
        el.name.parent().show();
        el.user_name.parent().show();
        el.password.parent().show();
        el.old_password.parent().hide();
        el.new_password.parent().hide();
    });
    el.submit.on("click", function () {
        if (el.id.val()) {
            if (mode == "password") {
                PUT({
                    _id: el.id.val(),
                    new_password: el.new_password.val(),
                    old_password: el.old_password.val(),
                    MODE : mode
                })
            } else if (mode == "updating") {
                PUT({
                    _id: el.id.val(),
                    name: el.name.val(),
                    user_name: el.user_name.val(),
                    MODE : mode
                })
            }
        } else {
            POST({
                name : el.name.val(),
                user_name : el.user_name.val(),
                password : el.password.val()
            })
        }
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