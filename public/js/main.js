window.App = window.App || {};
window.socket = socketCluster.connect();
var toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
socket.on('error', function (err) {
    throw 'Socket error - ' + err;
});
socket.on('connect', function () {
    console.log('CONNECTED');
});
var panicChannel = socket.subscribe('panic');
panicChannel.on('subscribeFail', function (err) {
    console.error('Failed to subscribe to the panic channel due to error: ' + err);
});
panicChannel.watch(function (d) {
    var id = "panic-" + new Date().getTime();
    socket.emit('panicEvent', d);
    console.warn('PANIC channel message:', JSON.stringify(d));
    d.panitia_id = d.panitia_id || "Someone";
    App.alert(d.panitia_id + " was panic!<br id='"+ id +"'>Message : " + d.message, "top-right");
    //    $('body').pgNotification({
//        style: 'flip',
//        message: d.panitia_id + " was panic!<br id='"+ id +"'>Message : " + d.message,
//        position: "top-right",
//        timeout: 0,
//        type: 'danger'
//    }).show();
    var parent = $("#" + id).parent();
    parent.attr("title", "Click this for see this event");
    parent.on("click", function () {
        $('li[todo="events"]').click();
    })
});
//
$(document).ready(function () {
    App.alert = function (message, position) {
        if (!message) message = "";
        else if (typeof message == 'object') message = JSON.stringify(message);
        else if (typeof message !== 'string') message = message.toString();
        message = message.replace(/\n/g, '<br/>');
        console.error(message);
        $('body').pgNotification({
            style : 'flip',
            message : message,
            position : position || "top-left",
            timeout : 0,
            type : 'danger'
        }).show();
    };
    App.success = function (message) {
        if (!message) message = "";
        else if (typeof message == 'object') message = JSON.stringify(message);
        else if (typeof message !== 'string') message = message.toString();
        message = message.replace(/\n/g, '<br/>');
        var o = {
            style : 'flip',
            position : "top-left",
            timeout : 1500,
            type : 'success'
        };
        o.message = (message || "berhasil").replace(/\n/g, '<br/>');
        $('body').pgNotification(o).show();
    };
    $($('li[todo]')[0]).addClass("m-t-30 active");
    var getPage = function (todo) {
        if (todo) return $('div[page="' + todo + '"]');
        else return $('div[page]');
    };
    var load = function (todo) {
        $('li[todo] span.icon-thumbnail').removeClass('bg-success-important');
        if (todo) {
            window.App.todo = todo;
            window.App.current = 'div[page="' + todo + '"]';
            $('li[todo="'+ todo +'"] span.icon-thumbnail').addClass('bg-success-important');
            $.get("/html/" + todo + ".html", function (raw, is) {
                if (is == "success") $('#content').append(raw);
            });
        } else {
            console.warn("Invalid", "/html/" + todo + ".html")
        }
    };
    var check = $('li[todo].active');
    if (check.attr('todo')) load(check.attr('todo'));
    $('li[todo]').on("click", function () {
        var what = $(this);
        var todo = what.attr('todo');
        //getPage().hide();
        getPage().remove();
        load(todo);
    });
});
