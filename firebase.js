var admin = require("firebase-admin");
var serviceAccount = require(process.env.KEY_FILENAME_ADMIN);

const Firebase = () => {
  const sdk = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
  });
  return {
    checkIfLoggedIn: (idToken) => {
      return admin.auth().verifyIdToken(idToken);
    },
    firestore: admin.firestore(),
    auth: admin.auth(),
  };
};

module.exports = Firebase();
