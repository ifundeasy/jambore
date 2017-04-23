var mongoose = require('mongoose')
require('mongoose-double')(mongoose);
var uri = 'mongodb://localhost:27017/jamnas2016';
mongoose.connect(uri);
var panitia = mongoose.model('panitia', {name:String,user_name:String,password:String});

function loop(body){
	var data=new panitia(body)
	data.save(function (err, res) {
		if (err){
			console.log(body)
		}
	});
}

for (var i=1;i<101;i++){
	loop({name:"gdv"+i,user_name:"gdv"+i,password:"jambore123"})
	loop({name:"tsb"+i,user_name:"tsb"+i,password:"jambore123"})
	loop({name:"air"+i,user_name:"air"+i,password:"jambore123"})
	loop({name:"kkp"+i,user_name:"kkp"+i,password:"jambore123"})
	loop({name:"pmw"+i,user_name:"pmw"+i,password:"jambore123"})
	loop({name:"ptlg"+i,user_name:"ptlg"+i,password:"jambore123"})
}
