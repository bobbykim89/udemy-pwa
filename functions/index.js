const functions = require('firebase-functions')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })
const serviceAccount = require('./pwagram-fb-key.json')
const webpush = require('web-push')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwagram-48475-default-rtdb.firebaseio.com',
})

exports.storePostData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    admin.database().ref('posts').push({
      id: req.body.id,
      title: req.body.title,
      location: req.body.location,
      image: req.body.image,
    })
    then(() => {
      webpush.setVapidDetails(
        'mailto:bobby.sihun.kim@gmail.com',
        'BBYC_FGgUnPMinBWbXYKLuCEkosMmgGu2JN-nUQ1R1YFSsKMkGU10t9RnmN8ivgrZqk19kLjWuJfys9qtdHfaKU',
        'pZyhCU5-5dSYaNZMQzwXL-1vEzFjF3gJDPgH-aqiuOc'
      )
      return admin.database().ref('subscriptions').once('value')
    })
      .then((subscriptions) => {
        subscriptions.forEach((sub) => {
          let pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh,
            },
          }
          webpush
            .sendNotification(
              pushConfig,
              JSON.stringify({
                title: 'New Post',
                content: 'New Post Added',
                openUrl: '/help',
              })
            )
            .catch((err) => {
              console.log(err)
            })
        })
        res.status(201).json({ message: 'Data stored', id: req.body.id })
      })
      .catch((err) => {
        res.status(500).json({ error: err })
      })
  })
})
