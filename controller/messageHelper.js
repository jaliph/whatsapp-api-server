const Message = require('../models/index').Message

const createMessage = async (sender, from, to, body, file, type = 'chat', pic) => {
  return await Message.create({
    message_sender: sender,
    message_from: from,
    message_to: to,
    message_body: body,
    message_media: file,
    message_type: type,
    message_profile: pic
  })
}

module.exports = {
  createMessage
}
