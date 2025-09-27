const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet')
const { pool } = require('./database/pool');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();
require('./routes/passport'); // imports passport config

const app = express();

// allows requests from frontend origin
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true
}));

app.use(express.json()); // takes json request body and puts it into req.body
app.use(express.urlencoded({extended: false})); // takes url-encoded payload and puts it into req.body

// setting up various HTTP headers for protection
app.use(helmet());

// allows use of proxy
app.set('trust proxy', 1);

// sets up sesssion
app.use(session({
    store: new pgSession({ // connects session to our database for storage
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true,
        pruneSessionInterval: 60*60
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24, // 1 day
        httpOnly: true,
        secure: true, //production true / development false
        sameSite: 'none' //production 'none' / development 'lax'
    }
}));

app.use(passport.initialize()); // setting up passport middleware to run on every request
app.use(passport.session()); // connects passport to a express-session (users stays logged in)

app.get('/',(req,res)=>{
    res.send('ALIVE!');
})

// connects authenticate router
const authRouter = require('./routes/authenticate');
app.use('/', authRouter);

// connects tasks router
const taskRouter = require('./routes/tasks');
app.use('/tasks', taskRouter);

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
})