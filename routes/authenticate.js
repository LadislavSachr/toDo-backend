const express = require('express');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { getUserFromEmail, createUser } = require('../database/user');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

// endpoint for frontend to authorize user
router.get('/me',(req,res)=>{
    if(req.isAuthenticated()){
        res.status(200).json({message:'Authenticated!'});
    }else{
        res.status(403).json({message:'Not authenticated!'});
    }
})

// logs in a user through facebook passport
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate("facebook", { failureRedirect: process.env.FRONT_END_URL+"/login" }),
    (req,res)=>{
        res.redirect(process.env.FRONT_END_URL);
    }
);

// logs in a user through google passport
router.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONT_END_URL+"/login" }),
  (req, res) => {
    res.redirect(process.env.FRONT_END_URL);
  }
);

// logs in a user through local passport
router.post('/login',
    [body('email').isEmail().trim().withMessage('Invalid email address')], // validates if the input is email and trims white space
    (req, res, next) => { // middleware to check if validation passed
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else{
            next();
        }
    },
    passport.authenticate('local'),
    (req,res)=>{
        res.json({message:'Logged in!'});
    }
);

// logs out a user from session/backend
router.post('/logout',(req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.status(200).json({message: "Come back soon!"})
    })
});

// registers a new user
router.post('/register',
    [
        body('firstName').blacklist('<>"').trim(), // removes < > " and trims white space
        body('lastName').blacklist('<>"').trim(), // removes < > " and trims white space
        body('email').isEmail().trim().withMessage('Invalid email address'), // validates if the input is email and trims white space
        body('password').isLength({min:8}).withMessage('Password must be at least 8 characters') // validates that input is at least 8 characters long
    ],
    (req, res, next) => { // middleware to check if validation passed
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else{
            next();
        }
    },
    async (req,res)=>{
        const { firstName, lastName, email, password } = req.body;
        try{
            const response = await getUserFromEmail(email);
            if(response.rowCount===0){ // checks if a user with that email already exists and if it doesn't creates a new user
                const id = uuidv4();
                const salt = await bcrypt.genSalt(Number(process.env.SALT)); // generates salt
                const hashPassword = await bcrypt.hash(password,salt); // hashes password before saving it to DB
                await createUser(id, firstName, lastName, email, hashPassword, 'local', null, null);
                res.status(201).json({message:'User created successfully'});
            }else{
                res.status(409).json({message:'User already exists'});
            }
        }catch(error){
            res.status(500).json({message:error.message});
        }
    }
);

module.exports = router;