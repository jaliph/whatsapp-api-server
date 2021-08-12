
const { Client } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const path = require('path')
const fs = require('fs')

const SESSION_FILE_PATH = path.resolve(path.join(__dirname, '../session.json'))
let sessionCfg
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH)
}

const client = new Client({ session: sessionCfg }) // { puppeteer: { headless: true }, session: sessionCfg }
let isClientInitialized = false

const initializeWhatsAppClient = () => {
  return new Promise((resolve, reject) => {
    client.on('qr', (qr) => {
      // Generate and scan this code with your phone
      qrcode.generate(qr, { small: true })
      console.log('QR RECEIVED', qr)
    })

    client.on('ready', () => {
      console.log('Client is ready!')
      isClientInitialized = true
      resolve()
    })
    client.on('authenticated', (session) => {
      console.log('AUTHENTICATED', session)
      sessionCfg = session
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
          isClientInitialized = false
          console.error(err)
        }
      })
    })

    client.on('auth_failure', msg => {
      // Fired if session restore was unsuccessfull
      isClientInitialized = false
      console.error('AUTHENTICATION FAILURE', msg)
    })

    client.initialize()
  })
}

const getWhatsAppClient = () => {
  if (isClientInitialized) {
    return client
  } else {
    throw new Error('Client is not ready!!!')
  }
}

module.exports = {
  initializeWhatsAppClient,
  getWhatsAppClient
}
