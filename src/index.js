const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const busboy = require("then-busboy");
const cors = require('cors');
const { database } = require('../Model/cadena');

// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials/'),
  extname: '.hbs',
  helpers: require('./lib/handlerbars')
}))
app.set('view engine', '.hbs');

// Middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use(session({
  secret: 'mombashop',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database),
  cookie: { _expires : 2000000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
 
//app.use(validator());

 
// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});


// Routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use(require('./routes/admin'));
app.use(require('./routes/api/api_routes'));
app.use(require('./routes/venta/ventas_routes'));
app.use(require('./routes/inventario/inventario_routes'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
});