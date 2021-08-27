const Message = require('../models/index').Message

const createMessage = async (sender, from, to, body, file, type) => {
  return await Message.create({
    message_sender: sender,
    message_from: from,
    message_to: to,
    message_body: body,
    message_file: file,
    message_type: type
  })
}

module.exports = {
  createMessage
}
