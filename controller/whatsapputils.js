
const { Client } = require('whatsapp-web.js')
const { findSenderbyNumber, createSender, updateSender, findAllActiveSenders } = require('./senderHelper')
const { createMessage } = require('./messageHelper')
const mime = require('mime-types')
const fs = require('fs')
const path = require('path')
// const qrcode = require('qrcode-terminal')

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

    senderClientMap[sender].on('message', async msg => {
      try {
        await messageCreater(sender, msg)
      } catch (error) {
        console.log('Error while doing an entry in the DB for Incoming message', error)
      }
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
      // Fired if session restore was unsuccessful
      console.error(`AUTHENTICATION FAILURE for ${senderData.sender_number}`, msg)
      await updateStateForSender('F', senderData.sender_number)
      senderClientMap[senderData.sender_number].destroy()
      senderClientMap[senderData.sender_number] = null
      resolve()
    })
    senderClientMap[senderData.sender_number].on('message', async msg => {
      try {
        await messageCreater(senderData.sender_number, msg)
      } catch (error) {
        console.log('Error while doing an entry in the DB for Incoming message', error)
      }
    })
    senderClientMap[senderData.sender_number].initialize()
  })
}

const messageCreater = async (sender, message) => {
  try {
    console.log(`Received a message for the sender ${sender}, Trying to insert the same in the database..`)
    if (message.hasMedia) {
      const msgMedia = await message.downloadMedia()
      const fileExtension = mime.extension(msgMedia.mimetype)
      console.log('Got a message with Media with type ', fileExtension, ' from ', sender)
      const fileContents = new Buffer(msgMedia.data, 'base64')
      const fileName = message.from + '-' + Date.now() + '.' + fileExtension
      const pathToWrite = path.join(__dirname, '../receivedFile', fileName)
      console.log('Writing the media to the file ', pathToWrite)
      await writeToFile(pathToWrite, fileContents)
      await createMessage(sender, message.from, message.to, message.body, fileName, 'Incoming')
    } else {
      console.log('Got a message without Media from ', sender)
      await createMessage(sender, message.from, message.to, message.body, null, 'Incoming')
    }
  } catch (error) {
    console.log('Error while doing an entry in the DB for Incoming message', error)
  }
}

const getAllSendersClientList = () => {
  const clientList = []
  for (const sender of Object.keys(senderClientMap)) {
    if (senderClientMap[sender]) {
      clientList.push(sender)
    }
  }
  return clientList
}

const writeToFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, function (err) {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

module.exports = {
  createWhatsAppClient,
  initializeAllSenderFromDB,
  getSenderClient,
  getAllSendersClientList,
  messageCreater
  // getSenderClientState
  // getWhatsAppClient
  // Test Pull Push
}
