const whatsAppUtils = require('./whatsapputils')
const { findAllSenders } = require('./senderHelper')
const { MessageMedia } = require('whatsapp-web.js')
const path = require('path')
const QRCode = require('qrcode')

const numberStatus = async (req, res) => {
  try {
    const { number, countryCode, senderNumber } = req.body
    const client = whatsAppUtils.getSenderClient(senderNumber)
    if (!client) {
      throw new Error(`${senderNumber} is not a valid sender registered with the system.`)
    }
    const result = await numberChecker(client, number, countryCode)
    return res.status(200).json({ result })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const sendMessage = async (req, res) => {
  try {
    const { message, number, countryCode, senderNumber } = req.body
    const client = whatsAppUtils.getSenderClient(senderNumber)
    if (!client) {
      throw new Error(`${senderNumber} is not a valid sender registered with the system.`)
    }
    const status = await checkClientConnectedState(client)
    if (status === 'CONNECTED') {
      const numberDetails = await numberChecker(client, number, countryCode)
      if (numberDetails) {
        await client.sendMessage(numberDetails._serialized, message)
        res.status(200).json({ msg: 'Sent' })
      } else {
        res.status(500).json({ error: 'Number is not registered with Whatsapp' })
      }
    } else {
      res.status(404).json({ error: 'Sender is disconnected with the us. Kindly reauthorize with us!' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const numberChecker = async (client, number, countryCode) => {
  try {
    const sanitizedNumber = number.toString().replace(/[- )(]/g, '')
    const finalNumber = `${countryCode}${sanitizedNumber.substring(sanitizedNumber.length - 10)}`
    console.log('Checking for Number -> ', finalNumber)
    const numberDetails = await client.getNumberId(finalNumber)
    console.log('Result -> ', JSON.stringify(numberDetails))
    return numberDetails
  } catch (error) {
    console.log('Error occurred while checking if number is registered with Whats app!', error)
    throw error
  }
}

const sendMedia = async (req, res) => {
  try {
    const { number, countryCode, fileName, senderNumber } = req.body
    const client = whatsAppUtils.getSenderClient(senderNumber)
    if (!client) {
      throw new Error(`${senderNumber} is not a valid sender registered with the system.`)
    }
    const status = await checkClientConnectedState(client)
    if (status === 'CONNECTED') {
      const media = MessageMedia.fromFilePath(path.resolve(path.join(__dirname, '../files/', fileName)))
      const numberDetails = await numberChecker(client, number, countryCode)
      if (numberDetails) {
        await client.sendMessage(numberDetails._serialized, media)
        res.status(200).json({ msg: 'Sent' })
      } else {
        res.status(500).json({ error: 'Number is not registered with Whatsapp' })
      }
    } else {
      res.status(404).json({ error: 'Sender is disconnected with the us. Kindly reauthorize again!' })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const createSender = async (req, res) => {
  try {
    const { senderNumber } = req.body
    const qr = await whatsAppUtils.createWhatsAppClient(senderNumber)
    const qrString = await QRCode.toString(qr, { type: 'svg' })
    const plainHTML = `
    <html>
      <head>
        <title>Authorize QR Code! - Whatsapp Web</title>
        <style type="text/css" >svg{height:300px;}</style> 
      </head>
      <body>
        <div>
          <p>Scan the below QR code to authorize your account ${senderNumber} with us!</p>
        </div>
        <div>${qrString}</div>
      </body>
    </html>`
    res.set('content-type', 'text/html')
    res.status(200).send(plainHTML)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const checkClientConnectedState = async (client) => {
  try {
    const status = await client.getState()
    return status
  } catch (error) {
    console.log('Error while checking client state ', error)
    return 'NOT CONNECTED'
  }
}

const listAllActiveSenders = async (req, res) => {
  try {
    const activeSenders = whatsAppUtils.getAllSendersClientList()
    res.status(200).json({ activeSenders })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

const listAllSenders = async (req, res) => {
  try {
    const allSenders = await findAllSenders()
    res.status(200).json({ allSenders })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
}

module.exports = {
  sendMessage,
  numberStatus,
  sendMedia,
  createSender,
  listAllActiveSenders,
  listAllSenders
}
