const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()
const {
  sendMessage,
  sendMedia,
  numberStatus,
  createSender,
  listAllActiveSenders,
  listAllSenders
} = require('../controller/controller')

const AUTH_USER = process.env.AUTH_USER
const AUTH_PASSWORD = process.env.AUTH_PASSWORD

const mandatoryString = ' is a mandatory environment key required!!'

if (!AUTH_USER) {
  console.error('AUTH USER' + mandatoryString)
  process.exit(1)
}
if (!AUTH_PASSWORD) {
  console.error('AUTH AUTH_PASSWORD' + mandatoryString)
  process.exit(1)
}

const auth = basicAuth({
  authorizer: (username, password, cb) => {
    const userMatches = basicAuth.safeCompare(username, AUTH_USER)
    const passwordMatches = basicAuth.safeCompare(password, AUTH_PASSWORD)
    if (userMatches & passwordMatches) { return cb(null, true) } else { return cb(null, false) }
  },
  authorizeAsync: true,
  unauthorizedResponse: (req) => {
    return 'Whats App Web Server. Unauthorized.'
  }
})

router.get('/', auth, (req, res) => res.send('<html><title>WhatsApp Server!</title><body><h1>Welcome to WhatsApp Server! </h1><p>Made with &hearts; by Akash Chandra!</p></body></html>'))
router.post('/sendMessage', auth, sendMessage)
router.post('/sendMedia', auth, sendMedia)
router.post('/numberStatus', auth, numberStatus)
router.post('/createSender', auth, createSender)
router.get('/listActiveSenders', auth, listAllActiveSenders)
router.get('/listSenders', auth, listAllSenders)

module.exports = router
