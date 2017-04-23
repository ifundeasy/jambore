var main = function (me) {
    var p = $('div[page="monitor"]');
    var mock = true;
    var lastHours = 5;
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 195;
    var mapDiv = p.find('#map');
    var random = function (o) {
        var a = Math.random() * 1000000;
        var b = parseInt(a.toString().substring(0, 4));
        return b >= o.min && b <= o.max ? o.base >= 0 ? o.base + b / o.decimals : o.base - b / o.decimals : random(o);
    };
    var getLatLong = function () {
        return {
            lat : random({
                base : -6.1,
                decimals : 100000,
                min : 1000,
                max : 5000
            }),
            long : random({
                base : 106.78,
                decimals : 100000,
                min : 1000,
                max : 5000
            })
        }
    };
    mapDiv.height(height);
    $.ajax({
        url : "/api/maps",
        type : 'GET',
        dataType : 'json',
        async : true,
        complete : function (xhr, what) {
            if (what !== "success") {
                App.alert(xhr.responseText)
            } else {
                var res = xhr.responseJSON;
                if (res) {
                    if (res.success == true) {
                        var data = [];
                        var push = function(el, e) {
                            e.forEach(function (x, i) {
                                el[res.data.fields[i]] = x;
                            });
                            data.push(el);
                        };
                        res.data.rows.forEach(function (e) {
                            var el = {};
                            e[0] = new Date(e[0]);
                            if (mock) {
                                if (!e[8] || !e[9]) {
                                    el.valid = false;
                                    e[8] = getLatLong().lat;
                                    e[9] = getLatLong().long;
                                } else {
                                    el.valid = true;
                                    e[8] = parseFloat(e[8]);
                                    e[9] = parseFloat(e[9]);
                                }
                                push(el, e)
                            } else if (e[8] && e[9]) {
                                e[8] = parseFloat(e[8]);
                                e[9] = parseFloat(e[9]);
                                push(el, e);
                            }
                        });
                        draw(data);
                    } else {
                        App.alert(res.message)
                    }
                } else {
                    App.alert(xhr.responseText)
                }
            }
        }
    });
    var draw = function (data) {
        var now = new Date();
        now.setHours(now.getHours() - lastHours);
        var bounds = new google.maps.LatLngBounds();
        var map = new google.maps.Map(mapDiv[0], {
            center : {lat : -6.1294073, lng : 106.8354107},
            zoom : 13
        });
        var setMarkers = function (map) {
            data.forEach(function (el) {
                var d = (function () {
                    var h = [];
                    var x = {};
                    for (var i in el) {
                        x[i] = el[i];
                        h.push(el[i]);
                    }
                    h = h.join(" ").toLowerCase().replace(/\t|\n|\(|\)/g, '').replace(/\s+/g, ' ');
                    return {
                        data : x,
                        hash : h
                    };
                })();
                el.marker = new google.maps.Marker({
                    position : {lat : el.lat, lng : el.long},
                    map : map,
                    animation : google.maps.Animation.DROP,
                    data : d.data,
                    hash : d.hash,
                    label : el.panitia_name
                });
                el.marker.addListener('click', function () {
                    var data = this.data;
                    var pos = this.position;
                    var z1 = setTimeout(function () {
                        clearTimeout(z1);
                        map.setCenter(pos);
                        var z2 = setTimeout(function () {
                            clearTimeout(z2);
                            var add = data.valid ? "" : " [?]";
                            el.info = new google.maps.InfoWindow({map : map});
                            el.info.setPosition(pos);
                            el.info.setContent(data.peserta_name + add);
                            var z3 = setTimeout(function () {
                                clearTimeout(z3);
                                el.info.close()
                            }, 3000);
                        }, 500);
                    }, 200);
                });
                bounds.extend(el.marker.getPosition())
            });
            map.fitBounds(bounds);
        };
        setMarkers(map);
        $("#search").keyup(function (e) {
            var val = $(this).val();
            var code = e.which; // recommended to use e.which, it's normalized across browsers
            if (code == 13) e.preventDefault();
            if (code == 32 || code == 13 || code == 188 || code == 186) {
                if (val) {
                    val = val.toLowerCase().replace(/\t|\n|\(|\)/g, '').replace(/\s+/g, ' ');
                    data.forEach(function(el){
                        var mrk = el.marker;
                        var hash = mrk.hash;
                        var rgEx = new RegExp(val);
                        if (hash.match(rgEx)) {
                            mrk.setMap(map)
                        } else {
                            mrk.setMap(null)
                        }
                    })
                } else {
                    data.forEach(function(el){el.marker.setMap(map)})
                }
            }
        })
    }
};
//
App.ctrl = App.ctrl || {};
$(App.current).ready(function () {
    var Fn = new Function();
    Fn.prototype.p = $(App.current);
    Fn.prototype.init = function () {
        var testr = [],
            scripts = document.getElementsByTagName('script'),
            src = 'http://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=';
        for (var f = 0; f < scripts.length; f++) {
            if (scripts[f].src.indexOf(src) !== -1) {
                testr.push(src);
                break;
            }
            testr.push(scripts[f].src);
        }
        if (!window.google && (testr.indexOf(src) == -1)) { //avoid duplicate script!
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = src + "main";
            document.getElementsByTagName("head")[0].appendChild(script);
        } else main();
    };
    //
    App.ctrl[App.todo] = new Fn();
    App.ctrl[App.todo].init();
});