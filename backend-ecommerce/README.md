# ShopZone backend

This is a separate Express API project for ShopZone. It stores users, products,
and cart items in MongoDB.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas database

## Run locally

From this directory:

```powershell
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` in `.env` to your local MongoDB URL or Atlas connection string.
Replace `JWT_SECRET` with a random value of at least 32 characters. Keep `.env`
private; it is excluded from Git.

Start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:3001`. Check `GET /api/health` to verify
that the server is responding. The Angular app must use the same origin listed
in `CLIENT_ORIGIN` (defaults to `http://localhost:4200`).

## Add demo data

With MongoDB configured in `.env`, run this once from the backend directory:

```powershell
npm run seed
```

This creates one demo customer, one demo seller, and four sample products. New
demo accounts receive randomly generated passwords printed in the terminal.
Existing demo accounts are kept unchanged, and running the command again does
not duplicate the sample products.
The sample product artwork is served by the backend from `public/images`.

The MongoDB database starts empty. Existing accounts and products in the
frontend's `db.json` are not imported; create accounts again and add products
through the seller dashboard.

## API routes

- `POST /api/auth/register` — create a `user` or `seller` account
- `POST /api/auth/login` — authenticate an account and receive a bearer token
- `GET /api/auth/profile` — retrieve the signed-in customer's contact details and saved delivery address
- `PATCH /api/auth/profile` — update the signed-in customer's name, email, phone, and saved delivery address
- `GET /api/products` — list newest products; supports `limit`, `category`, and `subcategory`
- `GET /api/products/top-deals` — list active, in-stock products discounted at least 20% from their original price
- `GET /api/products/mine` — list the signed-in seller's products
- `GET /api/products/:productId` — product details
- `POST /api/products` — create a product with stock quantity, optional original price, and active status (seller token required)
- `PATCH /api/products/:productId` — update your own product, pricing, active status, or stock quantity (seller token required)
- `DELETE /api/products/:productId` — delete your own product (seller token required)
- `GET /api/cart` — list the signed-in customer's cart
- `POST /api/cart` — add or update a cart item
- `DELETE /api/cart/:productId` — remove a cart item
- `POST /api/orders` — place an order from the signed-in customer's cart using cash on delivery
- `GET /api/orders` — list the signed-in customer's orders for tracking
- `GET /api/orders/:orderId` — retrieve one of the signed-in customer's orders
- `PATCH /api/orders/:orderId/items/:productId/cancel` — cancel an unshipped item in your order and return its quantity to stock

Passwords are hashed before storage. Authentication tokens are signed using
`JWT_SECRET`; seller product operations and customer cart operations require the
appropriate role.

Top Deals eligibility is calculated by the API from the current product data:
the product must be active, have stock, and have an original price greater than
its selling price with a discount of at least 20%. The discount percentage is
calculated by the server and is not accepted from sellers as input.
