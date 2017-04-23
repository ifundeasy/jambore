var Db = require('./db')
var db = new Db();
var array=['Pengenalan masyarakat dan Wisata,Pengenalan masyarakat dan Wisata',
'Petualangan,Petualangan',
'Festival Hari Kemerdekaan,Festival Hari Kemerdekaan',
'Malam Kebudayaan,Malam Kebudayaan',
'Keterampilan Kepramukaan dan Peminatan,Seni Ukir',
'Keterampilan Kepramukaan dan Peminatan,Pemanfaatan bambu',
'Keterampilan Kepramukaan dan Peminatan,Pembuatan Lampion',
'Keterampilan Kepramukaan dan Peminatan,Pembuatan ring kacu dari kulit (Wogling)',
'Keterampilan Kepramukaan dan Peminatan,Seni MEMBATIK',
'Keterampilan Kepramukaan dan Peminatan,Masak Rimba',
'Keterampilan Kepramukaan dan Peminatan,Bivak',
'Keterampilan Kepramukaan dan Peminatan,Pionering',
'Keterampilan Kepramukaan dan Peminatan,PPGD',
'Keterampilan Kepramukaan dan Peminatan,Semboyan dan syarat',
'Keterampilan Kepramukaan dan Peminatan,"Menaksir tinggi, diameter dan usia pohon"',
'Keterampilan Kepramukaan dan Peminatan,Kucing',
'Keterampilan Kepramukaan dan Peminatan,Anjing',
'Keterampilan Kepramukaan dan Peminatan,Burung Merpati Balapan',
'Keterampilan Kepramukaan dan Peminatan,Reptil',
'Keterampilan Kepramukaan dan Peminatan,Belut',
'Keterampilan Kepramukaan dan Peminatan,Navigasi Darat',
'Keterampilan Kepramukaan dan Peminatan,Lempar Pisau',
'Keterampilan Kepramukaan dan Peminatan,Memanah',
'Keterampilan Kepramukaan dan Peminatan,Ketapel',
'Keterampilan Kepramukaan dan Peminatan,Bermain Laso',
'Kegiatan Air,Diving/Selam',
'Kegiatan Air,Renang',
'Kegiatan Air,Dayung Perahu Karet',
'Kegiatan Air,Water Rescue/SAR',
'Kegiatan Air,Membuat Rakit Bambu',
'Kegiatan Air,Mendayung Kano',
'Kegiatan Air,Navigasi laut',
'Kegiatan Air,Volley Pantai',
'Kegiatan Air,Perahu Naga',
'Kegiatan Air,Water Survival',
'Kegiatan Air,Penelitian dan Pengelolaan Air',
'Kegiatan Air,Roket Air',
'Kegiatan Air,Memancing',
'Kegiatan Air,Tenda Terapung',
'Global Development Village,Anti Narkoba',
'Global Development Village,Anti Tembakau',
'Global Development Village,Bonus Demografi',
'Global Development Village,Empat Pilar',
'Global Development Village,Filariasis',
'Global Development Village,Generasi Berencana (GenRe)',
'Global Development Village,HIV / AIDS',
'Global Development Village,Imuniasasi',
'Global Development Village,Infeksi Saluran Pernafasan Akut (ISPA)',
'Global Development Village,Infeksi Saluran Pernafasan Akut (ISPA)',
'Global Development Village,Keluarga Bahagia',
'Global Development Village,Kesehatan Jiwa',
'Global Development Village,Kesehatan Reproduksi (Kespro)',
'Global Development Village,Keselamatan Transportasi',
'Global Development Village,Legislatif Indonesia',
'Global Development Village,LGBT',
'Global Development Village,Malaria',
'Global Development Village,Pengenalan Penyakit Jantung ',
'Global Development Village,Perilaku Hidup Bersih dan Sehat (PHBS)',
'Global Development Village,Posdaya',
'Global Development Village,Rabies',
'Global Development Village,Sustainable Development Goal’s (SDG’s)',
'Global Development Village,Senator Indonesia',
'Global Development Village,Tuberkulosis (TB)',
'Global Development Village,Virus Zika',
'Global Development Village,Advokasi Hak Azazi Manusia',
'Global Development Village,Anti Bullying',
'Global Development Village,Perdagangan Manusia Human Trafficking',
'Global Development Village,Kekerasan terhadap Anak-Anak',
'Global Development Village,Penghapusan Kekerasan Dalam Rumah Tangga',
'Global Development Village,Kebakaran dan eksploitasi hutan',
'Global Development Village,Pencemaran sungai dan laut',
'Global Development Village,Ketahanan Pangan',
'Global Development Village,Potensi Maritim Indonesia',
'Global Development Village,Kesehatan Lingkungan',
'Global Development Village,"Reduce, Reuse, Reccycle (3R)"',
'Global Development Village,Penanggulangan Bencana dan Simulasi Kegawat Daruratan',
'Global Development Village,SCENE (Scout Center of Excellence for Nature and Environment) - WOSM/APR',
'Global Development Village,Komposting',
'Global Development Village,Perubahan Iklim',
'Global Development Village,Keanekaragaman Hayati',
'Global Development Village,Energi Baru dan Terbarukan',
'Global Development Village,Bela Negara',
'Global Development Village,Kebhayangkaraan',
'Global Development Village,Messengers of Peace',
'Global Development Village,"Perdamaian Global dalam kaitan Minimalisasi Masalah SARA (Suku, Agama, Ras, Antargolongan)"',
'Global Development Village,Radikalisme dan Deradikalisme',
'Teknologi & Seni Budaya,Musik',
'Teknologi & Seni Budaya,Tari',
'Teknologi & Seni Budaya,Kebudayaan 34 Kwartir Daerah',
'Teknologi & Seni Budaya,Dunia Kuliner',
'Teknologi & Seni Budaya,Dunia Kuliner',
'Teknologi & Seni Budaya,Dunia Sinematografi',
'Teknologi & Seni Budaya,Kepemudaan dan Olahraga',
'Teknologi & Seni Budaya,Teknik Desain dan Animasi',
'Teknologi & Seni Budaya,Teknik Menulis (Cerita dan Blog)',
'Teknologi & Seni Budaya,PT. Garuda Indonesia Tbk',
'Teknologi & Seni Budaya,PT. INKA Madiun',
'Teknologi & Seni Budaya,PT. Madu Pramuka',
'Teknologi & Seni Budaya,PT. PAL',
'Teknologi & Seni Budaya,PT. Uniliver Indonesia',
'Teknologi & Seni Budaya,Inovasi Buklir Indonesia',
'Teknologi & Seni Budaya,Teknologi Otomotif',
'Teknologi & Seni Budaya,TV Broadcasting',
'Kegiatan Wawasan,Berbagi Pengalaman',
'Kegiatan Wawasan,Jumpa Tokoh',
'Kegiatan Wawasan,STORY TELLING',
'Kegiatan Wawasan,Sosialisasi Pentas Seni dan Budaya',
'Kegiatan Wawasan,Revolusi Mental']
var _cb = function (err, res) {
console.log(err)
console.log(res)
}
for (var i in array) {
    var data = {group : array[i].split(',')[0], sanggar : array[i].split(',')[1]}
//	db.insertKegiatan(data,_cb)
}
var data = {"qr" : "5764c10d1d2d0b9004347ec4", "lat" : "-6.3328061", "panitia_id" : "5793bf7708fbd8a15af6ad6b", "long" : "106.7720599"}
var data = {"code" : "nRBL", "lat" : "-6.3328061", "panitia_id" : "5793bf7708fbd8a15af6ad6b", "long" : "106.7720599", "kegiatan" : "5793d2a746a7fa5b616f1562"}
var param1 = {
    date : {
        "$gte" : new Date(2016, 7, 1),
        "$lt" : new Date(2016, 7, 2)
    }
};
var param2 = {
    date : {
        "$gte" : new Date(2016, 7, 1),
        "$lt" : new Date(2016, 7, 2)
    },
    branch : 'Kwarda Sumatera Selatan',
    subbranch : 'Kwarcab Kota Palembang'
};
/*db.getAbsenJambore({}, function (err, res) {
    console.log(1, err, res.length)
});
console.log(param2)*/
db.getMaps(param2, function (err, res) {
console.log(err)
    console.log(res)
})
