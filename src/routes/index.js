const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
//ruta inicial
router.get('/', async (req, res) => {
    res.render('inicio');
});

//login del modulo de ventas
router.get('/login/ventas', async (req, res) => {
    res.render('layouts/venta/login');
});

//login del modulo de admin
router.get('/login/admin', async (req, res) => {
    res.render('layouts/admin/login');
});
//login del modulo de inventario
router.get('/login/inventario', async (req, res) => {
    res.render('layouts/inventario/login');
});
module.exports = router;