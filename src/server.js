const express=require('express');
const cors=require('cors');
const db=require('./store');
const app=express();
app.use(cors()); app.use(express.json());
app.get('/api/health',(req,res)=>res.json({ok:true,app:'Ganado Control API'}));
app.get('/api/animals',(req,res)=>db.all('SELECT * FROM animals ORDER BY id DESC',[],(e,rows)=>e?res.status(500).json({error:e.message}):res.json(rows)));
app.post('/api/animals',(req,res)=>{
 const {code,name,breed,sex,birth_date,weight}=req.body;
 if(!code||!name||!breed||!sex||!birth_date||!Number.isFinite(Number(weight))||Number(weight)<=0) return res.status(400).json({error:'Complete todos los campos; el peso debe ser mayor que cero.'});
 db.run('INSERT INTO animals(code,name,breed,sex,birth_date,weight) VALUES(?,?,?,?,?,?)',[code,name,breed,sex,birth_date,Number(weight)],function(e){if(e)return res.status(400).json({error:e.message});db.get('SELECT * FROM animals WHERE id=?',[this.lastID],(err,row)=>res.status(201).json(row));});
});
app.put('/api/animals/:id',(req,res)=>{
 const {code,name,breed,sex,birth_date,weight}=req.body;
 if(!code||!name||!breed||!sex||!birth_date||!Number.isFinite(Number(weight))||Number(weight)<=0)return res.status(400).json({error:'Datos incompletos o peso inválido.'});
 db.run('UPDATE animals SET code=?,name=?,breed=?,sex=?,birth_date=?,weight=? WHERE id=?',[code,name,breed,sex,birth_date,Number(weight),req.params.id],function(e){if(e)return res.status(400).json({error:e.message});if(!this.changes)return res.status(404).json({error:'Animal no encontrado'});db.get('SELECT * FROM animals WHERE id=?',[req.params.id],(err,row)=>res.json(row));});
});
app.delete('/api/animals/:id',(req,res)=>db.run('DELETE FROM animals WHERE id=?',[req.params.id],function(e){if(e)return res.status(500).json({error:e.message});if(!this.changes)return res.status(404).json({error:'Animal no encontrado'});res.json({deleted:true});}));
app.get('/api/readings',(req,res)=>db.all('SELECT * FROM readings ORDER BY id DESC LIMIT 100',[],(e,rows)=>e?res.status(500).json({error:e.message}):res.json(rows)));
app.post('/api/readings',(req,res)=>{
 const {temperature,humidity,device}=req.body;
 if(!Number.isFinite(Number(temperature))||!Number.isFinite(Number(humidity))||Number(humidity)<0||Number(humidity)>100)return res.status(400).json({error:'Temperatura o humedad inválida.'});
 db.run('INSERT INTO readings(temperature,humidity,device) VALUES(?,?,?)',[Number(temperature),Number(humidity),device||'ESP32'],function(e){if(e)return res.status(500).json({error:e.message});res.status(201).json({id:this.lastID,temperature:Number(temperature),humidity:Number(humidity),device:device||'ESP32',created_at:new Date().toISOString()});});
});
app.get('/api/summary',(req,res)=>db.get('SELECT COUNT(*) total, SUM(CASE WHEN sex="Hembra" THEN 1 ELSE 0 END) females, SUM(CASE WHEN sex="Macho" THEN 1 ELSE 0 END) males, ROUND(AVG(weight),1) avg_weight FROM animals',[],(e,row)=>e?res.status(500).json({error:e.message}):res.json({...row,total:row.total||0,females:row.females||0,males:row.males||0})));
const port=process.env.PORT||3000;
app.listen(port,'0.0.0.0',()=>console.log(`Ganado Control API en http://localhost:${port}`));
