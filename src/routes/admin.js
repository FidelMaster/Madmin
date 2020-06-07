const express = require('express');
const router = express.Router();
const pool = require('../../Model/bd');
const { isLoggedIn } = require('../lib/auth');


router.get('/admin/tiposU', isLoggedIn, async (req, res) => {
  const t = await pool.query('select id,nombre from tbladmin_roles')
  res.render('admin/tiposU/tiposU', { t });
});

router.get('/admin/tipo/cambio', isLoggedIn, async (req, res) => {
  const t = await pool.query('select * from tbladmin_taza_cambio order by fecha desc')
  res.render('admin/charge/index', { t });
});

router.get('/admin/tipo/tallas', isLoggedIn, async (req, res) => {
  const t = await pool.query('select * from tblinv_tallas')
  res.render('admin/tallas/index', { t });
});
router.get('/admin/tipo/marca', isLoggedIn, async (req, res) => {
  const t = await pool.query('select id,nombre from tblinv_marca')
  res.render('admin/marca/index', { t });
});

router.get('/admin/tipo/telas', isLoggedIn, async (req, res) => {
  const t = await pool.query('select id,nombre from tblinv_material')
  res.render('admin/tela/index', { t });
});

router.post('/tipo/cambio/post', async (req, res) => {
  const { tipo, fecha } = req.body;


  // Saving in the Database
  await pool.query('INSERT INTO tbladmin_taza_cambio(valor,fecha) value(?,?) ', [tipo, fecha]);

  res.redirect('/admin/tipo/cambio')

});
router.post('/tipo/marca/post', async (req, res) => {
  const { tipo } = req.body;


  // Saving in the Database
  await pool.query('INSERT INTO tblinv_marca(nombre) value(?) ', [tipo]);

  res.redirect('/admin/tipo/cambio')

});
router.post('/tipo/material/post', async (req, res) => {
  const { tipo } = req.body;


  // Saving in the Database
  await pool.query('INSERT INTO tblinv_material(nombre) value(?) ', [tipo]);

  res.redirect('/admin/tela/index')

});
router.post('/tipo/talla/post', async (req, res) => {
  const { tipo } = req.body;


  // Saving in the Database
  await pool.query('INSERT INTO tblinv_tallas(nombre) value(?) ', [tipo]);

  res.redirect('/admin/tipo/cambio')

});

router.post('/registro/repartidor', async (req, res) => {
  const { usuario, cedula, celular } = req.body;


  // Saving in the Database
  await pool.query('INSERT INTO tblusuarios_repartidor(id_persona,cedula,celular) value(?,?,?) ', [usuario, cedula, celular]);

  res.redirect('/admin/usuario/repartidor')

});


router.post('/registro/vehiculo', async (req, res) => {
  const { usuario, modelo, color, placa } = req.body;
  // Saving in the Database
  await pool.query('INSERT INTO tblusuarios_repartidor_detalle(id_repartidor,modelo_carro,color,placa) value(?,?,?,?) ', [usuario, modelo, color, placa]);

  res.redirect('/admin/usuario/vehiculo')

});



router.get('/admin/usuario/repartidor', isLoggedIn, async (req, res) => {
  const id = req.user.id;
  const rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
  if (rol[0].id == 2) {
    const option = await pool.query('select p.id,concat(p.nombre," ",p.apellido) as nombre from tblusuarios_persona as p inner join tbladmin_users as u on(p.id_user=u.id) inner join tbladmin_roles_users as tru on(tru.id_user=u.id) where tru.id_role=5')

    const p = await pool.query('select p.id,p.nombre,p.apellido,u.correo,tr.cedula,tr.celular,p.fecha_nacimiento from tblusuarios_repartidor as tr inner join tblusuarios_persona as p on(tr.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id)')

    const roles = await pool.query('select id,nombre from tbladmin_roles');
    res.render('admin/repartidores/index', { p, roles, option });
  } else {
    res.redirect('/perfil');
  }

});




router.get('/admin/usuario/vehiculo', isLoggedIn, async (req, res) => {
  const id = req.user.id;
  const rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
  if (rol[0].id == 2) {

    const option = await pool.query('select tur.id,concat(p.nombre," ",p.apellido) as nombre from tblusuarios_repartidor as tur inner join  tblusuarios_persona as p on (tur.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id) inner join tbladmin_roles_users as tru on(tru.id_user=u.id) where tru.id_role=5')

    const p = await pool.query('select p.id,p.nombre,p.apellido,modelo_carro, color, placa from tblusuarios_repartidor_detalle as trd inner join tblusuarios_repartidor as tr on(trd.id_repartidor=tr.id) inner join tblusuarios_persona as p on(tr.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id)')

    const roles = await pool.query('select id,nombre from tbladmin_roles');
    res.render('admin/vehiculo/index', { p, roles, option });
  } else {
    res.redirect('/perfil');
  }

});



router.get('/admin/usuario', isLoggedIn, async (req, res) => {
  const id = req.user.id;
  const rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
  if (rol[0].id == 2) {
    const p = await pool.query('select te.id,tp.nombre,tp.apellido,tu.correo,tp.fecha_nacimiento,tr.nombre as rol from tblusuarios_empleados as te inner join tblusuarios_persona tp on(te.id_persona=tp.id) inner join tbladmin_users as tu on(tp.id_user=tu.id) inner join  	tbladmin_roles_users  as tru on(tru.id_user=tu.id) inner join  	tbladmin_roles as tr on(tru.id_role=tr.id)')
    const roles = await pool.query('select id,nombre from tbladmin_roles');
    res.render('admin/registro/index', { p, roles });
  } else {
    res.redirect('/perfil');
  }

});




router.get('/carrito/eliminar/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await pool.query('delete from tblcarro_bolsa_cliente where id=?', [id]);
  res.redirect('/carrito');
});

router.get('/reporte/ventas', isLoggedIn, async (req, res) => {
  //const i = await pool.query('select i.id,p.imagen,p.nombre,i.existencia,i.fecha,i.costo from inventario as i inner join producto as p  on(i.idProducto=p.id) ');
  const totales = await pool.query('select * from venta_cliente_total ');

  res.render('reportes/reporte_ventas', { totales });
});
router.get('/reporte/reporte_inventario', isLoggedIn, async (req, res) => {
  const inv = await pool.query('select i.idProducto,p.imagen,p.nombre,ca.nombre as categoria,i.existencia,i.costo,i.existencia*i.costo as CostoTotal from inventario as i inner join producto as p on(i.idProducto=p.id) inner join categoria as ca on(p.idCategoria=ca.id)');
  const t = await pool.query('SELECT sum(i.existencia*i.costo) as total FROM inventario as i');

  res.render('reportes/reporte_inventario', { inv, t });
});



module.exports = router;