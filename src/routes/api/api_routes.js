const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../lib/auth');
 
//const { isLoggedIn } = require('../lib/auth');
 
const { allPedido ,showPedido, updatePedido} = require('../../controllers/api/repartidor.controller');
 
const {LogIn ,signinSuccess, signinFailure,logOut } = require('../../controllers/api/user.controller');

router.get('/api/v1/pedidos/repartidor/:id',allPedido);

//Route group for api - Login
router.post('/api/v1/login',LogIn);
router.get('/api/user/authenticate',signinSuccess);
router.get('/api/user/authenticate/failure',signinFailure);
router.post('/api/user/logout',logOut);
module.exports = router;
