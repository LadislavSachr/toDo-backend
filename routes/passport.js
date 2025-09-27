const passport = require('passport');
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { createUser, getUserFromId, getUserFromEmail, getFacebookUser, getGoogleUser } = require('../database/user');
require('dotenv').config();

// Facebook login
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_SECRET_KEY,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id','name']
    },
    async function(accessToken, refreshToken, profile, done){
        try{
            const response = await getFacebookUser(profile.id);
            profile.facebook_id=profile.id;
            if(response.rowCount===0){ // checks if facebook user already exists in db and if it doesn't creates it in db
                const id = uuidv4();
                await createUser(id, profile.name.givenName, profile.name.familyName, null, null, profile.provider, profile.id, null);
                profile.id=id;
            }else{
                profile.id=response.rows[0].id; // the reason we change the profile throughout this method is that our serialization receives the proper id
            }
            return done(null, profile);
        }catch(error){
            return done(error);
        }
}));

// Google login
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_KEY,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, done){
        try{
            const response = await getGoogleUser(profile.id);
            profile.google_id=profile.id;
            if(response.rowCount===0){ // checks if google user already exists in db and if it doesn't creates it in db
                const id = uuidv4();
                await createUser(id, profile.name.givenName, profile.name.familyName, null, null, profile.provider, null, profile.id);
                profile.id=id;
            }else{
                profile.id=response.rows[0].id; // the reason we change the profile throughout this method is that our serialization receives the proper id
            }
            return done(null, profile);
        }catch(error){
            return done(error);
        }
    }
));

// Local login with email & password
passport.use(new LocalStrategy(
    {usernameField: 'email'},
    async function(email, password, done){
        try{
            const response = await getUserFromEmail(email); // tries to find user in database based on email
            if(response.rowCount===0){
                return done(null,false) // if a user is not found returns false response
            }
            const passwordMatch = await bcrypt.compare(password, response.rows[0].password); // true/false comparing a password of a user found with password submitted
            if(!passwordMatch){
                return done(null,false) // if a password doesn't match returns false response
            }
            return done(null,response.rows[0]); // returns a user
        }catch(error){
            return done(error);
        }
    }
))

// saves only user.id inside a session
passport.serializeUser((user,done)=>{
    done(null,user.id);
})

// on every new request fetches full user information based on user.id saved in session
passport.deserializeUser(async (userId,done)=>{
    try{
        const response = await getUserFromId(userId);
        if(response.rowCount!==0){
            return done(null,response.rows[0])
        }else{
            throw new Error('User not found in database!');
        }
    }catch(error){
        return done(error);
    }
})