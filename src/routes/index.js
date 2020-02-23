const express = require('express');
const router = express.Router();

//ruta inicial
router.get('/', async (req, res) => {
    res.render('login');
});

module.exports = router;