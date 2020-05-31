// este es un controlador para los pedidos
const userCTRL = {};
//aca se manda a llamar la bd 
const pool = require('../../../Model/bd');
const passport = require("passport");

//metodo par autenticar
userCTRL.signIn = passport.authenticate("local", {
    successRedirect: "/api/user/authenticate",
    failureRedirect: "/api/user/authenticate/failure",
    failureFlash: true
});

//Si el login es exitoso uso este metodo
userCTRL.signinSuccess = async (req, res) => {
    const data = await pool.query('select tu.id as id, tp.nombre, tp.apellido,tp.fecha_nacimiento,trd.modelo_carro,trd.placa,trd.color from tbladmin_users as tu inner join tblusuarios_persona as tp on (tp.id_user=tu.id) inner join tblusuarios_repartidor as tr on(tr.id_persona=tp.id) inner join tblusuarios_repartidor_detalle as trd on(trd.id_repartidor=tr.id)WHERE tu.id = ?', [req.user.id]);
    res.status(200).send(res.json(data))
};

// si el login falla se ejecuta este metodo

userCTRL.signinFailure = async (req, res) => {
       res.status(500).send(res.json({message: 'Datos Incorrectos, Favor verifique nuevamente'}))
};

//Metodo para destruir la session
userCTRL.logOut = async (req, res) => {
    req.logOut();
    res.status(200).send(res.json({message: 'Sesion Finalizada'}))
};
module.exports = userCTRL;