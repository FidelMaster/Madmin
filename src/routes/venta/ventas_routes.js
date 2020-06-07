const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const puppeteer = require('puppeteer');
const pool = require('../../../Model/bd');
const { isLoggedIn } = require('../../lib/auth');

const handlebars = require("handlebars");
const fs = require("fs");
const multer = require('multer');


router.get('/venta/clientes', isLoggedIn, async (req, res) => {
    const id = req.user.id;
    const rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
    if (rol[0].id == 3) {
        const c = await pool.query('select tuc.id,tu.correo,tup.nombre,tup.apellido,tup.fecha_nacimiento,tuc.celular,tuc.telefono from tblusuarios_clientes as  tuc inner join tblusuarios_persona as tup on(tuc.id_persona=tup.id) inner join tbladmin_users as tu on(tup.id_user=tu.id)');
        res.render('venta/cliente/index', { c });
    } else {
        res.redirect('/venta/perfil')
    }
});

router.get('/venta/mensajes', isLoggedIn, async (req, res) => {
    const id = req.user.id;
    const rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
    if (rol[0].id == 3) {
        const m = await pool.query('select * from tblinbox_mensaje');
        res.render('venta/mensaje/index', { m });
    } else {
        res.redirect('/venta/perfil')
    }
});

router.get('/ventas/reportes/ventas_producto', isLoggedIn, async (req, res) => {
    res.render('venta/reportes/reporte_producto');
});

router.get('/ventas/reportes/resumen_venta', isLoggedIn, async (req, res) => {
     res.render('venta/reportes/reporte_ventas');
});
router.get('/ventas/data/:fecha_i/:fecha_f', async (req, res) => {
    const {fecha_i,fecha_f} =req.params
  
    const datas =await pool.query('SELECT fecha,sum(total) as monto FROM tblventa_factura_pago where fecha between ? and ?   group by fecha order by fecha', [fecha_i.toString(),fecha_f.toString()]);
   

    res.render('venta/reportes/data_resume',{datas});
});


router.get('/ventas/data/product/:fecha_i/:fecha_f', async (req, res) => {
    const {fecha_i,fecha_f} =req.params
  
    const datas =await pool.query('SELECT tp.codproducto as codigo,tp.nombre,count(id_producto) as cantidad FROM mombashop.tblventa_factura_detalle as td inner join tblinv_producto as tp on(td.id_producto=tp.id) where td.fecha between ? and ? group by id_producto', [fecha_i.toString(),fecha_f.toString()]);
   
    res.render('venta/reportes/data_resume',{datas});
});

router.post('/ventas/resumen', isLoggedIn, async (req, res) => {
    const { fecha_inicio,fecha_fin } = req.body;
    // aca generamos el reporte en pdf 
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('http://localhost:4000/ventas/data/'+fecha_inicio+'/'+fecha_fin+'')
        const buffer = await page.pdf({format: 'A4',landscape: true})
        res.type('application/pdf')
        res.send(buffer)
        browser.close()
    })()

});

router.post('/ventas/product/resumen', isLoggedIn, async (req, res) => {
    const { fecha_inicio,fecha_fin } = req.body;
    // aca generamos el reporte en pdf 
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('http://localhost:4000/ventas/data/product/'+fecha_inicio+'/'+fecha_fin+'')
        const buffer = await page.pdf({format: 'A4',landscape: true})
        res.type('application/pdf')
        res.send(buffer)
        browser.close()
    })()

});


router.get('/pedidos/pendientes', isLoggedIn, async (req, res) => {
    const id = req.user.id;
    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=6')
    res.render('venta/pedidos/pedidosP', { pe });


});
router.get('/pedidos/reparto', isLoggedIn, async (req, res) => {
    const id = req.user.id;

    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=2')
    res.render('venta/pedidos/pedidosR', { pe });

});
router.get('/pedidos/transito', isLoggedIn, async (req, res) => {
    const id = req.user.id;

    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=1')
    res.render('venta/pedidos/pedidosT', { pe });

});
router.get('/pedidos/entregados', isLoggedIn, async (req, res) => {
    const id = req.user.id;

    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id) where pc.id_estado=8')
    res.render('venta/pedidos/pedidosE', { pe });

});

router.get('/pedido/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const estado = await pool.query('select pe.id, pe.estado as nombre from tblpedido_pedido_cliente pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) where cod_factura=?', [id]);
    const pd = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) inner join tblventa_factura_detalle  as fdc on(pc.cod_factura=fdc.cod_factura) inner join tblinv_producto as p on(fdc.id_producto=p.id) where pc.cod_factura=?', [id]);
    const persona = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblusuarios_persona tp on(pc.id_user=tp.id_user) inner join tblusuarios_clientes as tuc on(tuc.id_persona=tp.id) where pc.cod_factura=?', [id])
    const cod = await pool.query('select * from tblpedido_pedido_cliente where cod_factura=?', [id]);
    const totales = await pool.query('select * from tblventa_factura_pago where cod_factura=?', [id]);



    res.render('venta/pedidos/detalle', { pd, persona, cod, totales, estado });
});


router.get('/pedido/transito/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const estado = await pool.query('select pe.id, pe.estado as nombre from tblpedido_pedido_cliente pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) where cod_factura=?', [id]);
    const pd = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) inner join tblventa_factura_detalle  as fdc on(pc.cod_factura=fdc.cod_factura) inner join tblinv_producto as p on(fdc.id_producto=p.id) where pc.cod_factura=?', [id]);
    const persona = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblusuarios_persona tp on(pc.id_user=tp.id_user) inner join tblusuarios_clientes as tuc on(tuc.id_persona=tp.id) where pc.cod_factura=?', [id])
    const cod = await pool.query('select * from tblpedido_pedido_cliente where cod_factura=?', [id]);
    const totales = await pool.query('select * from tblventa_factura_pago where cod_factura=?', [id]);
    const repartidor= await pool.query('select concat(tp.nombre, " ", tp.apellido) as nombre, trd.modelo_carro,trd.color,trd.placa from tblpedido_pedido_repartidor as tppr inner join tblusuarios_repartidor as tur on(tppr.cod_repartidor=tur.id) inner join tblusuarios_persona as tp on(tur.id_persona=tp.id) inner join tblusuarios_repartidor_detalle as trd on(tppr.cod_repartidor=trd.id_repartidor) where tppr.cod_pedido=? ', [id]);
    


    res.render('venta/pedidos/detalletransito', { pd, persona, cod, totales, estado,repartidor });
});


router.get('/pedido/reparto/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const estado = await pool.query('select pe.id, pe.estado as nombre from tblpedido_pedido_cliente pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) where cod_factura=?', [id]);
    const pd = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblpedido_estado as pe on(pc.id_estado=pe.id) inner join tblventa_factura_detalle  as fdc on(pc.cod_factura=fdc.cod_factura) inner join tblinv_producto as p on(fdc.id_producto=p.id) where pc.cod_factura=?', [id]);
    const persona = await pool.query('select * from tblpedido_pedido_cliente as pc inner join tblusuarios_persona tp on(pc.id_user=tp.id_user) inner join tblusuarios_clientes as tuc on(tuc.id_persona=tp.id) where pc.cod_factura=?', [id])
    const cod = await pool.query('select * from tblpedido_pedido_cliente where cod_factura=?', [id]);
    const totales = await pool.query('select * from tblventa_factura_pago where cod_factura=?', [id]);
    const r = await pool.query('select tr.id, concat(p.nombre," ",p.apellido) as nombre from tblusuarios_repartidor as tr inner join tblusuarios_persona as p on(tr.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id)')
 

    res.render('venta/pedidos/detalleT', { pd, persona, cod, totales, estado,r });
});





router.get('/pedidos', isLoggedIn, async (req, res) => {
    const id = req.user.id;

    const pe = await pool.query('SELECT pc.id,pc.cod_factura,vf.total, pe.porcentaje ,pe.color ,pe.estado FROM tblpedido_pedido_cliente as pc  inner join tblventa_factura_pago as vf  on(pc.cod_factura=vf.cod_factura) inner join tblpedido_estado as pe  on(pc.id_estado=pe.id)')
    res.render('venta/pedidos/pedidos', { pe });

});

router.get('/Recibir/Pedido/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await pool.query('update tblpedido_pedido_cliente set id_estado=2 where cod_factura=?', [id]);
    res.redirect('/pedidos');
});

router.post('/enviar/Transito/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const {id_persona}=req.body;
    console.log(req.body)

    await pool.query('insert tblpedido_pedido_repartidor(cod_pedido,cod_repartidor,fecha)  values(?,?,now())', [id,id_persona]);
    await pool.query('update tblpedido_pedido_cliente set id_estado=1 where cod_factura=?', [id]);
    res.redirect('/pedidos');
});


router.post('/entregar/Transito/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const datos= await pool.query('select id_producto,cantidad,id_talla from tblventa_factura_detalle where cod_factura=?',[id])
    for (let index = 0; index < datos.length; index++) {
        await pool.query('update tblinv_inventario set existencias=existencias-? where id_producto=? and id_tallas=?',[datos[index].cantidad,datos[index].id_producto,datos[index].id_talla])
    }
    await pool.query('update tblpedido_pedido_cliente set id_estado=8 where cod_factura=?', [id]);
    res.redirect('/pedidos');
});


module.exports = router;