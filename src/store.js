const sqlite3=require('sqlite3').verbose();
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'..','data');fs.mkdirSync(dir,{recursive:true});
const db=new sqlite3.Database(path.join(dir,'ganado_control.db'));
db.serialize(()=>{
 db.run(`CREATE TABLE IF NOT EXISTS animals(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT UNIQUE NOT NULL,name TEXT NOT NULL,breed TEXT NOT NULL,sex TEXT NOT NULL,birth_date TEXT NOT NULL,weight REAL NOT NULL)`);
 db.run(`CREATE TABLE IF NOT EXISTS readings(id INTEGER PRIMARY KEY AUTOINCREMENT,temperature REAL NOT NULL,humidity REAL NOT NULL,device TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
 db.get('SELECT COUNT(*) n FROM animals',[],(e,r)=>{if(!e&&r.n===0){const s=db.prepare('INSERT INTO animals(code,name,breed,sex,birth_date,weight) VALUES(?,?,?,?,?,?)');[['GC-001','Luna','Holstein','Hembra','2022-04-10',430],['GC-002','Toro 02','Angus','Macho','2021-08-15',610],['GC-003','Mora','Brown Swiss','Hembra','2023-01-20',315]].forEach(x=>s.run(x));s.finalize();}});
});
module.exports=db;
