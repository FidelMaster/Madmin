const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const puppeteer = require('puppeteer');
const pool = require('../../Model/bd');
const { isLoggedIn } = require('../lib/auth');
const path = require('path');
const passport = require('passport');
//const { isLoggedIn } = require('../lib/auth');
const handlebars = require("handlebars");
const fs = require("fs");
const multer = require('multer');



 router.get('/tiposU', isLoggedIn,async (req, res) => {
     const t = await pool.query('select id,nombre from tbladmin_roles')
    res.render('secciones/tiposU',{t});
  });
  
 router.get('/pedidos',isLoggedIn, async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==4 )
 {
    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id)')
   res.render('cliente/pedidos',{pe});
  }else {
    res.redirect('/perfil');
  }
 });


 router.get('/pedidos/pendientes', isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==4 )
 {
  const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=6')
  res.render('cliente/pedidosP',{pe});
}else {
  res.redirect('/perfil');
}
});
router.get('/pedidos/reparto',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==4 )
 {
  const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=2')
 res.render('cliente/pedidosR',{pe});
}else {
  res.redirect('/perfil');
}
});
router.get('/pedidos/transito',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==4 )
 {
  const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=1')
  res.render('cliente/pedidosT',{pe});
}else {
  res.redirect('/perfil');
}
});
router.get('/pedidos/entregados',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==4 )
 {
  const peE = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=8')
 res.render('cliente/pedidosE',{pe});
}else {
  res.redirect('/perfil');
}
});

  router.get('/usuario',isLoggedIn,async (req, res) => {
    const id=req.user.id;
    const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
    if(rol[0].id==2)
   {
    const p = await pool.query('select te.id,tp.nombre,tp.apellido,tu.correo,tp.fecha_nacimiento,tr.nombre as rol from tblusuarios_empleados as te inner join tblusuarios_persona tp on(te.id_persona=tp.id) inner join tbladmin_users as tu on(tp.id_user=tu.id) inner join  	tbladmin_roles_users  as tru on(tru.id_user=tu.id) inner join  	tbladmin_roles as tr on(tru.id_role=tr.id)')
    const roles= await pool.query('select id,nombre from tbladmin_roles');
    res.render('secciones/usuarios',{p,roles});
  }else {
    res.redirect('/perfil');
  }

 });
 router.get('/clientes',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2)
 {
   const c = await pool.query('select e.id,cr.correo as correo, p.nombre as nombre,p.apellido as apellido,p.celular from cliente as e inner join persona as p on(e.idPersona=p.id) inner join credenciales as cr on(p.id_Credencial=cr.id) where cr.idtipo=3',)
   res.render('cliente/registro',{c});
  }else {
    res.redirect('/perfil')
  }
 });
 router.get('/producto/camisas',isLoggedIn,async (req, res) => {

  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==3 )
 {
   const categoria= await pool.query('select id,nombre from tblinv_categoria');
   const marca= await pool.query('select id,nombre from tblinv_marca');
   const tela= await pool.query('select id,nombre from tblinv_material');
    const p = await pool.query('select p.id, p.imagen,p.nombre,m.nombre as marca, ma.nombre as material from tblinv_producto as p inner join tblinv_marca as m on (p.id_marca=m.id) inner join tblinv_material as ma on(p.id_material=ma.id) where id_categoria=1');
   res.render('secciones/camisas',{p,categoria,marca,tela});
  }else {
    res.redirect('/perfil');
  }
 });

 router.get('/producto/pantalones',isLoggedIn,async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=2');
   res.render('secciones/pantalones',{p});
 });
 router.get('/producto/gorras',isLoggedIn,async (req, res)  => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=3');
   res.render('secciones/gorras',{p});
 });
 router.get('/producto/zapatos',isLoggedIn,async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=4');
   res.render('secciones/zapatos',{p});
 });
 
 router.get('/inventario',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2 || rol[0].id==3 )
 {
  const talla = await pool.query('select id,nombre from tblinv_tallas');
  const producto = await pool.query('select id,nombre from tblinv_producto');
    const i = await pool.query('select i.id as id,p.codproducto as cod, p.nombre as producto,it.nombre as tallas, i.existencias, i.existencias_minima from tblinv_inventario as i inner join tblinv_producto as p  on(i.id_producto=p.id) inner join tblinv_tallas as it on(i.id_tallas=it.id) ');
   res.render('secciones/inventario',{i,talla,producto});
  }else {
    res.redirect('/perfil');
  }
 });

 //aca se suben las imagenes al servidor 
 const DIR = '../Madmin/src/public/images/Camisas';
 const dir2='../Momba/src/public/images/Camisas';
 let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, DIR);
    callback(null, dir2);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
  }
});

 let upload = multer({storage: storage});
 router.post('/camisas', upload.single('imagen'),async(req,res)=>{
  const {cod,nombre,categoria,marca,tela,precio_compra,precio_venta}=req.body;
  console.log(req.body)

  var file = req.file;
  var img='images/Camisas/'+file.filename;

     if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){                           
              await pool.query('insert tblinv_producto(codproducto,imagen,nombre,id_categoria,id_marca,id_material,precio_compra,precio_venta) values(?,?,?,?,?,?,?,?)',[cod,img, nombre,categoria,marca,tela,precio_compra,precio_venta]);
              res.redirect('/producto/camisas')           
           
        } 
    else {
          console.log('no se pudo')
         // message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
         // res.render('index.ejs',{message: message});
        }
 });
 router.post('/inventario', async(req,res)=>{

  const {id_producto,id_talla, existencias,existencias_minimas}=req.body;
  await pool.query('insert tblinv_inventario(id_producto,id_tallas,existencias,existencias_minima) values(?,?,?,?)',[id_producto,id_talla,existencias,existencias_minimas]);
  await pool.query('insert tblinv_talla_producto(id_talla,id_producto) values(?,?)',[id_talla,id_producto]);
  
  res.redirect('/producto/camisas')

 });

 router.get('/carrito/eliminar/:id',isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await pool.query('delete from tblcarro_bolsa_cliente where id=?', [id]);
  res.redirect('/carrito');
});

 router.get('/reporte/ventas',isLoggedIn,async (req, res) => {
  //const i = await pool.query('select i.id,p.imagen,p.nombre,i.existencia,i.fecha,i.costo from inventario as i inner join producto as p  on(i.idProducto=p.id) ');
  const totales= await pool.query('select * from venta_cliente_total ');
 
  res.render('reportes/reporte_ventas',{totales});
});
router.get('/reporte/reporte_inventario',isLoggedIn, async(req,res)=>{
  const inv =await pool.query('select i.idProducto,p.imagen,p.nombre,ca.nombre as categoria,i.existencia,i.costo,i.existencia*i.costo as CostoTotal from inventario as i inner join producto as p on(i.idProducto=p.id) inner join categoria as ca on(p.idCategoria=ca.id)');
  const t = await pool.query('SELECT sum(i.existencia*i.costo) as total FROM inventario as i');
  
  res.render('reportes/reporte_inventario',{inv,t});
});

router.get('/Recibir/Pedido/:id',isLoggedIn,async(req,res)=>{
    const { id } = req.params;
    await pool.query('update tblpedido_pedido_cliente set id_estado=2 where cod_factura=?',[id]);
    res.redirect('/pedidos');
});
router.get('/Recibir/Transito/:id', isLoggedIn,async(req,res)=>{
  const { id } = req.params;
  await pool.query('update tblpedido_pedido_cliente set id_estado=1 where cod_factura=?',[id]);
  res.redirect('/pedidos');
});

router.get('/pedido/:id',isLoggedIn,async (req, res) => {
  const { id } = req.params;
  const estado = await pool.query('select pe.id, pe.estado as nombre from tblpedido_pedido_cliente pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) where cod_factura=?',[id]);
  const pd = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) inner join tblventa_factura_detalle  as fdc on(pc.cod_factura=fdc.cod_factura) inner join tblinv_producto as p on(fdc.id_producto=p.id) where pc.cod_factura=?', [id]);
  const persona = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblusuarios_persona tp on(pc.id_user=tp.id_user) inner join tblusuarios_clientes as tuc on(tuc.id_persona=tp.id) where pc.cod_factura=?', [id])
  const cod = await pool.query('select * from tblpedido_pedido_cliente where cod_factura=?',[id]);
  const totales= await pool.query('select * from tblventa_factura_pago where cod_factura=?',[id]);


 
  res.render('cliente/detalle',{pd,persona,cod,totales,estado });
});



router.get('/mensajes',isLoggedIn,async (req, res) => {
  const id=req.user.id;
  const rol= await pool.query('select id_role as id from tbladmin_roles_users where id_user=?',[id]);
  if(rol[0].id==2)
 {
  const m= await pool.query('select * from tblinbox_mensaje');
  res.render('Mensaje/Mensajes',{m});
  }else {
    res.redirect('/perfil')
  }
});
 

router.get('/pedido/transito/:id',isLoggedIn,async (req, res) => {
  const { id } = req.params;
  const pd = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,pro.nombre,vct.total,ep.estado , pro.imagen,p.celular , pc.fecha,bc.cantidad,promp.precio FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id) inner join venta_cliente_total as vct on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)inner join bolsa_compra_cliente as bc on(pc.codVenta=bc.codVenta) inner join producto as pro on(bc.idProducto=pro.id) inner join promociones_producto as promp on(promp.idProducto=pro.id) where bc.codVenta=?', [id]);
   
  const persona = await pool.query('SELECT p.nombre,p.apellido,p.celular ,pc.fecha FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id)  where pc.codVenta=?', [id])

   const cod = await pool.query('select * from pedido_cliente where codVenta=?',[id]);
   const totales= await pool.query('select * from venta_cliente_total where codVenta=?',[id]);

  console.log(cod)
 
  res.render('cliente/detalleT',{pd,persona,cod,totales});
});
 
module.exports = router;