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
var ajaxGet = function (url, fn, async) {
    $.ajax({
        url : url,
        type : 'GET',
        dataType : 'json',
        async : async || false,
        complete : function (xhr, what) {
            if (what !== "success") {
                App.alert(xhr.responseText);
            } else {
                var res = xhr.responseJSON;
                if (res) {
                    if (res.success == true) {
                        fn(res);
                    } else {
                        App.alert(res.message);
                    }
                } else {
                    App.alert(xhr.responseText);
                }
            }
        }
    });
};
var main = function (me) {
    var p = $('div[page="events"]');
    var table = p.find('#table');
    var mapDiv = p.find('#map');
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 190;
    var settings = {
        "sDom" : "<'table-responsive't><'row'<p i>>",
        "sPaginationType" : "bootstrap",
        "destroy" : true,
        "scrollCollapse" : true,
        "oLanguage" : {
            "sLengthMenu" : "_MENU_ ",
            "sInfo" : "Showing <b>_START_ to _END_</b> of _TOTAL_ entries"
        },
        "aaSorting": [ [0,'desc'] ],
        "iDisplayLength" : 10
    };
    var map, setMarkers = function (el) {
        if (el.lat && el.lat) {
            var lat = parseFloat(el.lat);
            var long = parseFloat(el.long);
            el.marker = new google.maps.Marker({
                position : {lat : lat, lng : long},
                map : map,
                animation : google.maps.Animation.DROP,
                label : el.scoutmaster
            });
            map.setCenter(el.marker.position);
            map.setZoom(14);
        } else {
            map.setZoom(7);
        }
    };
    //
    mapDiv.height(height);
    ajaxGet('/api/event', function (res) {
        map = new google.maps.Map(mapDiv[0], {
            center : {lat : -6.1294073, lng : 106.8354107},
            zoom : 7
        });
        res.data.forEach(function (data) {
            data.panitia_id = data.panitia_id || {};
            //
            var tr = $('<tr>');
            var location = (data.lat || "?") + ', ' + (data.long || "?");
            var date = new Date(data.date);
            var obj = {
                date : date,
                date_ : dateFormat(date).parse('y-m-d h:i'),
                scoutmaster : data.panitia_id.name || "?",
                message : data.message || "?",
                type : data.type || "?",
                location : location,
                lat : data.lat,
                long : data.long
            };
            tr.data(obj);
            tr.append('<td txt="' + obj.date_ + '">' + obj.date_ + '</td>');
            tr.append('<td txt="' + obj.scoutmaster + '">' + obj.scoutmaster + '</td>');
            tr.append('<td txt="[' + obj.type + '] ' + obj.message + '">' + '[' + obj.type + '] ' + obj.message + '</td>');
            tr.append('<td txt="' + obj.location + '">' + obj.location + '</td>');
            p.find('#table tbody').append(tr)
        });
        p.find('[txt]').tooltip({
            container : 'body',
            title : function () {
                return $(this).attr('txt')
            }
        });
        table.find('tbody tr').on('click', function (ev) {
            var data = $(this).closest('tr').data();
            table.find('tr').each(function (i, el) {
                var marker = $(this).data("marker");
                if (marker) marker.setMap(null);
            });
            p.find("#info").text(data.scoutmaster + ': [' + data.type + '] ' + data.message);
            setMarkers(data)
        });
        //
        table.dataTable(settings);
        p.find('#search').keyup(function () {
            table.fnFilter($(this).val());
        });
        table.find('tbody tr:nth-child(1)').click();
    });
};
//
App.ctrl = App.ctrl || {};
$(App.current).ready(function () {
    var Fn = new Function();
    Fn.prototype.p = $(App.current);
    Fn.prototype.init = function () {
        var src = 'http://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=';
        if (!window.google) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = src + 'main';
            document.getElementsByTagName("head")[0].appendChild(script);
        } else main();
    };
    //
    App.ctrl[App.todo] = new Fn();
    App.ctrl[App.todo].init();
});
