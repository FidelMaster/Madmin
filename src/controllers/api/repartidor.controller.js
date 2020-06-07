// este es un controlador para los pedidos
const pedidoCTRL = {};
//aca se manda a llamar la bd 
const pool = require('../../../Model/bd');


//this method i use for list all orders relation for deliver 
pedidoCTRL.allPedido = async (req, res) => {
    const { id } = req.params;
    const data= await pool.query('select tpr.cod_pedido,tfp.cod_factura, concat(tp.nombre," ",tp.apellido) as nombre,tp.codigoPostal,tp.direccion, date_format(tbc.fecha, "%d-%m-%Y") as fecha,tfp.total  from tblpedido_pedido_repartidor as tpr inner join tblpedido_pedido_cliente as tbc on(tpr.cod_pedido=tbc.id)  inner join tbladmin_users as tau on(tbc.id_user=tau.id) inner join tblusuarios_persona  as tp on(tp.id_user=tau.id)  inner join tblventa_factura_pago as tfp on(tbc.cod_factura=tfp.cod_factura) WHERE  tpr.cod_repartidor = ?', [id]);
    res.status(200).json(data)
};

//Este metodo sera utilizado para ver el detalle del pedido
pedidoCTRL.showPedido = async (req, res) => {
    // this is invoice id 
    const { id } = req.params;
    const client = await pool.query('select concat(tp.nombre, " ",tp.apellido) as nombre,tp.ciudad, tp.direccion, tuc.telefono,tuc.celular from tblpedido_pedido_cliente as pc inner join tblusuarios_persona tp on(pc.id_user=tp.id_user) inner join tblusuarios_clientes as tuc on(tuc.id_persona=tp.id) where pc.cod_factura=?', [id]);
    const product= await pool.query('select p.codproducto,p.nombre,fdc.cantidad,till.nombre as talla from tblpedido_pedido_cliente as pc inner join tblventa_factura_detalle as fdc on(pc.cod_factura=fdc.cod_factura) inner join tblinv_producto as p on(fdc.id_producto=p.id) inner join tblinv_talla_producto as til on(til.id_producto=p.id) right join tblinv_tallas as till on(til.id_talla=till.id)  where pc.cod_factura=?', [id])
    const payment =await pool.query('select subtotal,tax,total from tblventa_factura_pago where cod_factura=? ',[id])
    res.status(200).json({client,product,payment})
};


//Este Metodo se utilizara para actualizar  el pedido 
pedidoCTRL.updatePedido = async (req, res) => {
    const { id } = req.params;
    const datos= await pool.query('select id_producto,cantidad,id_talla from tblventa_factura_detalle where cod_factura=?',[id])
    for (let index = 0; index < datos.length; index++) {
        await pool.query('update tblinv_inventario set existencias=existencias-? where id_producto=? and id_tallas=?',[datos[index].cantidad,datos[index].id_producto,datos[index].id_talla])
    }
    await pool.query('update tblpedido_pedido_cliente set id_estado=8 where cod_factura=?', [id]);
    res.status(200).send(res.json({ message: 'ok' }))
};
module.exports = pedidoCTRL;
