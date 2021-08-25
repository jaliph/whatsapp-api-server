# Whatsapp Web Server

Brings the capability of WhatsApp to a Web Server

Whats App session is stored in the session.json at the initial start and authentication. This can later be shipped to Production server to pre-authenticate the session.

## Install

Ensure Node.js is installed on your system
Run `npm i `

## Environment variables

```
export AUTH_USER=admin
export AUTH_PASSWORD=Admin@123
```

## DB config
The application on start up will try to connect with mysql to initialise the senders present in the DB. The DB configurations are stored in the `config.js` file.

The above envs are mandatory to provide httpAuth to the exposed routes

## Usage

Run  `npm start`

A QR code will be displayed on the terminal, use that to authenticate from the Whatsapp Mobile.  This will create a session.json file. That file can be reused to setup the session again without scanning the qr code again.

Routes exposed

```
/sendMessage
{
    "number": "9148155203",
    "countryCode": "91",
    "message": "Hello World",
    "senderNumber": "91XXXXXXXXX"
}

/numberStatus
{
  {
    "number": "9148155203",
    "countryCode": "91",
    "senderNumber": "91XXXXXXXXX"
  }
}

/sendMedia
{
  {
    "number": "9148155203",
    "countryCode": "91",
    "fileName": "test.pdf",
    "senderNumber": "91XXXXXXXXX"
  }
}
Note : File must be kept inside the files folder in this repo.

```

## TroubleShooting
- Yet to face issues. Product is rock solid.


