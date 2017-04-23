var main = function () {
    var me = this;
    var p = me.p;
    var el = {
        tablecontainer : p.find('#tablecontainer'),
        table : p.find('#table'),
        search : p.find('#search'),
        info : p.find('#info'),
        id : p.find('#_id'),
        addgroup : p.find('#addgroup'),
        group : p.find('#group'),
        sanggar : p.find('#sanggar'),
        submit : p.find('#submit'),
        reset : p.find('#reset')
    };
    var settings = {
        "sDom" : "<'table-responsive't><'row'<p i>>",
        "sPaginationType" : "bootstrap",
        "destroy" : true,
        "scrollCollapse" : true,
        "oLanguage" : {
            "sLengthMenu" : "_MENU_ ",
            "sInfo" : "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
        },
        "iDisplayLength" : 10
    };
    var group = {};
    var GET = function () {
        $.ajax({
            url : "/api/schedule",
            method : "GET",
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error READ\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            initDataTable(res || {});
                            el.reset.click();
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
            url : "/api/schedule",
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
                            App.success("Hapus jadwal kegiatan berhasil");
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
            url : "/api/schedule",
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
                            App.success("Perubahan jadwal kegiatan berhasil");
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
            url : "/api/schedule",
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
                            App.success("Penambahan jadwal kegiatan berhasil");
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
    var modal = function () {
        var html = [
            '<div class="modal fade slide-up disable-scroll" id="modal" tabindex="-1" role="dialog" aria-hidden="false">',
            '<div class="modal-dialog modal-sm">',
            '<div class="modal-content-wrapper">',
            '<div class="modal-content">',
            '<div class="modal-body text-center m-t-20">',
            '<h4 class="no-margin p-b-10">Tambah jenis kegiatan baru</h4>',
            '<div class="form-group form-group-default required">',
            '<label>Nama</label>',
            '<input type="text" class="form-control" required="">',
            '</div>',
            '</div>',
            '<div class="modal-footer">',
            '<button type="button" class="btn btn-primary btn-cons pull-left inline confirm" data-dismiss="modal">Ok</button>',
            '<button type="button" class="btn btn-default btn-cons no-margin pull-left inline" data-dismiss="modal">Tutup</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ];
        if (!p.find('#modal').length) p.append(html.join(''));
        p.find('#modal').modal('show');
        p.find('#modal .confirm').off('click');
        p.find('#modal .confirm').on('click', function (ev) {
            var val = p.find('#modal input').val();
            if (!val) {
                var z = setTimeout(function(){
                    el.addgroup.click();
                    clearTimeout(z)
                }, 500)
            } else {
                p.find('#modal input').val("");
                if (!group.hasOwnProperty(val)) {
                    group[val] = 1;
                    el.group.append('<option value="' + val + '">' + val + '</option>');
                }
                el.group.select2('val', val)
            }
        });
    };
    var initDataTable = function (res) {
        el.tablecontainer.html("");
        el.table = $('<table class="table table-striped table-condensed table-hover  no-footer" id="table" role="grid">');
        el.tbody = $('<tbody></tbody>');
        el.table.append(
            '<thead>' +
            '<tr role="row">' +
            '<th>Jenis Kegiatan</th>' +
            '<th>Sanggar</th>' +
            '<th>Aksi</th>' +
            '</tr>' +
            '</thead>'
        );
        el.table.append(el.tbody);
        el.tablecontainer.append(el.table);
        //
        res.data.forEach(function (data) {
            if (!group.hasOwnProperty(data.group)) {
                group[data.group] = 1;
                el.group.append('<option value="' + data.group + '">' + data.group + '</option>')
            }
            //
            var tr = $('<tr>');
            var td = $('<td>');
            tr.data(data);
            tr.append('<td txt="' + data.group + '">' + data.group + '</td>');
            tr.append('<td txt="' + data.sanggar + '">' + data.sanggar + '</td>');
            tr.append(td);
            td.append('<button txt="hapus data ini" class="btn btn-xs btn-danger -remove" type="button"><i class="fa fa-remove"></i></button>')
            el.tbody.append(tr)
        });
        //
        el.tbody.find('tr').on('click', function (ev) {
            console.log("lol");
            var data = $(this).data();
            if (["I", "BUTTON"].indexOf(ev.target.tagName) == -1) {
                el.info.text("Mengubah : " + data.sanggar);
                el.id.val(data._id);
                el.group.select2("val", data.group);
                el.sanggar.val(data.sanggar);
            }
        });
        el.tbody.find('tr td button.-remove').on('click', function (ev) {
            var data = $(this).closest('tr').data();
            DELETE(data);
        });
        p.find('[txt]').tooltip({
            container : 'body',
            title : function () {
                return $(this).attr('txt')
            }
        });
        //
        $.Pages.initSelect2Plugin();
        el.table.dataTable(settings);
        p.find('#search').keyup(function () {
            el.table.fnFilter($(this).val());
        });
    };
    //
    el.addgroup.on("click", modal);
    el.reset.on("click", function () {
        el.search.val('');
        el.info.text('Buat baru');
        el.id.val('');
        el.sanggar.val('');
        el.group.select2('val', "");
    });
    el.submit.on("click", function () {
        if (el.id.val()) {
            PUT({
                _id : el.id.val(),
                sanggar : el.sanggar.val(),
                group : el.group.select2("val")
            })
        } else {
            POST({
                sanggar : el.sanggar.val(),
                group : el.group.select2("val")
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