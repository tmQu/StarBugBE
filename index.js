import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
import sendEmail from './sendEmail.js';
import Cors from 'cors';
import dotenv from './dotenvConfig.js';
import admin from 'firebase-admin';
import { getAuth } from "firebase-admin/auth";
import ejs from 'ejs';
import express from 'express'; 
import FeeApi from './src/fee.js';

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
  
  const PORT = 3000
  
  const app = express()
  
  app.use(Cors(corsOption))
  app.use(express.json())
  app.use(`/.netlify/functions/api`, router);



  
  app.get('/', (req, res) => {
    res.send('Welcome to Starbug backend API')
  })

app.post('/send-custom-verification-email', async (req, res) => {

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


// listener
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
  })