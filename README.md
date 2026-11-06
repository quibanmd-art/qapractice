# Campus Cart

Campus Cart is a demo online shop for campus essentials, built with React and Vite on the front end and Express on the back end. The Express server provides a real local catalog, account, and demo order API. The shopping cart and wishlist are stored in the browser. Registered demo accounts and demo orders are saved on the server in `server/data/demo-store.json`.

All data in this application is fictional.

## Requirements

- Node.js 20 or later (recommended)
- npm, which is included with Node.js

No account creation, database, or external API setup is needed. Everything runs on your machine.

## Run in development mode

1. Install the dependencies:

```
npm i
```

2. Start the app:

```
npm run start
```

3. Open http://localhost:3000 in your browser. If your system does not resolve localhost, use http://127.0.0.1:3000.

`npm start` is equivalent to `npm run start`.

## Run a production build

1. Build the front end:

```
npm run build
```

2. Start the production server:

```
npm run start:prod
```

The built app is served at http://localhost:3000.

## Demo account

The login page displays the seeded demo credentials:

- Email: alex@campus.test
- Password: Demo12345!

You can also register a new account. Guest checkout is supported, so you can place a demo order without logging in.

## Pages

The app includes the following pages: Home, Shop, Product, Wishlist, Cart, Checkout, Confirmation, Login, Account, Orders, Help, Contact, and Policies.

## Security and limitations

- This is a teaching demo. Every product, price, account, and order is fictional. Do not enter real personal information.
- There are no real payments, no email sending, and no delivery. Checkout is simulated end to end.
- The application is not production secure and is not intended for public deployment. No public deployment is provided.
- Registered accounts and demo orders are stored locally on your machine in `server/data/demo-store.json`. Passwords are stored hashed. Signed-in sessions are held in server memory and end when the server restarts; the browser cookie can remain for up to seven days.
- Registration and login send your password only to the local server. It is never sent to any third-party service.
- Product photos in the app are AI-generated for this demo. They do not show real merchandise.

## Automated rule checks

Run `npm test` for the included 30 rule checks. Browser verification and the seeded-defect answer key are supplied in the separate instructor package.

## Reset saved demo records

Stop the server, then delete `server/data/demo-store.json` to reset local accounts, orders, and contact messages. The next start creates a fresh demo database. This permanently removes those local demo records. Reset session in the interface clears only the current bag, wishlist, promo, and confirmation.

## Project structure

- `src/`: React pages, shared UI, and application state
- `shared/`: catalog data and testable business rules
- `server/`: Express API and automatic local JSON data storage
- `public/assets/`: local generated product imagery
- `docs/`: test-case and bug-report templates
- `tests/`: executable business-rule checks

Initial dependency installation needs internet access. After installation, the app uses local assets and local APIs. The server binds to this computer only, not the classroom network.
