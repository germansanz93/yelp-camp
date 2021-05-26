if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const mongoDBStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

//abajo: logica para ver si la conexion se realizo correctamente o si hubo algun problema y mostrarlo por consola
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//para que express me parsee las solicitudes post
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(mongoSanitize())
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgeaiqw5x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = mongoDBStore.create({
    mongoUrl: dbUrl,
    secret: 'thisshouldbeasecret',
    touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session', //cambiar el nombre de la cookie session id por algo que no sea el nombre por defecto
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //evita cross site scripting SEGURIDAD
        // secure: true, //solo permite la cookie sobre https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expira en una semana
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { //middleware que toma el flash y lo pasa a la plantilla
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'gsanz@gmail.com', username: 'gsanz93' });
//     const newUser = await User.register(user, 'gregores'); //el metodo register comprueba que el nombre de usuario es unico y si es asi, oculta la contraseña mediante hash y salt y la agrega al usuario que pasamos como primer param 
//     res.send(newUser);
// })

app.use('/', userRoutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('listening at port 3000');
})
