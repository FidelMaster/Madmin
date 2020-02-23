const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const pool = require('../../Model/bd');

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');


router.get('/registro', (req, res) => {
    res.render('auth/registro');
  });

router.post('/registro', passport.authenticate('local.signup', {
    successRedirect: '/persona',
    failureRedirect: '/registro',
    failureFlash: true
}));

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
    res.redirect('/login');
  });

router.get('/perfil', isLoggedIn, async(req, res) => {
  //Total Pedidos Pendientes
  const tpp=await pool.query('select count(id) as totalPedido from pedido_cliente');
  //Total de ventas
  const tv= await pool.query('select sum(total) as tventas from venta_cliente_total');
  //Clientes Registrados
  const tc = await pool.query('select count(id) as total from cliente');

  //Cliente mas frecuente
  const cf= await pool.query('SELECT p.nombre as nombre,p.apellido as apellido,p.celular as celular,cr.correo as correo, COUNT(idCliente ) as totCliente FROM venta_cliente as vc inner join cliente as c on(vc.idCliente=c.id) inner join persona as p on(c.idPersona=p.id) inner join credenciales as cr on(p.id_Credencial=cr.id) GROUP BY nombre,apellido,celular,correo ORDER BY totCliente DESC limit 1');
  console.log(cf);
  //pedidos mas recientes
  const ped= await pool.query('SELECT pc.id,ep.color,ep.porcentaje,pc.codVenta,p.nombre,vct.total,ep.estado , pro.imagen FROM pedido_cliente as pc inner join cliente as c on(pc.idCliente=c.id) inner join persona  as p on(c.idPersona=p.id) inner join venta_cliente_total as vct  on(pc.codVenta=vct.codVenta)inner join estado_pedido as ep on(pc.idEstado=ep.id)inner join bolsa_compra_cliente as bc on(pc.codVenta=bc.codVenta) inner join producto as pro on(bc.idProducto=pro.id) where pc.idEstado=4 GROUP BY pc.fecha desc LIMIT 1');
  // producto mas popular
  const prod= await pool.query('select p.id,p.imagen,p.nombre, Sum(bc.cantidad) as suma from bolsa_compra_cliente as bc INNER JOIN producto as p on(bc.idProducto=p.id) group by p.id,bc.cantidad order by suma desc limit 1')
  res.render('index', { tc,tpp,tv,cf,ped,prod});
});

module.exports = router;