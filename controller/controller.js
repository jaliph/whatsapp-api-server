const whatsAppUtils = require('./whatsapputils')

const numberStatus = async (req, res) => {
  try {
    const payload = req.body
    console.dir(payload)
    const result = await numberChecker(payload.number, payload.countryCode)
    return res.status(200).json({ result })
  } catch (error) {
    console.dir(error)
    return res.status(500).json({ error })
  }
}

const sendMessage = async (req, res) => {
  try {
    const { message, number, countryCode } = req.body
    const numberDetails = await numberChecker(number, countryCode)
    const client = whatsAppUtils.getWhatsAppClient()
    if (numberDetails) {
      await client.sendMessage(numberDetails._serialized, message)
      res.status(200).json({ msg: 'Sent' })
    } else {
      res.status(500).json({ error: 'Number is not registered with Whatsapp' })
    }
  } catch (error) {
    console.dir(error)
    return res.status(500).json({ error })
  }
}

const numberChecker = async (number, countryCode) => {
  try {
    const client = whatsAppUtils.getWhatsAppClient()
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

module.exports = {
  sendMessage,
  numberStatus
}
