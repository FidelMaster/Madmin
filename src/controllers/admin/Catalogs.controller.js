// this controller is use for catalogs in system
let catalogCTRL = {};
//aca se manda a llamar la bd 
let pool = require('../../../Model/bd');


// Only Get Methods
catalogCTRL.UserTypes = async (req,res)=>{
    let data = await pool.query('select id,nombre from tbladmin_roles')
    res.render('admin/tiposU/tiposU', { data });
} 

catalogCTRL.ExchangeRate = async (req,res)=>{
   let data = await pool.query('select * from tbladmin_taza_cambio order by fecha desc')
   res.render('admin/charge/index', { data });
} 

catalogCTRL.Sizes= async(req,res)=>{
    let data = await pool.query('select * from tblinv_tallas')
    res.render('admin/tallas/index', { data });
}

catalogCTRL.Marks= async(req,res)=>{
    let data = await pool.query('select id,nombre from tblinv_marca')
    res.render('admin/marca/index', { data });
}

catalogCTRL.Cloths= async(req,res)=>{
    let data = await pool.query('select id,nombre from tblinv_material')
    res.render('admin/tela/index', { data });
}
//End 


// Post Methods
 catalogCTRL.PostUserTypes=async (req, res) => {
    let { tipo, fecha } = req.body;  
    // Saving in the Database
    await pool.query('INSERT INTO tbladmin_taza_cambio(valor,fecha) value(?,?) ', [tipo, fecha]);  
    res.redirect('/admin/tipo/cambio')  
  }

 catalogCTRL.PostMarks = async (req, res) => {
    let { tipo } = req.body; 
    // Saving in the Database
    await pool.query('INSERT INTO tblinv_marca(nombre) value(?) ', [tipo]);
    res.redirect('/admin/tipo/cambio')
  }
  catalogCTRL.PostCloths=async (req, res) => {
    let { tipo } = req.body;
    await pool.query('INSERT INTO tblinv_material(nombre) value(?) ', [tipo]);
    res.redirect('/admin/tela/index')
  }
  catalogCTRL.PostSizes=async (req, res) => {
    let { tipo } = req.body;
    // Saving in the Database
    await pool.query('INSERT INTO tblinv_tallas(nombre) value(?) ', [tipo]); 
    res.redirect('/admin/tipo/cambio')
  }

//End

module.exports = catalogCTRL;
