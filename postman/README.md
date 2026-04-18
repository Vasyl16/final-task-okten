# Postman — Piyachok API

## Import

1. Open Postman → **Import** → **File** (можна вибрати кілька файлів).
2. Імпортуй **`Piyachok-API.postman_collection.json`** (колекція).
3. Імпортуй **`Piyachok-API.postman_environment.json`** (середовище з усіма змінними, тілами за замовчуванням і підказками в описі колекції).
4. У правому верхньому куті обери середовище **«Piyachok API — Local»** (або скопіюй його для production і зміни `baseUrl`).

Якщо щось не заповнено: змінні з дефолтами вже задані в environment; для ланцюжкових ID після відповідних GET спрацьовують **Tests** у колекції (див. опис колекції в Postman).

## Змінні

| Змінна | Призначення |
|--------|-------------|
| `baseUrl` | URL API (наприклад `http://localhost:3000`). |
| `demoEmail` / `demoPassword` | Логін/реєстрація в **Auth → Login** та **Register**. |
| `passwordResetToken` | Після **Forgot password** скопіюй значення `token` з посилання в листі (`?token=...`) сюди, потім виклич **Reset password**. |
| `demoPasswordNew` | Новий пароль для **Reset password** (мін. 8 символів); після успіху можеш вирівняти `demoPassword` під нього для Login. |
| `accessToken` / `refreshToken` | Заповнюються скриптами після **Login**, **Register**, **Refresh**, **Google**. |
| `institutionId`, `reviewId`, `newsId`, `piyachokId`, `userId`, `categoryId` | Авто з **Tests** після відповідних list-запитів або вручну з відповіді API. |

## Порядок для захищених ендпоінтів

1. Заповни **`demoEmail`** / **`demoPassword`** (реальний користувач).
2. **Auth → Login** (або Register) — збережуться токени.
3. **Institutions → List** — за потреби підставиться `institutionId`.
4. Аналогічно: **News → List**, **Reviews → By institution**, **Piyachok → Public list**, **Admin → Users**, **Admin → Top categories**.

## Скидання пароля (renew)

1. У `.env` бекенду мають бути **`SMTP_EMAIL`** і **`SMTP_PASSWORD`** (Gmail App Password), **`FRONTEND_ORIGIN`** — URL фронта (для посилання в листі).
2. **Auth → Forgot password** — надішле лист на `demoEmail`.
3. Скопіюй **`token`** з посилання в листі в змінну **`passwordResetToken`** (environment або collection).
4. За потреби зміни **`demoPasswordNew`**, виклич **Auth → Reset password**.
5. Онови **`demoPassword`** = **`demoPasswordNew`**, щоб **Login** працював з новим паролем.

**Multipart:** **Institutions → Create / Update** і **News → Create** — вкладка **Body → form-data**, файли на ключах `images` / `image`.

**Admin:** потрібен JWT користувача з роллю **ADMIN**.
