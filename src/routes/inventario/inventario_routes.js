const express = require('express');
const router = express.Router();
const pool = require('../../../Model/bd');
const { isLoggedIn } = require('../../lib/auth');
//const { isLoggedIn } = require('../lib/auth');
const multer = require('multer');



router.get('/producto/camisas',isLoggedIn,async (req, res) => {

 
     const categoria= await pool.query('select id,nombre from tblinv_categoria');
     const marca= await pool.query('select id,nombre from tblinv_marca');
     const tela= await pool.query('select id,nombre from tblinv_material');
      const p = await pool.query('select p.id, p.imagen,p.nombre,m.nombre as marca, ma.nombre as material from tblinv_producto as p inner join tblinv_marca as m on (p.id_marca=m.id) inner join tblinv_material as ma on(p.id_material=ma.id) where id_categoria=1');
     res.render('inventario/secciones/camisas',{p,categoria,marca,tela});
   
   });





 router.get('/producto/pantalones',isLoggedIn,async (req, res) => {
    
    const categoria= await pool.query('select id,nombre from tblinv_categoria');
    const marca= await pool.query('select id,nombre from tblinv_marca');
    const tela= await pool.query('select id,nombre from tblinv_material');
     const p = await pool.query('select p.id, p.imagen,p.nombre,m.nombre as marca, ma.nombre as material from tblinv_producto as p inner join tblinv_marca as m on (p.id_marca=m.id) inner join tblinv_material as ma on(p.id_material=ma.id) where id_categoria=2');
   console.log(p)
     res.render('inventario/secciones/pantalones',{p,categoria,marca,tela});
   
 });
 router.get('/producto/gorras',isLoggedIn,async (req, res)  => {
    const categoria= await pool.query('select id,nombre from tblinv_categoria');
    const marca= await pool.query('select id,nombre from tblinv_marca');
    const tela= await pool.query('select id,nombre from tblinv_material');
     const p = await pool.query('select p.id, p.imagen,p.nombre,m.nombre as marca, ma.nombre as material from tblinv_producto as p inner join tblinv_marca as m on (p.id_marca=m.id) inner join tblinv_material as ma on(p.id_material=ma.id) where id_categoria=3');
    res.render('inventario/secciones/gorras',{p,categoria,marca,tela});
 });
 router.get('/producto/zapatos',isLoggedIn,async (req, res) => {
    const categoria= await pool.query('select id,nombre from tblinv_categoria');
    const marca= await pool.query('select id,nombre from tblinv_marca');
    const tela= await pool.query('select id,nombre from tblinv_material');
    const p = await pool.query('select p.id, p.imagen,p.nombre,m.nombre as marca, ma.nombre as material from tblinv_producto as p inner join tblinv_marca as m on (p.id_marca=m.id) inner join tblinv_material as ma on(p.id_material=ma.id) where id_categoria=4');
    res.render('inventario/secciones/zapatos',{p,categoria,marca,tela});
 });
 
 router.get('/inventario',isLoggedIn,async (req, res) => {

  const talla = await pool.query('select id,nombre from tblinv_tallas');
  const producto = await pool.query('select id,nombre from tblinv_producto');
  const carga= await pool.query('select ti.id,concat(p.nombre, " ",t.nombre) as nombre from tblinv_inventario as ti  inner join tblinv_producto as p on(ti.id_producto=p.id) inner join tblinv_tallas as t on(ti.id_tallas=t.id)')
    const i = await pool.query('select i.id as id,p.codproducto as cod, p.nombre as producto,it.nombre as tallas, i.existencias, i.existencias_minima,i.disponibilidad from tblinv_inventario as i inner join tblinv_producto as p  on(i.id_producto=p.id) inner join tblinv_tallas as it on(i.id_tallas=it.id) ');
   res.render('inventario/secciones/inventario',{i,talla,producto,carga});
 
 });


  //aca se suben las imagenes al servidor 
  const DIR = '../Madmin/src/public/images/Products';
 // const dir2='../Momba/src/public/images/Products';
  let storage = multer.diskStorage({
   destination: function (req, file, callback) {
     callback(null, DIR);
  //   callback(null, dir2);
   },
   filename: function (req, file, cb) {
     cb(null, file.originalname);
   }
 });
 
  let upload = multer({storage: storage});
  router.post('/products', upload.single('imagen'),async(req,res)=>{
   const {cod,nombre,categoria,marca,tela,precio_compra,precio_venta}=req.body;
   console.log(req.body)
 
   var file = req.file;
   console.log(file)
   var img='images/Products/'+file.originalname;
 
      if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){                           
               await pool.query('insert tblinv_producto(codproducto,imagen,nombre,id_categoria,id_marca,id_material,precio_compra,precio_venta) values(?,?,?,?,?,?,?,?)',[cod,img, nombre,categoria,marca,tela,precio_compra,precio_venta]);
               res.redirect('/inventario')           
            
         } 
     else {
           console.log('no se pudo')
          // message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
          // res.render('index.ejs',{message: message});
         }
  });
  router.post('/inventario', async(req,res)=>{
 
   const {id_producto,id_talla, existencias,existencias_minimas}=req.body;
   await pool.query('insert tblinv_inventario(id_producto,id_tallas,existencias,existencias_minima,disponibilidad) values(?,?,?,?,?)',[id_producto,id_talla,existencias,existencias_minimas,existencias]);
   await pool.query('insert tblinv_talla_producto(id_talla,id_producto) values(?,?)',[id_talla,id_producto]);
   
   res.redirect('/inventario')
 
  });


  router.post('/inventario/carga', async(req,res)=>{
    const {id_producto,cantidad}=req.body;
    await pool.query('update tblinv_inventario set existencias=existencias+? where id=?',[cantidad,id_producto]);
    await pool.query('update tblinv_inventario set disponibilidad=disponibilidad+? where id=?',[cantidad,id_producto]);
    res.redirect('/inventario')
  
   });


module.exports = router;