const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const puppeteer = require('puppeteer');
const pool = require('../../Model/bd');
const path = require('path');
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const handlebars = require("handlebars");
const fs = require("fs");

 router.get('/tiposU',async (req, res) => {
     const t = await pool.query('select * from tipousuario')
    res.render('secciones/tiposU',{t});
  });
  
 router.get('/pedidos',async (req, res) => {
    const pe = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)')
   res.render('cliente/pedidos',{pe});
 });


 router.get('/pedidos/pendientes',async (req, res) => {
  const peP = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id) where pc.idEstado=4')
 res.render('cliente/pedidosP',{peP});
});
router.get('/pedidos/reparto',async (req, res) => {
  const per = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id) where pc.idEstado=2')
 res.render('cliente/pedidosR',{per});
});
router.get('/pedidos/transito',async (req, res) => {
  const peT = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id) where pc.idEstado=1')
 res.render('cliente/pedidosT',{peT});
});
router.get('/pedidos/entregados',async (req, res) => {
  const peE = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id) where pc.idEstado=3')
 res.render('cliente/pedidosE',{peE});
});

  router.get('/usuario',async (req, res) => {
    const p = await pool.query('select e.id, cr.correo as correo, p.nombre as nombre,p.apellido as apellido,p.celular,tu.tipo as tipo from empleado as e inner join persona as p on(e.idPersona=p.id) inner join credenciales as cr on(p.id_Credencial=cr.id) inner join tipousuario as tu on(cr.idtipo=tu.id)')
   res.render('secciones/usuarios',{p});
 });
 router.get('/clientes',async (req, res) => {
    const c = await pool.query('select e.id,cr.correo as correo, p.nombre as nombre,p.apellido as apellido,p.celular from cliente as e inner join persona as p on(e.idPersona=p.id) inner join credenciales as cr on(p.id_Credencial=cr.id) where cr.idtipo=3',)
   res.render('cliente/registro',{c});
 });
 router.get('/producto/camisas',async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=1');
   res.render('secciones/camisas',{p});
 });

 router.get('/producto/pantalones',async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=2');
   res.render('secciones/pantalones',{p});
 });
 router.get('/producto/gorras',async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=3');
   res.render('secciones/gorras',{p});
 });
 router.get('/producto/zapatos',async (req, res) => {
    const p = await pool.query('select p.id,p.imagen,p.nombre,mar.marca,mat.material from  producto as p  inner join marca as mar on(p.idMarca=mar.id) inner join material as mat on(p.idMaterial=mat.id) where p.idCategoria=4');
   res.render('secciones/zapatos',{p});
 });
 router.get('/inventario',async (req, res) => {
    const i = await pool.query('select i.id,p.id as cod,p.imagen,p.nombre,i.existencia,i.fecha,i.costo from inventario as i inner join producto as p  on(i.idProducto=p.id) ');
   res.render('secciones/inventario',{i});
 });
 router.get('/reporte/ventas',async (req, res) => {
  //const i = await pool.query('select i.id,p.imagen,p.nombre,i.existencia,i.fecha,i.costo from inventario as i inner join producto as p  on(i.idProducto=p.id) ');
  const totales= await pool.query('select * from venta_cliente_total ');
 
  res.render('reportes/reporte_ventas',{totales});
});
router.get('/reporte/reporte_inventario', async(req,res)=>{
  const inv =await pool.query('select i.idProducto,p.imagen,p.nombre,ca.nombre as categoria,i.existencia,i.costo,i.existencia*i.costo as CostoTotal from inventario as i inner join producto as p on(i.idProducto=p.id) inner join categoria as ca on(p.idCategoria=ca.id)');
  const t = await pool.query('SELECT sum(i.existencia*i.costo) as total FROM inventario as i');
  
  res.render('reportes/reporte_inventario',{inv,t});
});

router.get('/Recibir/Pedido/:id',async(req,res)=>{
  const { id } = req.params;
    await pool.query('update pedido_cliente set idEstado=2 where codVenta=?',[id]);
    res.redirect('/pedidos');
});
router.get('/Recibir/Transito/:id',async(req,res)=>{
  const { id } = req.params;
    await pool.query('update pedido_cliente set idEstado=1 where codVenta=?',[id]);
    res.redirect('/pedidos');
});

router.get('/pedido/:id',async (req, res) => {
  const { id } = req.params;
  const pd = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,pro.nombre,vct.total,ep.estado , pro.imagen,p.celular , pc.fecha,bc.cantidad,promp.precio FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id) inner join venta_cliente_total as vct on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)inner join bolsa_compra_cliente as bc on(pc.codVenta=bc.codVenta) inner join producto as pro on(bc.idProducto=pro.id) inner join promociones_producto as promp on(promp.idProducto=pro.id) where bc.codVenta=?', [id]);
   
  const persona = await pool.query('SELECT p.nombre,p.apellido,p.celular ,pc.fecha FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id)  where pc.codVenta=?', [id])

   const cod = await pool.query('select * from pedido_cliente where codVenta=?',[id]);
   const totales= await pool.query('select * from venta_cliente_total where codVenta=?',[id]);

  console.log(cod)
 
  res.render('cliente/detalle',{pd,persona,cod,totales});
});



router.get('/mensajes',async (req, res) => {
  
 const m= await pool.query('select * from contacto');
  res.render('Mensaje/Mensajes',{m});
});
 

router.get('/pedido/transito/:id',async (req, res) => {
  const { id } = req.params;
  const pd = await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,pro.nombre,vct.total,ep.estado , pro.imagen,p.celular , pc.fecha,bc.cantidad,promp.precio FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id) inner join venta_cliente_total as vct on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)inner join bolsa_compra_cliente as bc on(pc.codVenta=bc.codVenta) inner join producto as pro on(bc.idProducto=pro.id) inner join promociones_producto as promp on(promp.idProducto=pro.id) where bc.codVenta=?', [id]);
   
  const persona = await pool.query('SELECT p.nombre,p.apellido,p.celular ,pc.fecha FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id)  where pc.codVenta=?', [id])

   const cod = await pool.query('select * from pedido_cliente where codVenta=?',[id]);
   const totales= await pool.query('select * from venta_cliente_total where codVenta=?',[id]);

  console.log(cod)
 
  res.render('cliente/detalleT',{pd,persona,cod,totales});
});
 
module.exports = router;