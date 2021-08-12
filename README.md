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

The above envs are mandatory to provide httpAuth to the exposed routes

## Usage
Routes exposed

```
/sendMessage
{
    "number": "9148155203",
    "countryCode": "91",
    "message": "Hello World"
}

/numberStatus
{
  {
    "number": "9148155203",
    "countryCode": "91"
  }
}

/sendMedia
{
  {
    "number": "9148155203",
    "countryCode": "91",
    "fileName": "test.pdf"
  }
}
Note : File must be kept inside the files folder in this repo.

```

## TroubleShooting
- Yet to face issues. Product is rock solid.


