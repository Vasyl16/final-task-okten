import 'dotenv/config';
import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  InstitutionStatus,
  NewsCategory,
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required AWS env variable: ${name}`);
  }

  return value;
}

const requiredEnv = {
  bucketName: getRequiredEnv('AWS_BUCKET_NAME'),
  region: getRequiredEnv('AWS_REGION'),
  accessKey: getRequiredEnv('AWS_ACCESS_KEY'),
  secretKey: getRequiredEnv('AWS_SECRET_KEY'),
  publicBaseUrl: getRequiredEnv('AWS_ENDPOINT'),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requiredEnv.databaseUrl }),
});

const s3Client = new S3Client({
  region: requiredEnv.region,
  credentials: {
    accessKeyId: requiredEnv.accessKey,
    secretAccessKey: requiredEnv.secretKey,
  },
});

const publicBaseUrl = requiredEnv.publicBaseUrl.replace(/\/+$/, '');
const passwordValue = 'Password123!';
const saltRounds = 10;

type SeedUser = {
  email: string;
  name: string;
  role?: UserRole;
  isCritic?: boolean;
};

type SeedInstitution = {
  slug: string;
  name: string;
  city: string;
  description: string;
  lat: number;
  lng: number;
  status: InstitutionStatus;
  ownerEmail: string;
  imageCaptions: string[];
};

type SeedReview = {
  userEmail: string;
  institutionSlug: string;
  rating: number;
  text: string;
  averageCheck: number;
};

type SeedNews = {
  institutionSlug: string;
  category: NewsCategory;
  title: string;
  content: string;
  hasImage?: boolean;
};

type SeedFavorite = {
  userEmail: string;
  institutionSlug: string;
};

type SeedPiyachok = {
  userEmail: string;
  institutionSlug: string;
  daysFromNow: number;
  peopleCount: number;
  description: string;
  budget?: number;
};

const seedUsers: SeedUser[] = [
  { email: 'admin@piyachok.app', name: 'Olena Admin', role: UserRole.ADMIN },
  { email: 'taras.owner@piyachok.app', name: 'Taras Boyko' },
  { email: 'iryna.owner@piyachok.app', name: 'Iryna Shevchenko', isCritic: true },
  { email: 'andrii.owner@piyachok.app', name: 'Andrii Melnyk' },
  { email: 'maria.owner@piyachok.app', name: 'Maria Tkachenko' },
  { email: 'sofia.user@piyachok.app', name: 'Sofia Kovalenko', isCritic: true },
  { email: 'maksym.user@piyachok.app', name: 'Maksym Polishchuk' },
  { email: 'nadiia.user@piyachok.app', name: 'Nadiia Hrytsenko' },
  { email: 'roman.user@piyachok.app', name: 'Roman Bondar', isCritic: true },
  { email: 'yuliia.user@piyachok.app', name: 'Yuliia Savchuk' },
];

const seedInstitutions: SeedInstitution[] = [
  {
    slug: 'kyiv-malt',
    name: 'Kyiv Malt House',
    city: 'Київ',
    description: 'Сучасний гастропаб із великою крафтовою картою та вечірніми DJ-сетами.',
    lat: 50.4501,
    lng: 30.5234,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'taras.owner@piyachok.app',
    imageCaptions: ['Main hall', 'Craft taps'],
  },
  {
    slug: 'lviv-ferment',
    name: 'Lviv Ferment',
    city: 'Львів',
    description: 'Львівський бар із ферментованими закусками, авторськими коктейлями та двором.',
    lat: 49.8397,
    lng: 24.0297,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'iryna.owner@piyachok.app',
    imageCaptions: ['Courtyard', 'Signature cocktails'],
  },
  {
    slug: 'odesa-brine',
    name: 'Odesa Brine & Bar',
    city: 'Одеса',
    description: 'Морські закуски, сезонні сети та камерна музика на вихідних.',
    lat: 46.4825,
    lng: 30.7233,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'andrii.owner@piyachok.app',
    imageCaptions: ['Seafood table', 'Evening lights'],
  },
  {
    slug: 'kharkiv-keg',
    name: 'Kharkiv Keg Club',
    city: 'Харків',
    description: 'Бар для великих компаній з настільним футболом та live sport nights.',
    lat: 49.9935,
    lng: 36.2304,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'maria.owner@piyachok.app',
    imageCaptions: ['Bar counter', 'Game zone'],
  },
  {
    slug: 'dnipro-foam',
    name: 'Dnipro Foam Stage',
    city: 'Дніпро',
    description: 'Поєднання концертного майданчика, пивного меню та нічних сетів.',
    lat: 48.4647,
    lng: 35.0462,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'taras.owner@piyachok.app',
    imageCaptions: ['Concert stage', 'Night crowd'],
  },
  {
    slug: 'chernivtsi-cellar',
    name: 'Chernivtsi Cellar',
    city: 'Чернівці',
    description: 'Атмосферний підвал із локальним крафтом, настоянками та сирними сетами.',
    lat: 48.2915,
    lng: 25.9403,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'iryna.owner@piyachok.app',
    imageCaptions: ['Stone cellar', 'Cheese board'],
  },
  {
    slug: 'ternopil-hops',
    name: 'Ternopil Hops Garden',
    city: 'Тернопіль',
    description: 'Відкрита тераса біля озера з літніми фестивалями та дегустаційними меню.',
    lat: 49.5535,
    lng: 25.5948,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'andrii.owner@piyachok.app',
    imageCaptions: ['Terrace', 'Festival tables'],
  },
  {
    slug: 'lutsk-amber',
    name: 'Lutsk Amber Taproom',
    city: 'Луцьк',
    description: 'Мікс крафту, вуличної їжі та дружніх квартирників.',
    lat: 50.7472,
    lng: 25.3254,
    status: InstitutionStatus.APPROVED,
    ownerEmail: 'maria.owner@piyachok.app',
    imageCaptions: ['Taproom', 'Street food'],
  },
  {
    slug: 'ivano-ale',
    name: 'Ivano Ale Corner',
    city: 'Івано-Франківськ',
    description: 'Невеликий бар із локальними броварнями та сезонними гастро-парами.',
    lat: 48.9226,
    lng: 24.7111,
    status: InstitutionStatus.PENDING,
    ownerEmail: 'taras.owner@piyachok.app',
    imageCaptions: ['Cozy hall', 'Seasonal menu'],
  },
  {
    slug: 'uzhhorod-yeast',
    name: 'Uzhhorod Yeast Point',
    city: 'Ужгород',
    description: 'Сімейний заклад із дегустаційними сетами та камерними винними вечорами.',
    lat: 48.6208,
    lng: 22.2879,
    status: InstitutionStatus.PENDING,
    ownerEmail: 'iryna.owner@piyachok.app',
    imageCaptions: ['Tasting set', 'Warm lights'],
  },
  {
    slug: 'poltava-mug',
    name: 'Poltava Mug District',
    city: 'Полтава',
    description: 'Бар у стилі industrial з акцентом на соковиті бургери та dark lagers.',
    lat: 49.5883,
    lng: 34.5514,
    status: InstitutionStatus.REJECTED,
    ownerEmail: 'andrii.owner@piyachok.app',
    imageCaptions: ['Industrial hall', 'Burger night'],
  },
  {
    slug: 'vinnytsia-fizz',
    name: 'Vinnytsia Fizz Works',
    city: 'Вінниця',
    description: 'Експериментальний taproom із коктейлями на основі сидру та sour beer.',
    lat: 49.2331,
    lng: 28.4682,
    status: InstitutionStatus.REJECTED,
    ownerEmail: 'maria.owner@piyachok.app',
    imageCaptions: ['Sour lineup', 'Bar stools'],
  },
];

const seedReviews: SeedReview[] = [
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'kyiv-malt', rating: 5, text: 'Сильна барна карта і дуже якісний сервіс.', averageCheck: 620 },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'kyiv-malt', rating: 4, text: 'Гарна атмосфера, але краще бронювати заздалегідь.', averageCheck: 540 },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'kyiv-malt', rating: 5, text: 'Один із найкращих пабів для великої компанії.', averageCheck: 710 },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'lviv-ferment', rating: 4, text: 'Коктейлі чудові, двір особливо приємний ввечері.', averageCheck: 480 },
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'lviv-ferment', rating: 5, text: 'Дуже цілісна концепція та чудова ферментована кухня.', averageCheck: 560 },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'lviv-ferment', rating: 4, text: 'Місце стильне, обслуговування сподобалося.', averageCheck: 450 },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'odesa-brine', rating: 5, text: 'Класний seafood pairing і ненав’язлива музика.', averageCheck: 680 },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'odesa-brine', rating: 4, text: 'Меню цікаве, хотілося б більше сезонних позицій.', averageCheck: 640 },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'odesa-brine', rating: 5, text: 'Ідеально для побачень та спокійних зустрічей.', averageCheck: 590 },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'kharkiv-keg', rating: 4, text: 'Чудово для матчів і великих компаній.', averageCheck: 410 },
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'kharkiv-keg', rating: 3, text: 'Шумно, але для фанатів спорту саме те.', averageCheck: 360 },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'dnipro-foam', rating: 5, text: 'Сцена та звук реально на рівні.', averageCheck: 520 },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'dnipro-foam', rating: 4, text: 'Круті події і непоганий вибір пива.', averageCheck: 470 },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'chernivtsi-cellar', rating: 5, text: 'Атмосфера просто неймовірна, сирні сети топ.', averageCheck: 430 },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'chernivtsi-cellar', rating: 4, text: 'Затишний формат і хороший персонал.', averageCheck: 390 },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'ternopil-hops', rating: 4, text: 'Тераса в теплу погоду дуже сильна.', averageCheck: 460 },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'ternopil-hops', rating: 5, text: 'Фестивальна атмосфера і правильний сервіс.', averageCheck: 510 },
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'lutsk-amber', rating: 4, text: 'Люблю цей taproom за невимушений вайб.', averageCheck: 380 },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'lutsk-amber', rating: 4, text: 'Стрітфуд і крафт вдало поєднуються.', averageCheck: 340 },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'lutsk-amber', rating: 5, text: 'Дуже дружнє місце для регулярних зустрічей.', averageCheck: 395 },
];

const seedNews: SeedNews[] = [
  {
    institutionSlug: 'kyiv-malt',
    category: NewsCategory.EVENT,
    title: 'DJ Friday у Kyiv Malt House',
    content: 'У п’ятницю запускаємо великий вечірній сет з локальними DJ, новим tap list і welcome snack сетом для ранніх гостей.',
    hasImage: true,
  },
  {
    institutionSlug: 'kyiv-malt',
    category: NewsCategory.PROMOTION,
    title: 'Happy Hours на крафтові сети',
    content: 'Щодня з 17:00 до 19:00 діє спеціальна ціна на дегустаційні сети та закуски до них.',
    hasImage: true,
  },
  {
    institutionSlug: 'lviv-ferment',
    category: NewsCategory.GENERAL,
    title: 'Оновили сезонне меню',
    content: 'Додали ферментовані овочі, нові pairing-сети та декілька авторських low ABV коктейлів.',
    hasImage: true,
  },
  {
    institutionSlug: 'lviv-ferment',
    category: NewsCategory.EVENT,
    title: 'Акустичний вечір у дворику',
    content: 'У суботу проводимо камерний акустичний сет у дворику, столики вже доступні для бронювання.',
    hasImage: true,
  },
  {
    institutionSlug: 'odesa-brine',
    category: NewsCategory.GENERAL,
    title: 'Нове seafood pairing меню',
    content: 'Команда кухні підготувала кілька нових морських сетів під лагери, sour та легкі коктейлі.',
    hasImage: true,
  },
  {
    institutionSlug: 'kharkiv-keg',
    category: NewsCategory.EVENT,
    title: 'Match Night з великим екраном',
    content: 'Показуємо центральний матч тижня на великому екрані, а також готуємо combo для компаній.',
    hasImage: true,
  },
  {
    institutionSlug: 'dnipro-foam',
    category: NewsCategory.EVENT,
    title: 'Суботній live set на сцені',
    content: 'Цього тижня приймаємо інді-гурт і відкриваємо вхід у зону сцени з окремими standing-квитками.',
    hasImage: true,
  },
  {
    institutionSlug: 'dnipro-foam',
    category: NewsCategory.PROMOTION,
    title: '2+1 на selected drafts',
    content: 'У будні до 18:00 замовляйте два келихи selected draft та отримуйте третій у подарунок.',
    hasImage: true,
  },
  {
    institutionSlug: 'chernivtsi-cellar',
    category: NewsCategory.GENERAL,
    title: 'Сирний тиждень у Cellar',
    content: 'Підготували cheese flight із локальними сирами та спеціальним pairing із темними елями.',
    hasImage: true,
  },
  {
    institutionSlug: 'ternopil-hops',
    category: NewsCategory.EVENT,
    title: 'Літній фестиваль біля озера',
    content: 'Розширюємо терасу, додаємо open-air stage і запускаємо окреме фестивальне меню на вихідні.',
    hasImage: true,
  },
  {
    institutionSlug: 'lutsk-amber',
    category: NewsCategory.GENERAL,
    title: 'Оновлення стрітфуд-зони',
    content: 'Тепер у нас окрема лінія street food, швидкі видачі та нові spicy позиції до tap list.',
    hasImage: true,
  },
  {
    institutionSlug: 'ivano-ale',
    category: NewsCategory.GENERAL,
    title: 'Ми на етапі модерації',
    content: 'Команда завершує підготовку простору та найближчим часом відкриє повноцінний pre-opening формат.',
    hasImage: true,
  },
];

const seedFavorites: SeedFavorite[] = [
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'kyiv-malt' },
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'lviv-ferment' },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'odesa-brine' },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'dnipro-foam' },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'chernivtsi-cellar' },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'ternopil-hops' },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'kyiv-malt' },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'dnipro-foam' },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'lutsk-amber' },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'lviv-ferment' },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'odesa-brine' },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'lutsk-amber' },
  { userEmail: 'taras.owner@piyachok.app', institutionSlug: 'chernivtsi-cellar' },
  { userEmail: 'iryna.owner@piyachok.app', institutionSlug: 'kyiv-malt' },
  { userEmail: 'andrii.owner@piyachok.app', institutionSlug: 'ternopil-hops' },
  { userEmail: 'maria.owner@piyachok.app', institutionSlug: 'lviv-ferment' },
];

const seedPiyachoks: SeedPiyachok[] = [
  { userEmail: 'sofia.user@piyachok.app', institutionSlug: 'kyiv-malt', daysFromNow: 2, peopleCount: 4, description: 'Шукаю компанію на п’ятничний DJ-сет після роботи.', budget: 900 },
  { userEmail: 'maksym.user@piyachok.app', institutionSlug: 'lviv-ferment', daysFromNow: 4, peopleCount: 3, description: 'Хочу зібрати маленьку компанію на коктейльний вечір.', budget: 700 },
  { userEmail: 'nadiia.user@piyachok.app', institutionSlug: 'odesa-brine', daysFromNow: 5, peopleCount: 2, description: 'Планую спокійну вечерю з seafood pairing.', budget: 1200 },
  { userEmail: 'roman.user@piyachok.app', institutionSlug: 'kharkiv-keg', daysFromNow: 3, peopleCount: 5, description: 'Матч-найт у великій компанії, можна приєднатися.', budget: 800 },
  { userEmail: 'yuliia.user@piyachok.app', institutionSlug: 'dnipro-foam', daysFromNow: 7, peopleCount: 4, description: 'Шукаю людей на live set в суботу.', budget: 950 },
  { userEmail: 'taras.owner@piyachok.app', institutionSlug: 'chernivtsi-cellar', daysFromNow: 6, peopleCount: 3, description: 'Хочу показати друзям сирний сет, не вистачає ще двох.', budget: 650 },
  { userEmail: 'iryna.owner@piyachok.app', institutionSlug: 'ternopil-hops', daysFromNow: 8, peopleCount: 6, description: 'Збираємо компанію на open-air фестивальний вечір.', budget: 1400 },
  { userEmail: 'andrii.owner@piyachok.app', institutionSlug: 'lutsk-amber', daysFromNow: 9, peopleCount: 4, description: 'Street food, крафт і довгі розмови - welcome.', budget: 600 },
  { userEmail: 'maria.owner@piyachok.app', institutionSlug: 'kyiv-malt', daysFromNow: 10, peopleCount: 5, description: 'Планую дегустаційний вечір у центрі Києва.', budget: 1100 },
];

async function main(): Promise<void> {
  console.log('Starting rich seed...');

  const passwordHash = await bcrypt.hash(passwordValue, saltRounds);

  await resetDatabase();

  const users = await createUsers(passwordHash);
  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const institutions = await createInstitutions(userByEmail);
  const institutionBySlug = new Map(institutions.map((item) => [item.slug, item.record]));

  await createNewsItems(institutionBySlug);
  await createReviews(userByEmail, institutionBySlug);
  await createFavorites(userByEmail, institutionBySlug);
  await createPiyachoks(userByEmail, institutionBySlug);
  await createTopCategories(institutionBySlug);
  await createViewEvents(institutionBySlug);
  await syncInstitutionAggregates(userByEmail, institutionBySlug);

  console.log('Seed completed successfully.');
  console.log(`Users created: ${users.length}`);
  console.log(`Institutions created: ${institutions.length}`);
  console.log(`News created: ${seedNews.length}`);
  console.log(`Reviews created: ${seedReviews.length}`);
  console.log(`Favorites created: ${seedFavorites.length}`);
  console.log(`Piyachoks created: ${seedPiyachoks.length}`);
  console.log(`Default password for seeded users: ${passwordValue}`);
}

async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.news.deleteMany(),
    prisma.piyachok.deleteMany(),
    prisma.viewEvent.deleteMany(),
    prisma.topCategory.deleteMany(),
    prisma.institution.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createUsers(passwordHash: string) {
  const createdUsers = [];

  for (const user of seedUsers) {
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role ?? UserRole.USER,
        isCritic: user.isCritic ?? false,
      },
    });

    createdUsers.push(createdUser);
  }

  return createdUsers;
}

async function createInstitutions(
  userByEmail: Map<string, Awaited<ReturnType<typeof createUsers>>[number]>,
) {
  const createdInstitutions: Array<{
    slug: string;
    record: { id: string; name: string; images: string[]; ownerId: string };
  }> = [];

  for (const institution of seedInstitutions) {
    const owner = userByEmail.get(institution.ownerEmail);

    if (!owner) {
      throw new Error(`Missing owner for institution ${institution.slug}`);
    }

    const images = await Promise.all(
      institution.imageCaptions.map((caption, index) =>
        uploadSeedImage({
          folder: 'seed/institutions',
          slug: `${institution.slug}-${index + 1}`,
          title: institution.name,
          subtitle: caption,
          background: pickBackground(index),
        }),
      ),
    );

    const createdInstitution = await prisma.institution.create({
      data: {
        name: institution.name,
        city: institution.city,
        description: institution.description,
        lat: institution.lat,
        lng: institution.lng,
        status: institution.status,
        ownerId: owner.id,
        images,
      },
      select: {
        id: true,
        name: true,
        images: true,
        ownerId: true,
      },
    });

    createdInstitutions.push({
      slug: institution.slug,
      record: createdInstitution,
    });
  }

  return createdInstitutions;
}

async function createNewsItems(
  institutionBySlug: Map<string, { id: string; name: string; images: string[]; ownerId: string }>,
): Promise<void> {
  for (let index = 0; index < seedNews.length; index += 1) {
    const item = seedNews[index];
    const institution = institutionBySlug.get(item.institutionSlug);

    if (!institution) {
      throw new Error(`Missing institution for news ${item.title}`);
    }

    const imageUrl = item.hasImage
      ? await uploadSeedImage({
          folder: 'seed/news',
          slug: `${item.institutionSlug}-${index + 1}`,
          title: item.title,
          subtitle: item.category,
          background: pickBackground(index + 2),
        })
      : null;

    await prisma.news.create({
      data: {
        title: item.title,
        content: item.content,
        category: item.category,
        institutionId: institution.id,
        imageUrl,
      },
    });
  }
}

async function createReviews(
  userByEmail: Map<string, Awaited<ReturnType<typeof createUsers>>[number]>,
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  await prisma.review.createMany({
    data: seedReviews.map((review) => {
      const user = userByEmail.get(review.userEmail);
      const institution = institutionBySlug.get(review.institutionSlug);

      if (!user || !institution) {
        throw new Error(`Missing review relation for ${review.userEmail}`);
      }

      return {
        rating: review.rating,
        text: review.text,
        averageCheck: review.averageCheck,
        userId: user.id,
        institutionId: institution.id,
      };
    }),
  });
}

async function createFavorites(
  userByEmail: Map<string, Awaited<ReturnType<typeof createUsers>>[number]>,
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  await prisma.favorite.createMany({
    data: seedFavorites.map((favorite) => {
      const user = userByEmail.get(favorite.userEmail);
      const institution = institutionBySlug.get(favorite.institutionSlug);

      if (!user || !institution) {
        throw new Error(`Missing favorite relation for ${favorite.userEmail}`);
      }

      return {
        userId: user.id,
        institutionId: institution.id,
      };
    }),
  });
}

async function createPiyachoks(
  userByEmail: Map<string, Awaited<ReturnType<typeof createUsers>>[number]>,
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  await prisma.piyachok.createMany({
    data: seedPiyachoks.map((item) => {
      const user = userByEmail.get(item.userEmail);
      const institution = institutionBySlug.get(item.institutionSlug);

      if (!user || !institution) {
        throw new Error(`Missing piyachok relation for ${item.userEmail}`);
      }

      return {
        userId: user.id,
        institutionId: institution.id,
        date: daysFromNow(item.daysFromNow),
        description: item.description,
        peopleCount: item.peopleCount,
        budget: item.budget ?? null,
      };
    }),
  });
}

async function createTopCategories(
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  const topCategories = [
    {
      name: 'Топ бари для компаній',
      institutions: ['kyiv-malt', 'kharkiv-keg', 'dnipro-foam'],
    },
    {
      name: 'Авторська атмосфера',
      institutions: ['lviv-ferment', 'chernivtsi-cellar', 'odesa-brine'],
    },
    {
      name: 'Літні тераси',
      institutions: ['ternopil-hops', 'lutsk-amber', 'kyiv-malt'],
    },
    {
      name: 'Нічний вайб',
      institutions: ['dnipro-foam', 'kyiv-malt', 'odesa-brine'],
    },
  ];

  for (const category of topCategories) {
    await prisma.topCategory.create({
      data: {
        name: category.name,
        institutions: {
          connect: category.institutions.map((slug) => {
            const institution = institutionBySlug.get(slug);

            if (!institution) {
              throw new Error(`Missing institution for top category ${category.name}`);
            }

            return { id: institution.id };
          }),
        },
      },
    });
  }
}

async function createViewEvents(
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  const viewSeed = [
    ['kyiv-malt', 28],
    ['lviv-ferment', 24],
    ['odesa-brine', 20],
    ['kharkiv-keg', 18],
    ['dnipro-foam', 31],
    ['chernivtsi-cellar', 16],
    ['ternopil-hops', 22],
    ['lutsk-amber', 14],
    ['ivano-ale', 8],
    ['uzhhorod-yeast', 7],
    ['poltava-mug', 5],
    ['vinnytsia-fizz', 4],
  ] as const;

  const data = viewSeed.flatMap(([slug, totalViews], institutionIndex) => {
    const institution = institutionBySlug.get(slug);

    if (!institution) {
      throw new Error(`Missing institution for view seed ${slug}`);
    }

    return Array.from({ length: totalViews }).map((_, index) => ({
      institutionId: institution.id,
      createdAt: daysAgo(((index + institutionIndex) % 9) + 1),
    }));
  });

  await prisma.viewEvent.createMany({ data });
}

async function syncInstitutionAggregates(
  userByEmail: Map<string, Awaited<ReturnType<typeof createUsers>>[number]>,
  institutionBySlug: Map<string, { id: string }>,
): Promise<void> {
  const users = Array.from(userByEmail.values());
  const userById = new Map(users.map((user) => [user.id, user]));
  const reviews = await prisma.review.findMany({
    select: {
      rating: true,
      institutionId: true,
      userId: true,
    },
  });

  const views = await prisma.viewEvent.groupBy({
    by: ['institutionId'],
    _count: {
      institutionId: true,
    },
  });

  const viewsByInstitutionId = new Map(
    views.map((item) => [item.institutionId, item._count.institutionId]),
  );

  for (const institution of institutionBySlug.values()) {
    const institutionReviews = reviews.filter(
      (review) => review.institutionId === institution.id,
    );

    const weightedSum = institutionReviews.reduce((sum, review) => {
      const author = userById.get(review.userId);
      const weight = author?.isCritic ? 2 : 1;

      return sum + review.rating * weight;
    }, 0);

    const totalWeight = institutionReviews.reduce((sum, review) => {
      const author = userById.get(review.userId);

      return sum + (author?.isCritic ? 2 : 1);
    }, 0);

    await prisma.institution.update({
      where: { id: institution.id },
      data: {
        averageRating: totalWeight > 0 ? weightedSum / totalWeight : 0,
        reviewsCount: institutionReviews.length,
        viewsCount: viewsByInstitutionId.get(institution.id) ?? 0,
      },
    });
  }
}

async function uploadSeedImage(params: {
  folder: string;
  slug: string;
  title: string;
  subtitle: string;
  background: string;
}): Promise<string> {
  const key = `${params.folder}/${params.slug}-${randomUUID()}.svg`;
  const body = createSeedSvg(params.title, params.subtitle, params.background);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: requiredEnv.bucketName,
      Key: key,
      Body: body,
      ContentType: 'image/svg+xml',
    }),
  );

  return `${publicBaseUrl}/${key}`;
}

function createSeedSvg(title: string, subtitle: string, background: string): Buffer {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="${background}" />
      <rect x="80" y="80" width="1440" height="740" rx="48" fill="rgba(0,0,0,0.18)" />
      <text x="120" y="360" fill="#ffffff" font-size="72" font-family="Arial, Helvetica, sans-serif" font-weight="700">${safeTitle}</text>
      <text x="120" y="450" fill="#f3f4f6" font-size="34" font-family="Arial, Helvetica, sans-serif">${safeSubtitle}</text>
      <text x="120" y="760" fill="#d1d5db" font-size="24" font-family="Arial, Helvetica, sans-serif">Seeded for Piyachok demo content</text>
    </svg>`,
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pickBackground(index: number): string {
  const palette = [
    '#1d4ed8',
    '#7c3aed',
    '#0f766e',
    '#c2410c',
    '#be123c',
    '#4338ca',
  ];

  return palette[index % palette.length];
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);

  return date;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(19, 30, 0, 0);

  return date;
}

void main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
