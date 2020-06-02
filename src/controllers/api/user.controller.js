// este es un controlador para los pedidos
const userCTRL = {};
//aca se manda a llamar la bd 
const pool = require('../../../Model/bd');
const passport = require("passport");

//metodo logpar autenticar
userCTRL.LogIn = async (req, res, next) => {
    console.log('im here')
    passport.authenticate("local.signin", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('An Error occurred')
                return next(error);
            }
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error)
                //We don't want to store the sensitive information such as the
                //user password in the token so we pick only the email and id
              
                 const data = await pool.query('select tu.id as id, tp.nombre, tp.apellido,tp.fecha_nacimiento,trd.modelo_carro,trd.placa,trd.color from tbladmin_users as tu inner join tblusuarios_persona as tp on (tp.id_user=tu.id) inner join tblusuarios_repartidor as tr on(tr.id_persona=tp.id) inner join tblusuarios_repartidor_detalle as trd on(trd.id_repartidor=tr.id)WHERE tu.id = ?', [ user.id]);

                //Send back the token to the user
                return res.json(data);
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
};

//Si el login es exitoso uso este metodo
userCTRL.signinSuccess = async (req, res) => {
    console.log('im here in sucesss ');
    console.log(req.user);
    const data = await pool.query('select tu.id as id, tp.nombre, tp.apellido,tp.fecha_nacimiento,trd.modelo_carro,trd.placa,trd.color from tbladmin_users as tu inner join tblusuarios_persona as tp on (tp.id_user=tu.id) inner join tblusuarios_repartidor as tr on(tr.id_persona=tp.id) inner join tblusuarios_repartidor_detalle as trd on(trd.id_repartidor=tr.id)WHERE tu.id = ?', [req.user.id]);
    res.status(200).json(data)
};

// si el login falla se ejecuta este metodo

userCTRL.signinFailure = async (req, res) => {
    res.status(500).json({ message: 'Datos Incorrectos, Favor verifique nuevamente' })
};

//Metodo para destruir la session
userCTRL.logOut = async (req, res) => {
    req.logOut();
    res.status(200).json({ message: 'Sesion Finalizada' })
};
module.exports = userCTRL;
