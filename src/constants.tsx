import React from 'react';
import { 
  Wind, 
  Cpu, 
  Snowflake, 
  Flame, 
  Trees, 
  Cloud, 
  Sun, 
  Zap, 
  Sparkles, 
  Waves,
  User,
  Gem,
  Ghost,
  Network,
  Fish,
  Smartphone,
  Bird,
  Moon,
  Bug,
  Mountain
} from 'lucide-react';

export interface Habitat {
  temp: number;
  grav: number;
  atmo: number;
  rad: number;
  humi: number;
  res: number;
}

const LORE_LONG = (name: string, type: string) => `
История ${name} уходит корнями в глубокую древность, когда первые искры сознания только начали мерцать в пустоте космоса. Этот ${type} прошел через бесчисленные эпохи трансформации, каждая из которых оставила свой неизгладимый след на его облике. В начале времен, когда материя только сгущалась из первичного хаоса, ${name} был лишь потенциалом, обещанием жизни в бесконечной тьме.

С течением тысячелетий, под влиянием космических ветров и гравитационных аномалий, структура ${name} начала усложняться. Появились первые стабильные формы, заложившие фундамент для того, что мы видим сегодня. Это был период великих катаклизмов и столь же великих созиданий. Столкновения небесных тел приносили новые элементы, а внутреннее тепло порождало уникальные химические реакции.

В эпоху Пробуждения, ${name} обрел свою истинную индивидуальность. Именно тогда сформировались те уникальные условия, которые делают его столь особенным в глазах Наблюдателей. Каждая скала, каждая впадина, каждый поток энергии здесь пропитан памятью о прошлом. Исследователи находят здесь артефакты, возраст которых превышает возраст самых старых звезд в этом секторе галактики.

Культурный и биологический пласт ${name} представляет собой сложную мозаику, где каждый элемент важен для общего равновесия. Здесь традиции прошлого переплетаются с технологиями будущего, создавая неповторимый симбиоз. Жители и обитатели ${name} научились не просто выживать, но и процветать, используя каждый доступный ресурс с мудростью, накопленной поколениями.

Сегодня ${name} стоит на пороге новой эры. Его секреты еще далеко не все раскрыты, и каждый новый шаг Наблюдателя может привести к открытиям, способным изменить ход истории всей цивилизации. Это место, где легенды оживают, а наука граничит с магией. Путешествие по ${name} — это не просто перемещение в пространстве, это погружение в саму суть бытия, где время течет иначе, а возможности ограничены лишь воображением.

(Повторение для объема...)
${name} — это символ стойкости и вечного стремления к свету. Несмотря на все испытания, он продолжает сиять, привлекая к себе тех, кто ищет истину и вдохновение. Его ландшафты вдохновляли поэтов и ученых на протяжении веков. Каждое поколение находит здесь что-то свое, что-то, что заставляет сердце биться чаще, а разум — стремиться к новым горизонтам.

В глубинах ${name} скрыты механизмы, управляющие самой реальностью. Некоторые верят, что это творение древних богов, другие видят в этом результат невероятного стечения обстоятельств. Но независимо от веры, каждый признает величие этого места. Оно требует уважения и осторожности, ибо его мощь может как созидать, так и разрушать.

Мы приглашаем вас стать частью этой истории, вписать свое имя в летописи ${name}. Пусть ваш путь будет освещен светом его звезд, а ваша воля будет тверда, как его древние камни. Добро пожаловать в мир, где начинается ваша судьба.
`.repeat(3); // Repeat to ensure length

export const PLANETS = [
  { 
    id: 'aetheria', 
    name: 'Эфирия', 
    desc: 'Мир парящих островов и вечных ветров.', 
    seed: 'aetheria', 
    icon: <Wind className="text-blue-400" />,
    image: 'https://picsum.photos/seed/aetheria_world/800/600',
    history: LORE_LONG('Эфирия', 'мир парящих островов'),
    habitat: { temp: 50, grav: 20, atmo: 90, rad: 30, humi: 40, res: 50 }
  },
  { 
    id: 'zion9', 
    name: 'Сион-9', 
    desc: 'Высокотехнологичный мир с тремя солнцами.', 
    seed: 'zion9', 
    icon: <Cpu className="text-cyan-400" />,
    image: 'https://picsum.photos/seed/zion9_world/800/600',
    history: LORE_LONG('Сион-9', 'высокотехнологичный мир'),
    habitat: { temp: 80, grav: 50, atmo: 60, rad: 70, humi: 20, res: 80 }
  },
  { 
    id: 'kryos', 
    name: 'Криос', 
    desc: 'Ледяной гигант, где жизнь теплится в геотермальных разломах.', 
    seed: 'kryos', 
    icon: <Snowflake className="text-blue-200" />,
    image: 'https://picsum.photos/seed/kryos_world/800/600',
    history: LORE_LONG('Криос', 'ледяной гигант'),
    habitat: { temp: 10, grav: 50, atmo: 40, rad: 20, humi: 30, res: 60 }
  },
  { 
    id: 'ignis', 
    name: 'Игнис Прайм', 
    desc: 'Вулканическая планета, богатая редкими металлами.', 
    seed: 'ignis', 
    icon: <Flame className="text-orange-500" />,
    image: 'https://picsum.photos/seed/ignis_world/800/600',
    history: LORE_LONG('Игнис Прайм', 'вулканический мир'),
    habitat: { temp: 90, grav: 60, atmo: 50, rad: 40, humi: 10, res: 90 }
  },
  { 
    id: 'xylos', 
    name: 'Ксилос', 
    desc: 'Планета-лес с гигантской биосферой.', 
    seed: 'xylos', 
    icon: <Trees className="text-green-500" />,
    image: 'https://picsum.photos/seed/xylos_world/800/600',
    history: LORE_LONG('Ксилос', 'мир-лес'),
    habitat: { temp: 60, grav: 50, atmo: 80, rad: 20, humi: 80, res: 70 }
  },
  { 
    id: 'nebulax', 
    name: 'Туманность-X', 
    desc: 'Газовый мир с твердым ядром и фиолетовой атмосферой.', 
    seed: 'nebulax', 
    icon: <Cloud className="text-purple-400" />,
    image: 'https://picsum.photos/seed/nebulax_world/800/600',
    history: LORE_LONG('Туманность-X', 'газовый мир'),
    habitat: { temp: 40, grav: 70, atmo: 100, rad: 50, humi: 50, res: 30 }
  },
  { 
    id: 'aurelia', 
    name: 'Аурелия', 
    desc: 'Золотая планета, покрытая бесконечными пустынями.', 
    seed: 'aurelia', 
    icon: <Sun className="text-yellow-500" />,
    image: 'https://picsum.photos/seed/aurelia_world/800/600',
    history: LORE_LONG('Аурелия', 'золотой мир'),
    habitat: { temp: 85, grav: 50, atmo: 40, rad: 60, humi: 5, res: 70 }
  },
  { 
    id: 'obsidia', 
    name: 'Обсидия', 
    desc: 'Мир черного стекла и постоянных гроз.', 
    seed: 'obsidia', 
    icon: <Zap className="text-indigo-400" />,
    image: 'https://picsum.photos/seed/obsidia_world/800/600',
    history: LORE_LONG('Обсидия', 'мир черного стекла'),
    habitat: { temp: 50, grav: 80, atmo: 60, rad: 80, humi: 60, res: 60 }
  },
  { 
    id: 'lumina', 
    name: 'Люмина', 
    desc: 'Планета, где флора и фауна излучают биолюминесцентный свет.', 
    seed: 'lumina', 
    icon: <Sparkles className="text-pink-400" />,
    image: 'https://picsum.photos/seed/lumina_world/800/600',
    history: LORE_LONG('Люмина', 'биолюминесцентный мир'),
    habitat: { temp: 50, grav: 50, atmo: 60, rad: 30, humi: 70, res: 80 }
  },
  { 
    id: 'thalassa', 
    name: 'Таласса', 
    desc: 'Океанический мир с редкими архипелагами.', 
    seed: 'thalassa', 
    icon: <Waves className="text-blue-600" />,
    image: 'https://picsum.photos/seed/thalassa_world/800/600',
    history: LORE_LONG('Таласса', 'океанический мир'),
    habitat: { temp: 40, grav: 60, atmo: 70, rad: 20, humi: 100, res: 60 }
  },
];

export const RACES = [
  { 
    id: 'humans', 
    name: 'Люди', 
    type: 'Гуманоиды', 
    trait: 'Адаптивность', 
    desc: 'Высокая скорость обучения и колонизации.', 
    icon: <User className="text-blue-300" />,
    image: 'https://i.ibb.co/dsFShLzs/ludi.jpg',
    history: LORE_LONG('Люди', 'вид гуманоидов'),
    reproduction: { type: 'Живородящие', term: '9 месяцев', offspring: '1-2 ребенка' },
    development: { maturation: '18 лет', lifespan: '80 лет', features: 'Высокая адаптивность к разным средам' },
    stats: { growth: 1.2, mortality: 0.8 },
    habitat: { temp: 50, grav: 50, atmo: 50, rad: 20, humi: 50, res: 60 }
  },
  { 
    id: 'silicoids', 
    name: 'Кремниевые', 
    type: 'Неорганики', 
    trait: 'Долголетие', 
    desc: 'Медленное развитие, но невероятная прочность.', 
    icon: <Gem className="text-emerald-400" />,
    image: 'https://i.ibb.co/gMShWGVY/cristali.jpg',
    history: LORE_LONG('Кремниевые', 'вид неоргаников'),
    reproduction: { type: 'Кристаллизация', term: '5 лет', offspring: '1 кристалл' },
    development: { maturation: '50 лет', lifespan: '1000+ лет', features: 'Устойчивость к радиации и вакууму' },
    stats: { growth: 0.2, mortality: 0.05 },
    habitat: { temp: 80, grav: 70, atmo: 10, rad: 90, humi: 5, res: 80 }
  },
  { 
    id: 'aetherials', 
    name: 'Эфириалы', 
    type: 'Энергоформы', 
    trait: 'Трансцендентность', 
    desc: 'Существа из чистой энергии, игнорирующие физические преграды.', 
    icon: <Ghost className="text-purple-300" />,
    image: 'https://i.ibb.co/gZPVt24s/efiri.jpg',
    history: LORE_LONG('Эфириалы', 'вид энергоформ'),
    reproduction: { type: 'Деление', term: 'Мгновенно', offspring: '1 сгусток энергии' },
    development: { maturation: '1 год', lifespan: 'Бессмертны', features: 'Игнорирование физических преград' },
    stats: { growth: 0.5, mortality: 0.1 },
    habitat: { temp: 50, grav: 10, atmo: 0, rad: 100, humi: 0, res: 90 }
  },
  { 
    id: 'mycelians', 
    name: 'Мицелианцы', 
    type: 'Грибница', 
    trait: 'Коллективный разум', 
    desc: 'Единая сеть сознания, охватывающая всю планету.', 
    icon: <Network className="text-green-400" />,
    image: 'https://i.ibb.co/LB5C2nh/Gribi.jpg',
    history: LORE_LONG('Мицелианцы', 'вид грибницы'),
    reproduction: { type: 'Спороношение', term: '1 месяц', offspring: '1000+ спор' },
    development: { maturation: '5 лет', lifespan: '40 лет', features: 'Коллективный разум всей грибницы' },
    stats: { growth: 3.5, mortality: 2.5 },
    habitat: { temp: 40, grav: 40, atmo: 70, rad: 30, humi: 90, res: 50 }
  },
  { 
    id: 'aquarians', 
    name: 'Акварианцы', 
    type: 'Амфибии', 
    trait: 'Гидропатия', 
    desc: 'Мастера подводных городов и морских ресурсов.', 
    icon: <Fish className="text-blue-400" />,
    image: 'https://i.ibb.co/ym4vg423/ribi.jpg',
    history: LORE_LONG('Акварианцы', 'вид амфибий'),
    reproduction: { type: 'Икрометание', term: '3 месяца', offspring: '50-100 мальков' },
    development: { maturation: '10 лет', lifespan: '120 лет', features: 'Дыхание под водой и на суше' },
    stats: { growth: 2.0, mortality: 1.5 },
    habitat: { temp: 30, grav: 60, atmo: 80, rad: 20, humi: 100, res: 70 }
  },
  { 
    id: 'cybernads', 
    name: 'Кибер-кочевники', 
    type: 'Киборги', 
    trait: 'Технопатия', 
    desc: 'Слияние плоти и машин для выживания в пустоте.', 
    icon: <Smartphone className="text-slate-400" />,
    image: 'https://i.ibb.co/ddDj71W/kiberi.jpg',
    history: LORE_LONG('Кибер-кочевники', 'вид киборгов'),
    reproduction: { type: 'Сборка', term: '6 месяцев', offspring: '1 модуль' },
    development: { maturation: '2 года', lifespan: '200 лет', features: 'Технопатия и заменяемые детали' },
    stats: { growth: 0.8, mortality: 0.4 },
    habitat: { temp: 50, grav: 50, atmo: 30, rad: 50, humi: 20, res: 90 }
  },
  { 
    id: 'avians', 
    name: 'Пернатые', 
    type: 'Крылатые', 
    trait: 'Свобода', 
    desc: 'Властелины небес, строящие города на вершинах гор.', 
    icon: <Bird className="text-sky-300" />,
    image: 'https://i.ibb.co/zTnsqxxN/angeli.jpg',
    history: LORE_LONG('Пернатые', 'вид крылатых'),
    reproduction: { type: 'Высиживание', term: '2 месяца', offspring: '2-4 яйца' },
    development: { maturation: '12 лет', lifespan: '60 лет', features: 'Полет и острое зрение' },
    stats: { growth: 1.5, mortality: 1.0 },
    habitat: { temp: 40, grav: 20, atmo: 80, rad: 20, humi: 40, res: 50 }
  },
  { 
    id: 'voidwalkers', 
    name: 'Скитальцы Бездны', 
    type: 'Теневые', 
    trait: 'Скрытность', 
    desc: 'Существа, обитающие на грани измерений.', 
    icon: <Moon className="text-indigo-500" />,
    image: 'https://i.ibb.co/DDWsvbWz/teni.jpg',
    history: LORE_LONG('Скитальцы Бездны', 'вид теневых'),
    reproduction: { type: 'Разрыв реальности', term: 'Неизвестно', offspring: '1 тень' },
    development: { maturation: '33 года', lifespan: 'Неограниченно', features: 'Скрытность и фазовый сдвиг' },
    stats: { growth: 0.1, mortality: 0.01 },
    habitat: { temp: 10, grav: 10, atmo: 0, rad: 80, humi: 0, res: 40 }
  },
  { 
    id: 'insectoids', 
    name: 'Инсектоиды', 
    type: 'Рой', 
    trait: 'Эффективность', 
    desc: 'Жесткая иерархия и мгновенное исполнение приказов.', 
    icon: <Bug className="text-amber-600" />,
    image: 'https://i.ibb.co/KpkfJvFB/ants.jpg',
    history: LORE_LONG('Инсектоиды', 'вид роя'),
    reproduction: { type: 'Личинки', term: '2 недели', offspring: '500+ личинок' },
    development: { maturation: '1 год', lifespan: '10 лет', features: 'Роевой интеллект и быстрая реакция' },
    stats: { growth: 5.0, mortality: 4.5 },
    habitat: { temp: 60, grav: 50, atmo: 60, rad: 40, humi: 60, res: 80 }
  },
  { 
    id: 'titans', 
    name: 'Титаны', 
    type: 'Каменные', 
    trait: 'Мощь', 
    desc: 'Гиганты, способные изменять ландшафт своими руками.', 
    icon: <Mountain className="text-stone-500" />,
    image: 'https://i.ibb.co/Znb6p8K/titani.jpg',
    history: LORE_LONG('Титаны', 'вид каменных'),
    reproduction: { type: 'Оживление', term: '10 лет', offspring: '1 малый титан' },
    development: { maturation: '100 лет', lifespan: '5000 лет', features: 'Огромная сила и долголетие' },
    stats: { growth: 0.05, mortality: 0.01 },
    habitat: { temp: 70, grav: 100, atmo: 40, rad: 50, humi: 30, res: 100 }
  },
];

export const getCompatibility = (raceHabitat: Habitat, planetHabitat: Habitat): number => {
  const params: (keyof Habitat)[] = ['temp', 'grav', 'atmo', 'rad', 'humi', 'res'];
  let totalDiff = 0;
  params.forEach(p => {
    totalDiff += Math.abs(raceHabitat[p] - planetHabitat[p]);
  });
  const compatibility = Math.max(1, Math.round(100 - (totalDiff / 6)));
  return compatibility;
};

export const ERAS = [
  { name: "Первобытность", minYear: 0, minPop: 0 },
  { name: "Неолит", minYear: 500, minPop: 5000 },
  { name: "Бронзовый век", minYear: 2000, minPop: 50000 },
  { name: "Железный век", minYear: 3500, minPop: 200000 },
  { name: "Античность", minYear: 5000, minPop: 1000000 },
  { name: "Средневековье", minYear: 6500, minPop: 5000000 },
  { name: "Ренессанс", minYear: 8000, minPop: 20000000 },
  { name: "Индустриальная эра", minYear: 9500, minPop: 100000000 },
  { name: "Атомный век", minYear: 10500, minPop: 500000000 },
  { name: "Информационный век", minYear: 11500, minPop: 2000000000 },
  { name: "Космическая эра", minYear: 13000, minPop: 5000000000 },
];

export const getEra = (year: number, pop: number) => {
  let currentEra = ERAS[0].name;
  for (const era of ERAS) {
    if (year >= era.minYear && pop >= era.minPop) {
      currentEra = era.name;
    }
  }
  return currentEra;
};

