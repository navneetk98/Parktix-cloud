var admin = require("firebase-admin");
var serviceAccount = require('./secrets/parktix-26bdf-firebase-adminsdk-59bap-74e81d2cd7.json');
const Firebase = () => {


        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.DATABASE_URL,
            
        });
    
    return {
        checkIfLoggedIn: (idToken) => {
            return admin.auth().verifyIdToken(idToken)
        },
        firestore: admin.firestore(),
        auth: admin.auth()
    }
}

module.exports = Firebase();