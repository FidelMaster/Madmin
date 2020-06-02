const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../../Model/bd');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'correo',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, correo, clave, done) => {
 
  
  const rows = await pool.query('select  u.id,u.correo ,u.password from tbladmin_users as u inner join tbladmin_roles_users as rol on(rol.id_user=u.id) WHERE u.correo = ? and rol.id_role in (2,3,4,5)', [correo]);
  if (rows.length > 0) {
    const user = rows[0];
     
    const validPassword = await helpers.matchPassword(clave, user.password)
    console.log(validPassword);
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.correo));
    
    } else {
      console.log("esta mal");
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'correo',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, correo, password, done) => {

 
 
  newUser.id = result.insertId;
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('select * from tbladmin_users where id = ?', [id]);
  done(null, rows[0]);
});