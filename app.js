
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const morgan = require('morgan')
const router = require('./router/router')
const { initializeWhatsAppClient } = require('./controller/whatsapputils')

const PORT = process.env.PORT || 3000

const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), { flags: 'a' })

const app = express()
app.use(cors())
app.use(morgan('combined', { stream: accessLogStream }))
app.use(express.urlencoded())
app.use(express.json())

app.use('/', router)

initializeWhatsAppClient().then(() => {
  console.log('listening on port :: ', PORT)
  app.listen(PORT)
})
