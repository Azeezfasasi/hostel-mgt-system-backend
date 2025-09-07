# Marshall Global Ventures Quote Request Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your Gmail and receiver email credentials.
2. Run `npm install express cors nodemailer dotenv` in the backend directory.
3. Start the server with `node server.js` or `npm start`.

## API Endpoint

- `POST /api/quote`
  - Body: `{ name, email, service, message }`
  - Sends an email to the receiver with the quote request details.
