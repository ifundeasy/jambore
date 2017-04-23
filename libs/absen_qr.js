var fs=require('fs')
var Db=require('./db')
var db=new Db();
var json=fs.readFileSync(process.argv[2],'utf8');
json=JSON.parse(json)
console.log(json.length)
var pop=json.pop();
pop.panitia_id='57950248671786ac2bf90aa5'
pop.kegiatan='5793d2a746a7fa5b616f1562'
pop.lat='-6.2302425'
pop.long='106.8109243'
pop.qr=pop._id
loop(pop)
function loop(data){
	db.absenKegiatan(data,function(err,res){
		console.log(err)
		console.log(res)
		var pop=json.pop();
		if(pop!=undefined){
pop.qr=pop._id
pop.lat='-6.2302425'
pop.long='106.8109243'
pop.kegiatan='5793d2a746a7fa5b616f1562'
			pop.panitia_id='57950248671786ac2bf90aa5'
			loop(pop)
		}else{
			process.exit()
		}
	})
}

