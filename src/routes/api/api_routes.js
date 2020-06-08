const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../lib/auth');
 
//const { isLoggedIn } = require('../lib/auth');
 
const { allPedido ,showPedido,showPedidoProduct,showPedidoPaymentDetails, updatePedido} = require('../../controllers/api/repartidor.controller');
 
const {LogIn ,getUserByID, signinFailure,logOut } = require('../../controllers/api/user.controller');

//routes for orders
router.get('/api/v1/pedidos/repartidor/:id',allPedido);
router.get('/api/v1/pedidos/repartidor/detalle/:id',showPedido);
router.get('/api/v1/pedidos/repartidor/products/:id',showPedidoProduct);
router.get('/api/v1/pedidos/repartidor/payments/:id',showPedidoPaymentDetails);
router.get('/api/v1/pedidos/repartidor/entregar/:id',updatePedido);

//Route group for api - Login
router.post('/api/v1/login',LogIn);
router.get('/api/user/information/:id',getUserByID);
router.get('/api/user/authenticate/failure',signinFailure);
router.post('/api/user/logout',logOut);
module.exports = router;
