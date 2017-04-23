var main = function () {
    var me = this;
    var p = me.p;
    var dFormat = "yyyy-MM-dd HH:mm";
    var url = {
        sum : "/api/aCamp?q=sum",
        detail : "/api/aCamp?q=detail"
    };
    var el = {
        containertablesum : p.find('#container-table-sum'),
        containertabledetail : p.find('#container-table-detail'),
        searchsum : p.find('#search-sum'),
        searchdetail : p.find('#search-detail'),
        dlsum : p.find('#download-sum'),
        dldetail : p.find('#download-detail'),
        info : p.find('#info'),
        modal : p.find('#modal')
    };
    var GET = function (url, cb, b) {
        var o = {
            url : url,
            method : "GET",
            dataType : 'json',
            async : true,
            success : function (res, is, jqXHR) {
                if (is !== "success") {
                    App.alert("Error READ\n" + JSON.stringify(jqXHR.responseText));
                } else {
                    if (res) {
                        if (res.success == true) {
                            cb(res);
                        } else {
                            App.alert("Error READ\n" + JSON.stringify(res.message));
                        }
                    } else {
                        App.alert("Error READ\n" + JSON.stringify(jqXHR.responseText));
                    }
                }
            }
        };
        if (b) o.body = b;
        $.ajax(o);
    };
    var initDetail = function (res) {
        var settings = {
            "sDom" : "<'table-responsive't><'row'<p i>>",
            "sPaginationType" : "bootstrap",
            "destroy" : true,
            "scrollCollapse" : true,
            "oLanguage" : {
                "sLengthMenu" : "_MENU_ ",
                "sInfo" : "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
            },
            "aaSorting" : [[2, 'desc']],
            "iDisplayLength" : 5
        };
        el.containertabledetail.html("");
        el.tabledetail = $('<table class="table table-striped table-condensed table-hover  no-footer" id="table-detail" role="grid">');
        el.tabledetail.append(
            '<thead>' +
            '<tr role="row">' +
            '<th>Nama Panitia</th>' +
            '<th>Nama Peserta</th>' +
            '<th>Tanggal Check IN</th>' +
            '<th>Tanggal Check OUT</th>' +
            '</tr>' +
            '</thead>'
        );
        el.tbodydetail = el.tabledetail.append('<tbody></tbody>');
        el.containertabledetail.append(el.tabledetail);
        //
        res.data.forEach(function (data) {
            var tr = $('<tr>');
            data.date_ = DateFormat.format.date(new Date(data.date).toString(), dFormat);
            data.date_out_ = data.date_out.trim() ? DateFormat.format.date(new Date(data.date_out).toString(), dFormat) : "";
            tr.data(data);
            tr.append('<td txt="' + data.panitia_name + '">' + data.panitia_name + '</td>');
            tr.append('<td txt="' + data.peserta_name + '">' + /*'(' + data.code + ') ' + */ data.peserta_name + '</td>');
            tr.append('<td txt="' + data.date_ + '">' + data.date_ + '</td>');
            tr.append('<td txt="' + data.date_out_ + '">' + data.date_out_ + '</td>');
            el.tbodydetail.append(tr)
        });
        //
        el.tbodydetail.find('[txt]').tooltip({
            container : 'body',
            title : function () {
                return $(this).attr('txt')
            }
        });
        el.tabledetail.dataTable(settings);
        p.find('#search-detail').keyup(function () {
            el.tabledetail.fnFilter($(this).val());
        });
    };
    //
    p.find('[txt]').tooltip({
        container : 'body',
        title : function () {
            return $(this).attr('txt')
        }
    });
    el.dlsum.on("click", function () {
        window.open(url.sum + "&download")
    });
    el.dldetail.on("click", function () {
        window.open(url.detail + "&download" + "&filter=" + me.filter)
    });
    GET(url.sum, function (res) {
        res = res || {};
        res.data = res.data || [];
        var settings = {
            "sDom" : "<'table-responsive't><'row'<p i>>",
            "sPaginationType" : "bootstrap",
            "destroy" : true,
            "scrollCollapse" : true,
            "oLanguage" : {
                "sLengthMenu" : "_MENU_ ",
                "sInfo" : "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
            },
            "aaSorting" : [[0, 'desc']],
            "iDisplayLength" : 10
        };
        el.containertablesum.html("");
        el.tablesum = $('<table class="table table-striped table-condensed table-hover  no-footer" id="table-sum" role="grid">');
        el.tablesum.append(
            '<thead>' +
            '<tr role="row">' +
            '<th>Tanggal</th>' +
            //'<th>Branch</th>' +
            //'<th>Sub Branch</th>' +
            '<th>Nama SubCamp</th>' +
            '<th>Total Check IN</th>' +
            '<th>Total Check OUT</th>' +
            '</tr>' +
            '</thead>'
        );
        el.tbodysum = el.tablesum.append('<tbody></tbody>');
        el.containertablesum.append(el.tablesum);
        //
        res.data.forEach(function (data) {
            var tr = $('<tr>');
            tr.data(data);
            tr.append('<td txt="' + data.date + '">' + data.date + '</td>');
            //tr.append('<td txt="' + data.branch + '">' + data.branch + '</td>');
            //tr.append('<td txt="' + data.sub_branch + '">' + data.sub_branch + '</td>');
            tr.append('<td txt="' + data.camp + '">' + data.camp + '</td>');
            tr.append('<td txt="' + data.count + '">' + data.count + '</td>');
            tr.append(
                '<td>' +
                '<span txt="' + data.cnt_out + '">' + data.cnt_out + '</span>' +
                '<div class="pull-right">' +
                '<button txt="liat rincian" class="btn btn-xs btn-danger -detail" type="button" data-original-title="" title="">' +
                '<i class="fa fa fa-copy"></i>' +
                '</button></div></td>'
            );
            tr.append('</td>');
            el.tbodysum.append(tr)
        });
        //
        el.tbodysum.find('[txt]').tooltip({
            container : 'body',
            title : function () {
                return $(this).attr('txt')
            }
        });
        //
        el.tablesum.find('tr td button.-detail').on('click', function (ev) {
            var data = $(this).closest('tr').data();
            me.filter = JSON.stringify({
                date : data.date,
                branch : data.branch,
                subbranch : data.sub_branch,
                camp : data.camp
            });
            GET(url.detail + "&filter=" + me.filter, function (res) {
                res = res || {};
                res.data = res.data || [];
                el.modal.modal('show');
                el.info.text(data.camp);
                initDetail(res);
            })
        });
        el.tablesum.dataTable(settings);
        p.find('#search-sum').keyup(function () {
            el.tablesum.fnFilter($(this).val());
        });
    });
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
