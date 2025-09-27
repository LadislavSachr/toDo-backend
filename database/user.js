const { query } = require('./pool');

// creates a new user
exports.createUser = (id, firstName, lastName, email, password, provider, facebook_id, google_id) => {
    return query('INSERT INTO users (id, first_name, last_name, email, password, provider, facebook_id, google_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,firstName,lastName,email,password,provider,facebook_id,google_id]);
}

// gets user based on user_id [for serialization/deserialization]
exports.getUserFromId = (id) => {
    return query('SELECT id, first_name, last_name, email FROM users WHERE id = $1',[id]);
}

// gets user based on email [for login]
exports.getUserFromEmail = (email) => {
    return query('SELECT * FROM users WHERE email = $1',[email]);
}

// gets user based on facebook_id
exports.getFacebookUser = (id) => {
    return query('SELECT id from users WHERE facebook_id = $1',[id])
}

// gets user based on google_id
exports.getGoogleUser = (id) => {
    return query('SELECT id from users WHERE google_id = $1',[id])
}