// este es un controlador para los pedidos
const pedidoCTRL = {};
//aca se manda a llamar la bd 
const pool = require('../../../Model/bd');


//Este metodo sera utilizado para listar los pedidos que tiene asignado un repartidor 
pedidoCTRL.allPedido = async (req, res) => {
    const { id } = req.params;
    const data= await pool.query('select tpr.cod_pedido,tp.nombre,tp.apellido,tp.codigoPostal,tp.direccion,tbc.fecha,tfp.total from tblpedido_pedido_repartidor as tpr inner join tblpedido_pedido_cliente as tbc on(tpr.cod_pedido=tbc.id) inner join tbladmin_users as tau on(tbc.id_user=tau.id) inner join tblusuarios_persona  as tp on(tp.id_user=tau.id) inner join tblventa_factura_pago as tfp on(tbc.cod_factura=tfp.cod_factura)  WHERE  tpr.cod_repartidor = ?', [id]);
   console.log(data) 
    res.status(200).send(res.json(data))
};

//Este metodo sera utilizado para ver el detalle del pedido
pedidoCTRL.showPedido = async (req, res) => {
    const { id } = req.params;
    const product = await pool.query('SELECT * FROM tblproducto WHERE id = ?', [id]);
    res.status(200).send(res.json(product))
};


//Este Metodo se utilizara para actualizar  el pedido 
pedidoCTRL.updatePedido = async (req, res) => {
    const { id } = req.params;
    await pool.query('update tblpedido_pedido_cliente set id_estado=8 where cod_factura=?', [id]);
    res.status(200).send(res.json({ message: 'ok' }))
};
module.exports = pedidoCTRL;
