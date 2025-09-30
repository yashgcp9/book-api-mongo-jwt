# Book API (MongoDB + JWT)

An Express REST API with MongoDB (Mongoose) and JWT auth. Public **GET** endpoints; write operations require a Bearer token.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`  → `{ token }`
- `POST /api/auth/login`     → `{ token }`
- `GET /api/auth/me`         → current user
- `GET /api/books`           → list (optional `?q=`)
- `GET /api/books/:id`
- `POST /api/books`          → **auth required**
- `PUT /api/books/:id`       → **auth required (owner)**
- `PATCH /api/books/:id`     → **auth required (owner)** 
- `DELETE /api/books/:id`    → **auth required (owner)**

---

## Local Run

```bash
cp .env.example .env
# fill MONGODB_URI and JWT_SECRET
npm install
npm start
# http://localhost:3000/api/health
```

### Quick test

```bash
# register
curl -X POST http://localhost:3000/api/auth/register \  -H "content-type: application/json" \  -d '{"email":"you@example.com","password":"SuperSecret123"}'

# login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \  -H "content-type: application/json" \  -d '{"email":"you@example.com","password":"SuperSecret123"}' | jq -r .token)

# create book
curl -X POST http://localhost:3000/api/books \  -H "authorization: Bearer $TOKEN" -H "content-type: application/json" \  -d '{"title":"Clean Code","author":"Robert C. Martin","year":2008}'
```

---

## Deploy to Render

1. Push this folder to a GitHub repo.
2. Render → **New → Web Service** → connect repo.
3. Build: `npm ci`  |  Start: `node src/server.js`
4. **Environment variables** on Render:
   - `PORT=3000`
   - `MONGODB_URI=<Your MongoDB Atlas connection string>`
   - `JWT_SECRET=<long random string>`
   - `JWT_EXPIRES_IN=1d`
   - `CORS_ORIGIN=*` (restrict in prod)
5. Deploy and test `https://…onrender.com/api/health`.

### MongoDB Atlas quick setup
- Create a **Project** → **Cluster** (free M0 works for testing).  
- Create a **Database user** and **Network access** (allow your server IP or 0.0.0.0/0 for testing only).  
- Grab the **connection string** and paste into `MONGODB_URI`.

---

## Custom Domain + Cloudflare

1. In Render → **Settings → Custom Domains → Add** → `api.yourdomain.com`.
2. Render shows a **CNAME**. In **Cloudflare DNS**, create it as given. Use **DNS only** until verified, then switch to **Proxied**.
3. Cloudflare **SSL/TLS**: set **Full (strict)** after Render has a valid cert.
4. **Bypass API caching**: Rules → **Cache Rules** → if path starts with `/api/` ⇒ **Bypass cache**.
5. Optional security: WAF Managed Rules, Rate Limiting on `/api/*`, Bot Fight Mode.

---

## Postman & OpenAPI

- Import `book-api.postman_collection.json` (use `{{baseUrl}}` var).
- OpenAPI: `openapi.yaml`.

---

## Notes

- Ownership check: only the creator (owner) can modify/delete a book.
- Rotate `JWT_SECRET` carefully; existing tokens will become invalid.
- For production: add refresh tokens, password reset, and DB indexes.
