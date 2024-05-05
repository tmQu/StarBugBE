const serviceAccount = require("../serviceAccountKey.json");
const sendEmail = require('../sendEmail.js');
const Cors = require('cors');
const dotenv = require('../dotenvConfig.js');
const admin = require('firebase-admin');
const { getAuth } = require("firebase-admin/auth");
const ejs = require('ejs');
const express = require('express'); 
const { Router } = require("express");
const ServerlessHttp = require("serverless-http");

const router = Router();
const firebase_params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url
}
const adminApp = admin.initializeApp(
  {credential: admin.credential.cert(serviceAccount),
  })

const corsOption = {
    origin: '*',
    optionsSuccessStatus: 200
  }
  


const app = express()

app.use(Cors(corsOption))
app.use(express.json())




  
router.get('/', (req, res) => {
  res.send('Welcome to Starbug backend API')
})

router.post('/delete-user', async (req, res) => {
  const token = req.body.token;
  const uid = req.body.uid;
  // idToken comes from the client app
    getAuth()
    .verifyIdToken(token)
    .then(async (decodedToken) => {
      try{
        await getAuth().deleteUser(uid);
        res.status(200).json({message: 'User deleted successfully'});
      }catch(error){
        res.status(500).json({message: error.message});
      }
    })
    .catch((error) => {
      // Handle error
      res.status(401).json({message: error.message});
    });
})

router.post('/create-user', async (req, res) => {
  const token = req.body.token
  const email = req.body.email
  const pwd = req.body.password
  const displayName = req.body.displayName
  getAuth().verifyIdToken(token)
  .then(async (decodedToken) => {
    try{
      let user = await getAuth().createUser({
        email: email,
        password: pwd,
        displayName: displayName
      })
      res.status(200).json({message: 'User created successfully', uid: user.uid})
    }catch(error){
      res.status(500).json({message: error.message})
    }
  })
  .catch((error) => {
    res.status(500).json({message: error.message})
  })

})

router.post('/update-pwd', async (req, res) => {

  const email = req.query.email
  const pwd = req.query.password
  const displayName = req.query.displayName
  try{
    await getAuth().updateUser(email, {
      password: pwd,
      displayName: displayName
    })
    res.status(200).json({message: 'User updated successfully'})
  }catch(error){
    res.status(500).json({message: error.message})
  }
})


router.post('/send-custom-verification-email', async (req, res) => {

  const userEmail = req.body.email
  const redirectUrl = req.body.redirectURL

  redirectUrl = 'http://localhost:3000/'


  // if(!redirectUrl || typeof redirectUrl !== 'string'){
  //   return res.status(401).json({message: 'Invalid redirectUrl'})
  // }

  const actionCodeSettings = {
    url: redirectUrl
  }

  try{


    const actionLink =  await getAuth()
    .generateEmailVerificationLink(userEmail, actionCodeSettings)
    await sendEmail(userEmail, actionLink)
    res.status(200).json({message:'Email successfully sent'})
  }catch(error){
    const message = error.message
    if(error.code === 'auth/user-not-found'){
      return res.status(404).json({message})
    }
    if(error.code === 'auth/invalid-continue-uri'){
      return res.status(401).json({message})
    }
    res.status(500).json({message})}
})


app.use(`/.netlify/functions/api`, router);

// app.listen(3000, () => {
//   console.log('Server is running on port 3000')
// })
module.exports = app;
module.exports.handler = ServerlessHttp(app);
