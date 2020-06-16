const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const pool = require('../../Model/bd');

const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const helpers = require('../lib/helpers');

router.get('/registro', (req, res) => {
  res.render('registro');
});

router.post('/registro', async (req, res) => {
  const { correo, password, nombre, apellido, date, rol } = req.body;
 
  const password_encrip = await helpers.encryptPassword(password);
  const exist= await pool.query('select * from tbladmin_users where correo=?', [correo])
  if (exist.length>0)
  {
    console.log('here')
    req.flash('errorMessage', 'El empleado no pudo ser registrado.');

    req.flash('errorMessage', 'El Correo que usted intenta utilizar ya esta en uso.');

    res.redirect('/admin/usuario');
 
  }else{
    console.log('i here')
    console.log(password_encrip);
    // Saving in the Database
    await pool.query('INSERT INTO tbladmin_users(correo,password) value(?,?) ', [correo, password_encrip]);
    const id = await pool.query('select id from tbladmin_users where correo=?', [correo])
    await pool.query('insert into tbladmin_roles_users(id_role,id_user) values(?,?)', [rol, id[0].id]);
    await pool.query('insert  tblusuarios_persona(id_user,nombre, apellido,fecha_nacimiento) values(?,?,?,?)', [id[0].id, nombre, apellido, date]);
    id_p = await pool.query('select id from tblusuarios_persona where id_user=?', [id[0].id]);
    await pool.query('insert  tblusuarios_empleados(id_persona) values(?)', [id_p[0].id]);
    res.redirect('/admin/usuario')

  }

}

);


// en esta ruta se autenticara el usuario de ventas
router.post('/venta/login', async(req, res, next) => {
  const {correo,password}=req.body
  check('correo').isEmail();
  const errors = validationResult(req);
  if (errors.length > 0) {
    console.log("entre")
    req.flash('message', errors[0].msg);
    res.redirect('/');
  } else {
    // rol venta=3
    // se confirma que el usuario que se este logeando sea uno pertenecienta a ventas y tambien que el usuario exista 
    const rows = await pool.query('select *  from tbladmin_users as u inner join tbladmin_roles_users as rol on(rol.id_user=u.id) WHERE u.correo = ?', [correo]);
    console.log(rows)
    if (rows.length>0 && rows[0].id_role == 3) {

      passport.authenticate('local.signin', {
        successRedirect: '/venta/perfil',
        failureRedirect: '/login/ventas',
        failureFlash: true
      })(req, res, next);
    } else {
      res.redirect('/venta/login');


    }

  }

});

router.post('/admin/login', async(req, res, next) => {
  const {correo,password}=req.body
  console.log(req.body)
  console.log(correo)
  check('correo').isEmail();
  const errors = validationResult(req);
  if (errors.length > 0) {
    console.log("entre")
    req.flash('message', errors[0].msg);
    res.redirect('/');
  } else {
    // rol venta=2
    // se confirma que el usuario que se este logeando sea uno pertenecienta a ventas y tambien que el usuario exista 
    const rows = await pool.query('select *  from tbladmin_users as u inner join tbladmin_roles_users as rol on(rol.id_user=u.id) WHERE u.correo = ?', [correo]);
    console.log(rows)
    if (rows.length>0 && rows[0].id_role == 2) {

      passport.authenticate('local.signin', {
        successRedirect: '/admin/perfil',
        failureRedirect: '/',
        failureFlash: true
      })(req, res, next);
    } else {
      res.redirect('/admin/login');

    }

  }

});


//Inventario
router.post('/inventario/login', async(req, res, next) => {
  const {correo,password}=req.body
  console.log(req.body)
  console.log(correo)
  check('correo').isEmail();
  const errors = validationResult(req);
  if (errors.length > 0) {
    console.log("entre")
    req.flash('message', errors[0].msg);
    res.redirect('/');
  } else {
    // rol inventario 4
    // se confirma que el usuario que se este logeando sea uno pertenecienta a ventas y tambien que el usuario exista 
    const rows = await pool.query('select *  from tbladmin_users as u inner join tbladmin_roles_users as rol on(rol.id_user=u.id) WHERE u.correo = ?', [correo]);
    console.log(rows)
    if (rows.length>0 && rows[0].id_role == 4) {

      passport.authenticate('local.signin', {
        successRedirect: '/inventario/perfil',
        failureRedirect: '/',
        failureFlash: true
      })(req, res, next);
    } else {
      res.redirect('/inventario/login');
    }

  }

});

router.get('/venta/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

router.get('/admin/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});
router.get('/inventario/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});


router.get('/venta/perfil', isLoggedIn, async (req, res) => {
  
  //Total Pedidos Pendientes
  const tpp = await pool.query('select count(id) as totalPedido from tblpedido_pedido_cliente where id_estado=6');
  //Total de ventas
  const tv = await pool.query('select sum(tfp.total) as tventas from tblventa_factura_cliente as tfc  inner join tblventa_factura_pago as tfp on(tfp.cod_factura=tfc.id) where tfc.estado=0 ');
  //Clientes Registrados
  const tc = await pool.query('select count(id) as total from tblusuarios_clientes');

  //Tipo de cambio
  const tca = await pool.query('select valor  from tbladmin_taza_cambio order by Creado desc limit 1');

  const prod = await pool.query('select bc.id_producto,p.imagen,p.nombre, count(bc.id_producto) as suma from tblcarro_bolsa_cliente as bc INNER JOIN tblinv_producto as p on(bc.id_producto=p.id) group by bc.id_producto,p.imagen,p.nombre order by suma desc limit 1 ')
  
  res.render('venta/index',{tc, tpp, tv, prod, tca} );
});


router.get('/admin/perfil', isLoggedIn, async (req, res) => {
  console.log(req)
  //Total Pedidos Pendientes
  const tpp = await pool.query('select count(id) as n from tbladmin_users');
  //Total de ventas
  const tv = await pool.query('select sum(tfp.total) as tventas from tblventa_factura_cliente as tfc  inner join tblventa_factura_pago as tfp on(tfp.cod_factura=tfc.id) where tfc.estado=0 ');
  //Clientes Registrados
  const tc = await pool.query('select valor from tbladmin_taza_cambio order by fecha desc limit 1');

  //Tipo de cambio
  const tca = await pool.query('select valor  from tbladmin_taza_cambio order by Creado desc limit 1');

  const prod = await pool.query('select bc.id_producto,p.imagen,p.nombre, count(bc.id_producto) as suma from tblcarro_bolsa_cliente as bc INNER JOIN tblinv_producto as p on(bc.id_producto=p.id) group by bc.id_producto,p.imagen,p.nombre order by suma desc limit 1 ')
  
  res.render('admin/index',{tc, tpp, tv, prod, tca} );
});

router.get('/inventario/perfil', isLoggedIn, async (req, res) => {
  console.log(req)
  //Total Pedidos Pendientes
  const tpp = await pool.query('select count(id) as totalPedido from tblpedido_pedido_cliente where id_estado=6');
  //Total de ventas
  const tv = await pool.query('select sum(tfp.total) as tventas from tblventa_factura_cliente as tfc  inner join tblventa_factura_pago as tfp on(tfp.cod_factura=tfc.id) where tfc.estado=0 ');
  //Clientes Registrados
  const tc = await pool.query('select count(id) as total from tblusuarios_clientes');

  //Tipo de cambio
  const tca = await pool.query('select valor  from tbladmin_taza_cambio order by Creado desc limit 1');

  const prod = await pool.query('select bc.id_producto,p.imagen,p.nombre, count(bc.id_producto) as suma from tblcarro_bolsa_cliente as bc INNER JOIN tblinv_producto as p on(bc.id_producto=p.id) group by bc.id_producto,p.imagen,p.nombre order by suma desc limit 1 ')
  
  res.render('inventario/index',{tc, tpp, tv, prod, tca} );
});


module.exports = router;