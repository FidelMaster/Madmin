const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const pool = require('../../Model/bd');

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const helpers = require('../lib/helpers');

router.get('/registro', (req, res) => {
    res.render('registro');
  });

router.post('/registro',  async(req,res)=>{
  const {correo,password,nombre, apellido, date,rol} = req.body;
   console.log(req.body);
  console.log('Im here');
 
  const password_encrip= await helpers.encryptPassword(password);
  console.log(password_encrip);
  // Saving in the Database
  await pool.query('INSERT INTO tbladmin_users(correo,password) value(?,?) ', [correo,password_encrip]);
  const id= await pool.query('select id from tbladmin_users where correo=?',[correo])
  await pool.query('insert into tbladmin_roles_users(id_role,id_user) values(?,?)',[rol,id[0].id]);
  await pool.query('insert  tblusuarios_persona(id_user,nombre, apellido,fecha_nacimiento) values(?,?,?,?)', [id[0].id, nombre, apellido, date]);
  id_p= await pool.query('select id from tblusuarios_persona where id_user=?', [id[0].id]);
  await pool.query('insert  tblusuarios_empleados(id_persona) values(?)', [id_p[0].id]);
  res.redirect('/usuario')

}

);

// SINGIN
router.get('/login', (req, res) => {
    res.render('login');
  });
  
  router.post('/login', (req, res, next) => {
    console.log(req.body)
      check('correo').isEmail();
    const errors = validationResult(req);
    if (errors.length > 0) {
      console.log("entre")
      req.flash('message', errors[0].msg);
      res.redirect('/');
    }
    passport.authenticate('local.signin', {
      successRedirect: '/perfil',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  });

  router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
  });

router.get('/perfil', isLoggedIn, async(req, res) => {
  console.log(req)
  //Total Pedidos Pendientes
  const tpp=await pool.query('select count(id) as totalPedido from tblpedido_pedido_cliente where id_estado=6');
  //Total de ventas
  const tv= await pool.query('select sum(tfp.total) as tventas from tblventa_factura_cliente as tfc  inner join tblventa_factura_pago as tfp on(tfp.cod_factura=tfc.id) where tfc.estado=0 ');
  //Clientes Registrados
  const tc = await pool.query('select count(id) as total from tblusuarios_clientes');

  //Tipo de cambio
  const tca = await pool.query('select valor  from tbladmin_taza_cambio order by Creado desc limit 1');

  //Cliente mas frecuente
 // const cf= await pool.query('SELECT p.nombre as nombre,p.apellido as apellido,p.celular as celular,cr.correo as correo, COUNT(idCliente ) as totCliente FROM venta_cliente as vc inner join cliente as c on(vc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id) inner join credenciales as cr on(p.id_Credencial=cr.id) GROUP BY nombre,apellido,celular,correo ORDER BY totCliente DESC limit 1');
  //console.log(cf);
  //pedidos mas recientes
 // const ped= await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado , pro.imagen FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)inner join bolsa_compra_cliente as bc on(pc.codVenta=bc.codVenta) inner join producto as pro on(bc.idProducto=pro.id) where pc.idEstado=4 GROUP BY pc.fecha desc LIMIT 1');
  // producto mas popular
   const prod= await pool.query('select bc.id_producto,p.imagen,p.nombre, count(bc.id_producto) as suma from tblcarro_bolsa_cliente as bc INNER JOIN tblinv_producto as p on(bc.id_producto=p.id) group by bc.id_producto,p.imagen,p.nombre order by suma desc limit 1 ')
  res.render('index', { tc,tpp,tv,prod,tca});
});

module.exports = router;