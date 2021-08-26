const Sender = require('../models/index').Sender

const createSender = async ({ sender, session, state }) => {
  return await Sender.create({
    sender_number: sender,
    sender_session: session,
    sender_state: state
  })
}

const findSenderbyNumber = async (senderNumber) => {
  const sender = await Sender.findOne({
    where: {
      sender_number: senderNumber
    }
  })
  if (sender === null) {
    console.log(`The ${senderNumber} is not found in the DB!`)
    return null
  } else {
    console.log(`The ${senderNumber} is  found in the DB!`)
    return sender
  }
}

const updateSender = async (obj, senderNumber) => {
  return await Sender.update(obj, {
    where: {
      sender_number: senderNumber
    }
  })
}

const findAllActiveSenders = async () => {
  return await Sender.findAll({
    where: {
      sender_state: 'T'
    }
  })
}

const findAllSenders = async () => {
  return await Sender.findAll()
}

module.exports = {
  createSender,
  updateSender,
  findSenderbyNumber,
  findAllActiveSenders,
  findAllSenders
}
