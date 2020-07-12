/* Welcome to the PiipSell gateway! This is used to direct users to the correct services.  */

//All non-Piip created middleware and required packages. 
  //Express is used for creating our routes for our API.
  const express = require('express');
  const cookieParser = require('cookie-parser');
  //And here, we instantiate our app using Express. Easy, right?
  const app = express();
  app.use(cookieParser())

  //And for access to our lovely and amazing AASA
  const path = require('path');


  //This is for parsing JSON, only on routes we specificially need to. 
  const bodyParser = require('body-parser');
  const jsonParser = bodyParser.json();


  //For accessing services
  const got = require('got');
  const locales = require('./locations')

  //This is for security access. 
  var admin = require('firebase-admin');

  //And for CORS access - this will ONLY allow CORS call from the PiipSell Frontend
  var cors = require('cors');
  var corsOptions = {
    origin:  function(origin, callback) { 
      locales.getPrimaryHost()
      .then((host) => {
        console.log(host)
        if (origin === host) {
          callback(null, true)
        } else { 
          callback(new Error ('Not Allowed by CORS'))
        }
      })
      .catch((err) => {
        console.log(err)
        callback(err, false)
      })
    },
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }


  var service = require('../GOOGLE_APPLICATION_CREDENTIALS/web-piip-auth-firebase-adminsdk-ldwle-5064267a18.json');
  const { SSL_OP_NETSCAPE_CHALLENGE_BUG } = require('constants');

  //For Deployment
  // admin.initializeApp({
  //     credential: admin.credential.applicationDefault(),
  //     databaseURL: 'https://web-piip-auth.firebaseio.com'
  // })

  //Local Testing
  admin.initializeApp({
    projectId: 'web-piip-auth',
    keyFilename: service
  })

  app.use(cors(corsOptions));



  //Firebase Related

    //Verify the User
      app.get('/verify', function(req, res) {
        var token = req.query.t
        console.log(token)

        admin.auth().verifyIdToken(token)
        .then((decodedToken) => { 
            console.log("you are in teh decodedToken")
            console.log(decodedToken)
            let uid = decodedToken.uid
            
            res.json(uid)
        })
        .catch((err) => { 
            console.log(err)
            res.json(err)
        })
    })

    app.post('/sessionLogin', jsonParser, function(req, res) {
      // Get the ID token passed and the CSRF token.
      console.log(req.cookies)
      console.log(req.body.idToken)
      console.log(req.body.csrfToken)
      const idToken = req.body.idToken;
      const csrfToken = req.body.csrfToken;

      console.log(req.cookies)
      // Guard against CSRF attacks.
      if (csrfToken !== req.cookies.csrfToken) {
        res.status(401).json({error:'UNAUTHORIZED REQUEST!', tip: "You do not have access to this page."});
        return;
      }
      // Set session expiration to 5 days.
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      // Create the session cookie. This will also verify the ID token in the process.
      // The session cookie will have the same claims as the ID token.
      // To only allow session cookie setting on recent sign-in, auth_time in ID token
      // can be checked to ensure user was recently signed in before creating a session cookie.
      admin.auth().verifyIdToken(idToken)
      .then((decodedIdToken) => {
        // Only process if the user just signed in in the last 5 minutes.
      if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
        console.log("passed")
          // Create session cookie and set it.
          return admin.auth().createSessionCookie(idToken, {expiresIn});
        }
        // A user that was not recently signed in is trying to set a session cookie.
      // To guard against ID token theft, require re-authentication.
        res.status(401).send('Recent sign in required!');
      });
    });

  //Stripe related gates
  //Create a new Account
  //Get account information
  
  //Database related gates
    //BUSINESS

    //BUSINESS_EMPLOYEE
    //CHARGE
    //EMPLOYEE
    //QR
      app.post('/qr', jsonParser, function(req, res) {
        console.log(req.body)
        got.post(`${locales.all_locations.qrs}/create`, {
          json: {
            data: req.body
          }, 
          responseType: 'json'
        })
        .then((response) => { 
          res.json(response.body)
        })
        .catch((err) => { 
          console.log(err)
          res.json(err)
        })
      })

      app.put('/qr/:id', jsonParser, function(req, res) {
        const id = req.params.id

        got.put(`${locales.all_locations.qrs}/update/${id}`, { 
          json: { 
            data: req.body
          },
          responseType: 'json'
        })
        .then((received) => {
          res.json(received.body)
          res.end()
        })
        .catch((err) => {
          res.json(err)
          res.end()
        })
      })

      app.get('/qr/:id', function(req, res) {
        const id = req.params.id

        got.get(`${locales.all_locations.qrs}/get/${id}`, {
          responseType: 'json'
        })
        .then((received) => {
          res.json(received.body)
          res.end()
        })
        .catch((err) => {
          res.json(err)
          res.end()
        })
      })

      app.get('/qrs', jsonParser, function(req, res) { 
        const id = req.query.store
        console.log(id)
        got.get(`${locales.all_locations.qrs}/all/${id}`, { 
          responseType: 'json'
        })
        .then((received) => {
          res.json(received.body)
          res.end()
        })
        .catch((err) => { 
          res.json(err)
          res.end()
        })
      })

      app.get('/qr/:id/:field', function(req, res) { 
        const id = req.params.id
        const field = req.params.field

        got.get(`${locales.all_locations.qrs}/get/${id}/${field}`, {
          responseType: 'json'
        })
        .then((received) => {
          res.json(received.body)
          res.end()
        })
        .catch((err) => {
          res.json(err)
          res.end()
        })
      })

      app.delete('/qr/:id', function(req, res) {
        const id = req.params.id

        got.delete(`${locales.all_locations.qrs}/delete/${id}`, {
          responseType: 'json'
        })
        .then((received) => {
          res.json(received.body)
          res.end()
        })
        .catch((err) => {
          res.json(err)
          res.end()
        })
      })


    //USER
  //Get -> Model?
  //Update -> Model
  //Delete -> Model?

  // Start the server
const port = process.env.PORT || 2388;
const host = '0.0.0.0' //Required for Cloud Run

app.listen(port, host, () => {
  locales.getAllLocations();
  console.log(`App listening on port ${port}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]


