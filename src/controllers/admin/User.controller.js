// this controll is use for control users
let UserCTRL = {};
//aca se manda a llamar la bd 
let pool = require('../../../Model/bd');

// Only get Methods
 UserCTRL.AllUser = async (req, res) => {
    let id = req.user.id;
    let rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
    if (rol[0].id == 2) {
      let p = await pool.query('select concat("US-",te.id) as id,tp.nombre,tp.apellido,tu.correo, date_format(tp.fecha_nacimiento, "%d-%m-%Y") as fecha,tr.nombre as rol from tblusuarios_empleados as te inner join tblusuarios_persona tp on(te.id_persona=tp.id) inner join tbladmin_users as tu on(tp.id_user=tu.id) inner join  	tbladmin_roles_users  as tru on(tru.id_user=tu.id) inner join  	tbladmin_roles as tr on(tru.id_role=tr.id)')
      let roles = await pool.query('select id,nombre from tbladmin_roles');
      res.render('admin/registro/index', { p, roles });
    } else {
      res.redirect('/perfil');
    }
  
  }
  UserCTRL.AllDeliver =async (req, res) => {
    let id = req.user.id;
    let rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
    if (rol[0].id == 2) {
       let option = await pool.query('select p.id,concat(p.nombre," ",p.apellido) as nombre from tblusuarios_persona as p inner join tbladmin_users as u on(p.id_user=u.id) inner join tbladmin_roles_users as tru on(tru.id_user=u.id) where tru.id_role=5')
  
      let p = await pool.query('select p.id,p.nombre,p.apellido,u.correo,tr.cedula,tr.celular, date_format(p.fecha_nacimiento, "%d-%m-%Y") as fecha from tblusuarios_repartidor as tr inner join tblusuarios_persona as p on(tr.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id)')
  
      let roles = await pool.query('select id,nombre from tbladmin_roles');
      res.render('admin/repartidores/index', { p, roles, option });
    } else {
      res.redirect('/perfil');
    }
  
  }

  UserCTRL.AllCars=async (req, res) => {
    let id = req.user.id;
    let rol = await pool.query('select id_role as id from tbladmin_roles_users where id_user=?', [id]);
    if (rol[0].id == 2) {
      let option = await pool.query('select tur.id,concat(p.nombre," ",p.apellido) as nombre from tblusuarios_repartidor as tur inner join  tblusuarios_persona as p on (tur.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id) inner join tbladmin_roles_users as tru on(tru.id_user=u.id) where tru.id_role=5')
      let p = await pool.query('select p.id,p.nombre,p.apellido,modelo_carro, color, placa from tblusuarios_repartidor_detalle as trd inner join tblusuarios_repartidor as tr on(trd.id_repartidor=tr.id) inner join tblusuarios_persona as p on(tr.id_persona=p.id) inner join tbladmin_users as u on(p.id_user=u.id)')
      let roles = await pool.query('select id,nombre from tbladmin_roles');
      res.render('admin/vehiculo/index', { p, roles, option });
    } else {
      res.redirect('/perfil');
    }
  
  }
//End

//Post
 UserCTRL.PostDeliver=async (req, res) => {
    let { usuario, cedula, celular } = req.body;
    // Saving in the Database
    await pool.query('INSERT INTO tblusuarios_repartidor(id_persona,cedula,celular) value(?,?,?) ', [usuario, cedula, celular]);
    res.redirect('/admin/usuario/repartidor')
  }

  UserCTRL.PostCar=async (req, res) => {
    let { usuario, modelo, color, placa } = req.body;
    // Saving in the Database
    await pool.query('INSERT INTO tblusuarios_repartidor_detalle(id_repartidor,modelo_carro,color,placa) value(?,?,?,?) ', [usuario, modelo, color, placa]);
    res.redirect('/admin/usuario/vehiculo')
  
  }


// End



module.exports=UserCTRL;