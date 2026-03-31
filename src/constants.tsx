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

export const PLANETS = [
  { id: 'aetheria', name: 'Эфирия', desc: 'Мир парящих островов и вечных ветров.', seed: 'aetheria', icon: <Wind className="text-blue-400" /> },
  { id: 'zion9', name: 'Сион-9', desc: 'Высокотехнологичный мир с тремя солнцами.', seed: 'zion9', icon: <Cpu className="text-cyan-400" /> },
  { id: 'kryos', name: 'Криос', desc: 'Ледяной гигант, где жизнь теплится в геотермальных разломах.', seed: 'kryos', icon: <Snowflake className="text-blue-200" /> },
  { id: 'ignis', name: 'Игнис Прайм', desc: 'Вулканическая планета, богатая редкими металлами.', seed: 'ignis', icon: <Flame className="text-orange-500" /> },
  { id: 'xylos', name: 'Ксилос', desc: 'Планета-лес с гигантской биосферой.', seed: 'xylos', icon: <Trees className="text-green-500" /> },
  { id: 'nebulax', name: 'Туманность-X', desc: 'Газовый мир с твердым ядром и фиолетовой атмосферой.', seed: 'nebulax', icon: <Cloud className="text-purple-400" /> },
  { id: 'aurelia', name: 'Аурелия', desc: 'Золотая планета, покрытая бесконечными пустынями.', seed: 'aurelia', icon: <Sun className="text-yellow-500" /> },
  { id: 'obsidia', name: 'Обсидия', desc: 'Мир черного стекла и постоянных гроз.', seed: 'obsidia', icon: <Zap className="text-indigo-400" /> },
  { id: 'lumina', name: 'Люмина', desc: 'Планета, где флора и фауна излучают биолюминесцентный свет.', seed: 'lumina', icon: <Sparkles className="text-pink-400" /> },
  { id: 'thalassa', name: 'Таласса', desc: 'Океанический мир с редкими архипелагами.', seed: 'thalassa', icon: <Waves className="text-blue-600" /> },
];

export const RACES = [
  { 
    id: 'humans', 
    name: 'Люди', 
    type: 'Гуманоиды', 
    trait: 'Адаптивность', 
    desc: 'Высокая скорость обучения и колонизации.', 
    icon: <User className="text-blue-300" />,
    bio: {
      pregnancy: '9 месяцев',
      offspring: '1-2 ребенка',
      maturation: '18 лет',
      lifespan: '70-90 лет',
      reproduction: 'Самки гуманоидного типа'
    }
  },
  { 
    id: 'silicoids', 
    name: 'Кремниевые', 
    type: 'Неорганики', 
    trait: 'Долголетие', 
    desc: 'Медленное развитие, но невероятная прочность.', 
    icon: <Gem className="text-emerald-400" />,
    bio: {
      pregnancy: '5 лет (кристаллизация)',
      offspring: '1 кристалл',
      maturation: '50 лет',
      lifespan: '1000+ лет',
      reproduction: 'Геотермальные инкубаторы'
    }
  },
  { 
    id: 'aetherials', 
    name: 'Эфириалы', 
    type: 'Энергоформы', 
    trait: 'Трансцендентность', 
    desc: 'Существа из чистой энергии, игнорирующие физические преграды.', 
    icon: <Ghost className="text-purple-300" />,
    bio: {
      pregnancy: 'Мгновенно (деление)',
      offspring: '1 сгусток энергии',
      maturation: '1 год',
      lifespan: 'Бессмертны (пока есть энергия)',
      reproduction: 'Энергетический резонанс'
    }
  },
  { 
    id: 'mycelians', 
    name: 'Мицелианцы', 
    type: 'Грибница', 
    trait: 'Коллективный разум', 
    desc: 'Единая сеть сознания, охватывающая всю планету.', 
    icon: <Network className="text-green-400" />,
    bio: {
      pregnancy: '1 месяц (спороношение)',
      offspring: '1000+ спор',
      maturation: '5 лет',
      lifespan: '40 лет (тело) / Вечно (разум)',
      reproduction: 'Центральная грибница-матка'
    }
  },
  { 
    id: 'aquarians', 
    name: 'Акварианцы', 
    type: 'Амфибии', 
    trait: 'Гидропатия', 
    desc: 'Мастера подводных городов и морских ресурсов.', 
    icon: <Fish className="text-blue-400" />,
    bio: {
      pregnancy: '3 месяца (икрометание)',
      offspring: '50-100 мальков',
      maturation: '10 лет',
      lifespan: '120 лет',
      reproduction: 'Нерестилища'
    }
  },
  { 
    id: 'cybernads', 
    name: 'Кибер-кочевники', 
    type: 'Киборги', 
    trait: 'Технопатия', 
    desc: 'Слияние плоти и машин для выживания в пустоте.', 
    icon: <Smartphone className="text-slate-400" />,
    bio: {
      pregnancy: '6 месяцев (сборка)',
      offspring: '1 модуль',
      maturation: '2 года (загрузка ПО)',
      lifespan: '200 лет (с заменой деталей)',
      reproduction: 'Автоматизированные фабрики'
    }
  },
  { 
    id: 'avians', 
    name: 'Пернатые', 
    type: 'Крылатые', 
    trait: 'Свобода', 
    desc: 'Властелины небес, строящие города на вершинах гор.', 
    icon: <Bird className="text-sky-300" />,
    bio: {
      pregnancy: '2 месяца (высиживание)',
      offspring: '2-4 яйца',
      maturation: '12 лет',
      lifespan: '60 лет',
      reproduction: 'Гнездовые общины'
    }
  },
  { 
    id: 'voidwalkers', 
    name: 'Скитальцы Бездны', 
    type: 'Теневые', 
    trait: 'Скрытность', 
    desc: 'Существа, обитающие на грани измерений.', 
    icon: <Moon className="text-indigo-500" />,
    bio: {
      pregnancy: 'Неизвестно',
      offspring: '1 тень',
      maturation: '33 года',
      lifespan: 'Неограниченно в пустоте',
      reproduction: 'Разрыв реальности'
    }
  },
  { 
    id: 'insectoids', 
    name: 'Инсектоиды', 
    type: 'Рой', 
    trait: 'Эффективность', 
    desc: 'Жесткая иерархия и мгновенное исполнение приказов.', 
    icon: <Bug className="text-amber-600" />,
    bio: {
      pregnancy: '2 недели',
      offspring: '500+ личинок',
      maturation: '1 год',
      lifespan: '5 лет (рабочие) / 50 лет (королева)',
      reproduction: 'Королева улья'
    }
  },
  { 
    id: 'titans', 
    name: 'Титаны', 
    type: 'Каменные', 
    trait: 'Мощь', 
    desc: 'Гиганты, способные изменять ландшафт своими руками.', 
    icon: <Mountain className="text-stone-500" />,
    bio: {
      pregnancy: '10 лет (ковка)',
      offspring: '1 малый титан',
      maturation: '100 лет',
      lifespan: '5000 лет',
      reproduction: 'Ритуал оживления камня'
    }
  },
];
