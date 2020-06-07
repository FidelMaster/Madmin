// este es un controlador para los pedidos
const userCTRL = {};
//aca se manda a llamar la bd 
const pool = require('../../../Model/bd');
const passport = require("passport");

//method for auth
userCTRL.LogIn = async (req, res, next) => {
    console.log('im here')
    passport.authenticate("local.signin", async (err, user, info) => {
        try {
            if (err || !user) {
                const error = new Error('An Error occurred')
                return next(error);
            }
            // i will use session:false because i don't create session in server 
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error)
                  // the user object contain user information: email, password and id 
                 // only return user id
                 const data = await pool.query('select  id from tbladmin_users WHERE id = ?', [ user.id]);
                 //return data variable
                return res.json(data[0]);
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
};

//if login method is positive, in my app i will request this end point for get user information 
userCTRL.getUserByID = async (req, res) => {
    //i get id from params and after return data information
    let {id} = req.params;
    const data = await pool.query('select tr.id as id, concat(tp.nombre," ", tp.apellido) as nombre, date_format(tp.fecha_nacimiento, "%d-%m-%Y") as fecha,trd.modelo_carro as vehiculo,trd.placa,trd.color from  tblusuarios_persona as tp  inner join tblusuarios_repartidor as tr on(tr.id_persona=tp.id) inner join tblusuarios_repartidor_detalle as trd on(trd.id_repartidor=tr.id) WHERE tp.id_user = ?', [id]);
    res.status(200).json(data[0])
};

// si el login falla se ejecuta este metodo

userCTRL.signinFailure = async (req, res) => {
    res.status(500).json({ message: 'Datos Incorrectos, Favor verifique nuevamente' })
};

//this method is use  for close session in server (on this moment i don't use this )
userCTRL.logOut = async (req, res) => {
    req.logOut();
    res.status(200).json({ message: 'Sesion Finalizada' })
};
module.exports = userCTRL;
