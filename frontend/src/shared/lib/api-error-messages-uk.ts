/** Maps backend / class-validator English messages to Ukrainian for display in the UI. */

const FIELD_UK: Record<string, string> = {
  password: 'Пароль',
  passwordConfirm: 'Підтвердження пароля',
  name: "Ім'я",
  email: 'Email',
  credential: 'Облікові дані Google',
  token: 'Посилання скидання',
  title: 'Заголовок',
  description: 'Опис',
  message: 'Повідомлення',
  city: 'Місто',
  address: 'Адреса',
  phone: 'Телефон',
  website: 'Вебсайт',
  search: 'Пошук',
  userLat: 'Широта',
  userLng: 'Довгота',
  refreshToken: 'Токен оновлення',
  accessToken: 'Токен доступу',
}

const EXACT: Record<string, string> = {
  'Invalid email or password': 'Невірний email або пароль.',
  'Invalid credentials': 'Невірний email або пароль.',
  'Email is already in use': 'Ця електронна адреса вже використовується.',
  'Passwords do not match': 'Паролі не збігаються. Введіть однаковий пароль у обох полях.',
  'Google sign-in is not configured': 'Вхід через Google не налаштовано.',
  'Invalid Google credential': 'Недійсні дані Google.',
  'Google profile is incomplete': 'Профіль Google неповний.',
  'Google email is not verified': 'Електронна пошта Google не підтверджена.',
  'This email is linked to another Google account':
    'Цей email прив’язаний до іншого облікового запису Google.',
  'Refresh token is invalid': 'Сесію завершено. Увійдіть знову.',
  'Invalid access token': 'Недійсний токен доступу. Увійдіть знову.',

  'Institution not found': 'Заклад не знайдено.',
  'Admin access only': 'Доступ лише для адміністратора.',
  'Reviews can only be added to approved institutions':
    'Відгуки можна додавати лише до схвалених закладів.',
  'Owners cannot review their own institution':
    'Власник не може залишати відгук на свій заклад.',
  'You have already reviewed this institution':
    'Ви вже залишили відгук на цей заклад.',
  'Review not found': 'Відгук не знайдено.',
  'You do not have permission to modify this review':
    'Немає прав на зміну цього відгуку.',
  'You do not have access to reviews for this institution':
    'Немає доступу до відгуків цього закладу.',

  'Only approved institutions can be added to favorites':
    'До обраного можна додати лише схвалені заклади.',
  'Institution is already in favorites': 'Цей заклад уже в обраному.',

  'Failed to upload image': 'Не вдалося завантажити зображення.',
  'Image file is required': 'Потрібен файл зображення.',
  'Unsupported image format': 'Непідтримуваний формат зображення.',
  'Image size must not exceed 5MB': 'Розмір зображення не повинен перевищувати 5 МБ.',

  'Only the institution owner can create news':
    'Створювати новини може лише власник закладу.',
  'News item not found': 'Новину не знайдено.',
  'You do not have permission to delete this news item':
    'Немає прав на видалення цієї новини.',

  'userLat and userLng are required for distance sorting':
    'Для сортування за відстанню потрібні координати (широта та довгота).',
  'You do not have access to this institution': 'Немає доступу до цього закладу.',
  'Only the owner can modify this institution': 'Змінювати заклад може лише власник.',
  'Only admins can moderate institutions': 'Модерувати заклади можуть лише адміністратори.',
  'Only users can create institutions': 'Створювати заклади можуть лише користувачі.',
  'Invalid existing image reference': 'Недійсне посилання на наявне зображення.',

  'Piyachok request not found': 'Запит не знайдено.',
  'Date must be in the future': 'Дата має бути в майбутньому.',
  'Only the creator can delete this piyachok request':
    'Видалити запит може лише автор.',

  'Top category not found': 'Категорію не знайдено.',

  'Password reset email is not configured':
    'Скидання пароля не налаштовано на сервері (SMTP). Зверніться до адміністратора.',
  'Failed to send reset email':
    'Не вдалося надіслати лист. Спробуйте пізніше або перевірте налаштування пошти.',
  'Invalid or expired reset link':
    'Посилання недійсне або прострочене. Запросіть нове скидання пароля.',
  'Password has been reset. You can sign in now.':
    'Пароль оновлено. Тепер можете увійти з новим паролем.',
}

function translateValidationSegment(segment: string): string | null {
  const s = segment.trim()

  const exact = EXACT[s]
  if (exact) {
    return exact
  }

  const longer = /^(\w+) must be longer than or equal to (\d+) characters$/.exec(s)
  if (longer) {
    const [, field, n] = longer
    const label = FIELD_UK[field] ?? field
    return `${label} має містити щонайменше ${n} символів.`
  }

  const shorter = /^(\w+) must be shorter than or equal to (\d+) characters$/.exec(s)
  if (shorter) {
    const [, field, n] = shorter
    const label = FIELD_UK[field] ?? field
    return `${label} має містити не більше ${n} символів.`
  }

  const mustBeEmail = /^(\w+) must be an email$/.exec(s)
  if (mustBeEmail) {
    return 'Вкажіть коректну електронну адресу.'
  }

  const mustBeString = /^(\w+) must be a string$/.exec(s)
  if (mustBeString) {
    const [, field] = mustBeString
    const label = FIELD_UK[field] ?? field
    return `Поле «${label}» має бути текстом.`
  }

  const notEmpty = /^(\w+) should not be empty$/.exec(s)
  if (notEmpty) {
    const [, field] = notEmpty
    const label = FIELD_UK[field] ?? field
    return `Поле «${label}» не може бути порожнім.`
  }

  const notExist = /^property (\w+) should not exist$/.exec(s)
  if (notExist) {
    return `Поле «${notExist[1]}» не дозволене.`
  }

  const nested = /^nested property (\w+) should not exist$/.exec(s)
  if (nested) {
    return `Вкладене поле «${nested[1]}» не дозволене.`
  }

  return null
}

/**
 * Returns Ukrainian text for known API / validation messages.
 * Unknown segments are returned as null so the caller can use a fallback.
 */
export function translateApiErrorToUkrainian(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const direct = EXACT[trimmed]
  if (direct) {
    return direct
  }

  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean)
    const translated: string[] = []
    for (const part of parts) {
      const t = translateValidationSegment(part)
      if (!t) {
        return null
      }
      translated.push(t)
    }
    return translated.join(' ')
  }

  return translateValidationSegment(trimmed)
}
