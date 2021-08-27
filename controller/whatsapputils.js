
const { Client } = require('whatsapp-web.js')
const { findSenderbyNumber, createSender, updateSender, findAllActiveSenders } = require('./senderHelper')
// const qrcode = require('qrcode-terminal')
// const path = require('path')
// const fs = require('fs')
// const { resolve } = require('path')

// const SESSION_FILE_PATH = path.resolve(path.join(__dirname, '../session.json'))
// let sessionCfg
// if (fs.existsSync(SESSION_FILE_PATH)) {
//   sessionCfg = require(SESSION_FILE_PATH)
// }

// const client = new Client(/* { session: sessionCfg } */) // { puppeteer: { headless: true }, session: sessionCfg }
// let isClientInitialized = false

const senderClientMap = {}

const getSenderClient = (sender) => {
  return senderClientMap[sender]
}

const createWhatsAppClient = (sender) => {
  return new Promise((resolve, reject) => {
    if (senderClientMap[sender]) {
      senderClientMap[sender].destroy()
    }
    senderClientMap[sender] = null // disconnect the previous client
    senderClientMap[sender] = new Client(/* { session: sessionCfg } */) // { puppeteer: { headless: true }, session: sessionCfg }
    senderClientMap[sender].on('qr', (qr) => {
      // Generate and scan this code with your phone
      // qrcode.generate(qr, { small: true })
      console.log('QR RECEIVED', qr)
      resolve(qr)
    })

    senderClientMap[sender].on('ready', () => {
      console.log(`${sender} Client is ready!`)
    })

    senderClientMap[sender].on('authenticated', async (session) => {
      // console.log('AUTHENTICATED', session)
      console.log(`${sender} just got authenticated with our app.. putting it in DB`)
      // sessionCfg = session
      const sessionString = JSON.stringify(session)
      const senderExist = await checkSenderExistInDB(sender)
      if (senderExist) {
        try {
          console.log(`Found the sender ${sender} in the DB, trying to update it`)
          await updateSessionForSender(sessionString, sender)
          // await updateSenderinDB({ sender_number: sender, sender_session: sessionString }, true)
        } catch (error) {
          console.log(`Found the sender ${sender} in the DB, Failed to update it`)
          console.log(error)
        }
      } else {
        try {
          console.log(`Creating the sender ${sender} in the DB`)
          // await createSenderinDB(sender, sessionString)
          await createSender({ sender: sender, session: sessionString, state: 'T' })
        } catch (error) {
          console.log(`Failed to create the sender ${sender} in the DB`)
          console.log(error)
        }
      }
      // fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      //   if (err) {
      //     isClientInitialized = false
      //     console.error(err)
      //   }
      // })
    })

    senderClientMap[sender].on('auth_failure', async (msg) => {
      // Fired if session restore was unsuccessfull
      console.error('AUTHENTICATION FAILURE', msg)
      // await updateSenderinDB({ sender_number: sender }, false)
      await updateStateForSender('F', sender)
    })

    senderClientMap[sender].initialize()
  })
}

const checkSenderExistInDB = async (sender) => {
  return await findSenderbyNumber(sender)
}

const updateSessionForSender = async (senderSession, sender) => {
  return await updateSender({
    sender_session: senderSession,
    sender_state: 'T'
  }, sender)
}

const updateStateForSender = async (state, sender) => {
  return await updateSender({
    sender_state: state
  }, sender)
}

const initializeAllSenderFromDB = async () => {
  console.log('Getting all the existing senders from the DB')
  const activeSenders = await findAllActiveSenders()
  console.log('Found the Count of Senders in the DB : ', activeSenders.length)
  const processSenders = activeSenders.map((sender) => {
    return initializeWhatsAppClient(sender)
  })
  return await Promise.all(processSenders)
}

const initializeWhatsAppClient = (senderData) => {
  return new Promise((resolve, reject) => {
    console.log(`Activating the sender ${senderData.sender_number}...`)
    senderClientMap[senderData.sender_number] = null // disconnect the previous client
    senderClientMap[senderData.sender_number] = new Client({ session: JSON.parse(senderData.sender_session) }) // { puppeteer: { headless: true }, session: sessionCfg }
    senderClientMap[senderData.sender_number].on('ready', () => {
      console.log(`${senderData.sender_number} sender is ready!`)
      resolve()
    })
    senderClientMap[senderData.sender_number].on('auth_failure', async (msg) => {
      // Fired if session restore was unsuccessfull
      console.error(`AUTHENTICATION FAILURE for ${senderData.sender_number}`, msg)
      await updateStateForSender('F', senderData.sender_number)
      resolve()
    })
    senderClientMap[senderData.sender_number].initialize()
  })
}

const getAllSendersClientList = () => {
  return Object.keys(senderClientMap)
}

module.exports = {
  createWhatsAppClient,
  initializeAllSenderFromDB,
  getSenderClient,
  getAllSendersClientList
  // getSenderClientState
  // getWhatsAppClient
  // Test Pull Push 
}
