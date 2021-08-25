
const { Client } = require('whatsapp-web.js')
// const qrcode = require('qrcode-terminal')
// const path = require('path')
// const fs = require('fs')
const Sender = require('../models/index').Sender
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

// const setSenderClient = (sender, client) => {
//   senderClientMap[sender] = client
// }

const createWhatsAppClient = (sender) => {
  return new Promise((resolve, reject) => {
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
      console.log('AUTHENTICATED', session)
      // sessionCfg = session
      const sessionString = JSON.stringify(session)
      const senderExist = await checkSenderExistinDB(sender)
      if (senderExist) {
        try {
          console.log(`Found the sender ${sender} in the DB, trying to update it`)
          await updateSenderinDB({ sender_number: sender, sender_session: sessionString }, true)
        } catch (error) {
          console.log(`Found the sender ${sender} in the DB, Failed to update it`)
          console.log(error)
        }
      } else {
        try {
          console.log(`Creating the sender ${sender} in the DB`)
          await createSenderinDB(sender, sessionString)
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
      await updateSenderinDB({ sender_number: sender }, false)
    })

    senderClientMap[sender].initialize()
  })
}

const checkSenderExistinDB = async (sender) => {
  const SenderinDB = await Sender.findAll({
    where: {
      sender_number: sender
    }
  })
  console.log('Value from checkSenderExistinDB', SenderinDB)
  return SenderinDB[0] || null
}

const createSenderinDB = async (sender, session) => {
  return await Sender.create({
    sender_number: sender,
    sender_session: session,
    sender_state: 'T'
  })
}

const updateSenderinDB = async (senderObj, flag) => {
  if (flag) {
    // update the session and state of the sender --  called on refresh
    const { sender_number, sender_session } = senderObj
    return await Sender.update({
      sender_session: sender_session,
      sender_state: 'T'
    }, {
      where: {
        sender_number: sender_number
      }
    })
  } else {
    // Expire the state of the sender
    const { sender_number } = senderObj
    return await Sender.update({
      sender_state: 'F'
    }, {
      where: {
        sender_number: sender_number
      }
    })
  }
}

const initializeallSenderfromDB = async () => {
  console.log('Getting all the existing senders from the DB')
  const SenderSinDB = await Sender.findAll({
    where: {
      sender_state: 'T'
    }
  })
  console.log('Found', SenderSinDB)
  for (const senderData of SenderSinDB) {
    await initializeWhatsAppClient(senderData)
  }
}

const initializeWhatsAppClient = (senderData) => {
  return new Promise((resolve, reject) => {
    console.log('Working on SenderData', JSON.stringify(senderData))
    senderClientMap[senderData.sender_number] = null // disconnect the previous client
    senderClientMap[senderData.sender_number] = new Client({ session: JSON.parse(senderData.sender_session) }) // { puppeteer: { headless: true }, session: sessionCfg }
    senderClientMap[senderData.sender_number].on('ready', () => {
      console.log(`${senderData.sender_number} sender is ready!`)
      resolve()
    })
    senderClientMap[senderData.sender_number].initialize()
  })
}

module.exports = {
  createWhatsAppClient,
  initializeallSenderfromDB,
  getSenderClient
  // getWhatsAppClient
}
