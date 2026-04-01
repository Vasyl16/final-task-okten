# Postman — Piyachok API

## Import

1. Open Postman → **Import** → **File**.
2. Choose **`Piyachok-API.postman_collection.json`** in this folder.

## Setup

| Variable        | Default                 | Notes |
|----------------|-------------------------|--------|
| `baseUrl`      | `http://localhost:3000` | Change if the API runs elsewhere (e.g. production). |
| `accessToken`  | _(empty)_               | Set automatically after **Auth → Login** succeeds. |
| `refreshToken` | _(empty)_               | Same as above. |
| `institutionId`, `reviewId`, … | _(empty)_ | Copy from API responses when testing chained requests. |

Run **Auth → Login** first (adjust email/password to a real user). Protected folders use `Authorization: Bearer {{accessToken}}`.

**Multipart:** **Institutions → Create / Update** and **News → Create** expect **Body → form-data**; attach optional files on the `images` / `image` keys.
