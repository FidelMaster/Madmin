const express = require('express');
const router = express.Router();
const {UserTypes,ExchangeRate,Sizes,Marks,Cloths,PostUserTypes,PostMarks,PostCloths,PostSizes} = require('../controllers/admin/Catalogs.controller');
const {AllUser,AllDeliver,AllCars,PostCar,PostDeliver} = require('../controllers/admin/User.controller');
const { isLoggedIn } = require('../lib/auth');


//this group is represent table catalogs in the system
router.get('/admin/tiposU', isLoggedIn, UserTypes);
router.get('/admin/tipo/cambio', isLoggedIn, ExchangeRate);
router.get('/admin/tipo/tallas', isLoggedIn,Sizes);
router.get('/admin/tipo/marca', isLoggedIn, Marks);
router.get('/admin/tipo/telas', isLoggedIn, Cloths);

//this group is represent post methods to catalogs
router.post('/tipo/cambio/post',PostUserTypes );
router.post('/tipo/marca/post',PostMarks);
router.post('/tipo/material/post', PostCloths);
router.post('/tipo/talla/post', PostSizes);

//Get Methods in Users And Delivers
router.get('/admin/usuario', isLoggedIn,AllUser );
router.get('/admin/usuario/repartidor', isLoggedIn,AllDeliver );
router.get('/admin/usuario/vehiculo', isLoggedIn,AllCars );

//Post Methods
router.post('/registro/repartidor', PostDeliver);
router.post('/registro/vehiculo', PostCar);

module.exports = router;