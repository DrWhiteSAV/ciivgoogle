import { GoogleGenAI } from "@google/genai";
import { GameState, PreCalculatedOutcome } from "../types/game";

const extractJSON = (str: string) => {
  let firstOpen = str.indexOf('{');
  if (firstOpen === -1) return null;
  
  let count = 0;
  let inString = false;
  let escaped = false;
  
  for (let i = firstOpen; i < str.length; i++) {
    const char = str[i];
    
    if (char === '"' && !escaped) {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '{') count++;
      else if (char === '}') count--;
      
      if (count === 0) {
        return str.substring(firstOpen, i + 1);
      }
    }
    
    if (char === '\\' && !escaped) {
      escaped = true;
    } else {
      escaped = false;
    }
  }
  
  const lastClose = str.lastIndexOf('}');
  if (lastClose > firstOpen) {
    return str.substring(firstOpen, lastClose + 1);
  }
  
  return null;
};

const FALLBACK_CHOICES = [
  { title: "Путь Традиций", desc: "Следовать заветам предков и сохранять уклад жизни." },
  { title: "Путь Инноваций", desc: "Искать новые способы выживания и инструменты." },
  { title: "Путь Экспансии", desc: "Осваивать новые территории и расширять границы." }
];

const FALLBACK_SKILLS = [
  { name: "Коллективная охота", description: "Умение координировать действия для добычи крупного зверя." },
  { name: "Обработка камня", description: "Создание первых прочных орудий труда и оружия." },
  { name: "Знание трав", description: "Первые шаги в медицине и понимании природы." },
  { name: "Строительство убежищ", description: "Защита от непогоды и хищников." }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(fn: (model?: string) => Promise<any>, retries = 3, delay = 2000) {
  const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];
  
  for (let i = 0; i < retries; i++) {
    const currentModel = models[Math.min(i, models.length - 1)];
    try {
      return await fn(currentModel);
    } catch (error: any) {
      const errorStr = JSON.stringify(error);
      const isQuotaError = 
        error?.message?.includes('429') || 
        error?.message?.includes('quota') || 
        error?.status === 429 ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('rate limit');
        
      if (isQuotaError && i < retries - 1) {
        const backoff = delay * Math.pow(2, i);
        console.warn(`Quota exceeded for ${currentModel}, retrying with ${models[Math.min(i + 1, models.length - 1)]} in ${backoff}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(backoff);
        continue;
      }
      throw error;
    }
  }
}

export const generateFallbackFateOutcome = (
  gameState: GameState,
  choiceIndex: number,
  yearsToPass: number,
  preCalculatedData: PreCalculatedOutcome[]
) => {
  const choice = gameState.choices[choiceIndex] || gameState.choices[0];
  const overallSuccess = preCalculatedData.some(d => d.isSuccess);
  const outcomeType = overallSuccess ? 'positive' : 'negative';
  
  const chronicles = preCalculatedData.map(d => ({
    year: d.year,
    event: d.isSuccess ? "Период стабильного развития и процветания." : "Время испытаний и трудностей для народа.",
    growthPercent: d.growthPercent,
    originalGrowthPercent: d.originalGrowthPercent,
    prayersUsed: d.prayersUsed
  }));

  const skill = FALLBACK_SKILLS[Math.floor(Math.random() * FALLBACK_SKILLS.length)];
  const tapsPerYear = Math.floor(Math.random() * 10) + 1;

  return {
    chronicles,
    newSituation: `Ваша цивилизация прошла через ${yearsToPass} лет. ${overallSuccess ? 'Выбранный путь принес свои плоды, укрепив основы общества.' : 'Путь оказался тернист, но выжившие стали сильнее.'} Что вы предпримете теперь?`,
    newChoices: FALLBACK_CHOICES.map((c, i) => ({ 
      ...c, 
      id: `choice-fallback-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
    })).sort(() => Math.random() - 0.5),
    isSuccess: overallSuccess,
    acquiredSkill: { ...skill, id: `skill-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
    accelerationBonus: {
      name: "Дыхание Предков",
      description: "Духи прошлого направляют ваш народ.",
      prayerText: "О великие предки, даруйте нам свою мудрость и силу!",
      tapsRequired: yearsToPass * tapsPerYear,
      yearsToPass
    }
  };
};

export const generateFateOutcome = async (
  gameState: GameState,
  choiceIndex: number,
  yearsToPass: number,
  isObserver: boolean,
  preCalculatedData: PreCalculatedOutcome[]
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const choice = gameState.choices[choiceIndex] || gameState.choices[0];
    const overallSuccess = preCalculatedData.some(d => d.isSuccess);
    const outcomeType = overallSuccess ? 'positive' : 'negative';
  
    const prompt = `
      Вы - ИИ "Ткач Судеб" для игры CIIV. 
      Текущее состояние:
      Планета: ${gameState.planet.name} (${gameState.planet.desc})
      Раса: ${gameState.race.name} (${gameState.race.desc})
      Биология расы: ${JSON.stringify((gameState.race as any).reproduction)} | ${JSON.stringify((gameState.race as any).development)}
      Статистика расы: ${JSON.stringify((gameState.race as any).stats)}
      Особенности расы: ${(gameState.race as any).desc}
      Среда обитания расы (диаграмма): ${JSON.stringify(gameState.race.habitat)}
      Среда обитания планеты (диаграмма): ${JSON.stringify(gameState.planet.habitat)}
      Стабильность цивилизации: ${gameState.stability}%
      Совместимость с планетой: ${gameState.compatibility}%
      Текущее население: ${gameState.population}
      Текущий год: ${gameState.year}
      Текущая эпоха: ${gameState.era}
      Ситуация: ${gameState.currentSituation}
      Выбранный путь: ${choice.title} - ${choice.desc}
      Прошло лет: ${yearsToPass}
      
      ТЕКУЩИЕ НАВЫКИ ЭПОХИ (только названия):
      Навыки ПРОГРЕССА: ${gameState.skills.filter(s => s.type === 'progress' && s.year >= (gameState.year - gameState.eraYear)).map(s => s.name).join(', ')}
      Навыки РЕГРЕССА: ${gameState.skills.filter(s => s.type === 'regress' && s.year >= (gameState.year - gameState.eraYear)).map(s => s.name).join(', ')}
      
      ВСЕ НАВЫКИ ЦИВИЛИЗАЦИИ (названия): ${gameState.skills.map(s => s.name).join(', ')}
      Последние события (5 лет): ${JSON.stringify(gameState.chronicles.slice(-5).map(c => c.event))}
      Прошлая эпоха: ${gameState.pastEras.length > 0 ? gameState.pastEras[gameState.pastEras.length - 1].name + ": " + gameState.pastEras[gameState.pastEras.length - 1].description.substring(0, 500) : "Нет"}
  
      ПРЕДОПРЕДЕЛЕННЫЕ ДАННЫЕ ДЛЯ ЛЕТОПИСИ (ИСПОЛЬЗУЙТЕ ИХ СТРОГО):
      ${JSON.stringify(preCalculatedData.map(d => ({ 
        year: d.year, 
        isSuccess: d.isSuccess, 
        growthPercent: d.growthPercent,
        originalGrowthPercent: d.originalGrowthPercent,
        prayersUsed: d.prayersUsed
      })))}

      ЗАДАЧА:
      1. Напишите летопись (хронику) для этих ${yearsToPass} лет, основываясь на ПРЕДОПРЕДЕЛЕННЫХ ДАННЫХ.
      2. ПРАВИЛА ГЕНЕРАЦИИ (МАСШТАБИРОВАНИЕ):
         - Используйте ПРЕДОПРЕДЕЛЕННЫЕ ДАННЫЕ для каждого года или периода.
         - Для каждого года, где isSuccess = true, опишите УСПЕХ, достижение или процветание.
         - Для каждого года, где isSuccess = false, опишите НЕУДАЧУ, катастрофу или упадок.
         - Значение growthPercent ДОЛЖНО БЫТЬ ТАКИМ ЖЕ, как в ПРЕДОПРЕДЕЛЕННЫХ ДАННЫХ.
         - Если prayersUsed = true и growthPercent = 0, опишите, как молитвы и вмешательство богов предотвратили катастрофу и спасли народ от гибели (убыль населения была нивелирована).
         ${yearsToPass <= 10 ? `
         - Генерируйте запись для КАЖДОГО года из данных.
         - Каждая запись содержит текст события и процент роста.
         ` : `
         - Генерируйте записи согласно предоставленным данным (шаг может быть больше 1 года).
         - Текст события (event) пишите только для каждой 5-й записи или при значимых изменениях (остальные - пустая строка "").
         - Процент роста (growthPercent) ДОЛЖНО БЫТЬ ТАКИМ ЖЕ, как в данных.
         `}
      3. Опишите новую ситуацию, соответствующую общему исходу (${outcomeType}).
         ВАЖНО: Ситуация должна СТРОГО соответствовать текущей эпохе (${gameState.era}) и размеру населения (${gameState.population}).
      4. Предложите 3 новых варианта выбора, подходящих под текущий контекст.
      5. Сгенерируйте 1 новый навык и 1 бонус ускорения (молитву).
         ВАЖНО: Название и описание навыка должны СТРОГО соответствовать текущей эпохе (${gameState.era}).
      6. Для молитвы сгенерируйте "prayerText" - это текст обращения к богам, вдохновленный расой, миром и эрой.
      7. УСЛОВИЕ СМЕНЫ ЭПОХИ:
      Если количество навыков ПРОГРЕССА в ТЕКУЩЕЙ ЭПОХЕ (сейчас: ${gameState.skills.filter(s => s.type === 'progress' && s.era === gameState.era).length}) достигло 25 И прошло минимум 200 лет с начала текущей эпохи (сейчас: ${gameState.eraYear} лет), ОБЯЗАТЕЛЬНО сгенерируйте НОВУЮ ЭПОХУ.
      - Название эпохи должно быть уникальным, но вдохновленным классическими этапами развития цивилизации.
      - Описание эпохи должно быть на 2000 символов, разделено на абзацы.

      8. НОВЫЕ НАРРАТИВНЫЕ ЭЛЕМЕНТЫ (ОБЯЗАТЕЛЬНО):
      - hero: Если произошло великое событие или успех (isSuccess=true), создайте великую личность. Иначе null.
      - relic: Если прошло много времени или найден артефакт, опишите его. Иначе null.
      - ideology: Опишите текущее мировоззрение (например, "Кибер-панк", "Магический реализм", "Воинственный экспансионизм").
      - externalContact: Если раса встретила кого-то (другие племена, ИИ, пришельцы), укажите название. Иначе null.
      - currentSoundscape: Опишите звуки этой эпохи (например, "Гул серверов и шепот нейросетей").
      
      ОТВЕТЬТЕ СТРОГО В ФОРМАТЕ JSON:
      {
        "chronicles": [{"year": number, "event": string, "growthPercent": number, "originalGrowthPercent": number, "prayersUsed": boolean}],
        "newSituation": string,
        "newChoices": [{"title": string, "desc": string}],
        "isSuccess": boolean,
        "acquiredSkill": {"name": string, "description": string},
        "accelerationBonus": {"name": string, "description": string, "prayerText": string},
        "newEra": {"name": string, "description": string, "newSituation": string, "newChoices": [{"title": string, "desc": string}]} | null,
        "hero": {"name": string, "title": string, "bio": string} | null,
        "relic": {"name": string, "description": string, "type": "artifact" | "relic"} | null,
        "ideology": string,
        "externalContact": string | null,
        "currentSoundscape": string
      }
    `;
  
    const response = await callWithRetry((modelName) => ai.models.generateContent({
      model: modelName || "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    }));
  
    const text = (response.text || "").trim();
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      const jsonStr = extractJSON(text);
      if (jsonStr) {
        try {
          result = JSON.parse(jsonStr);
        } catch (e2) {
          console.error("Failed to parse extracted JSON:", jsonStr);
          throw e2;
        }
      } else {
        console.error("No JSON found in response:", text);
        throw e;
      }
    }
    
    // Calculate tapsRequired based on yearsToPass
    const tapsPerYear = Math.floor(Math.random() * 10) + 1;
    const tapsRequired = yearsToPass * tapsPerYear;
  
    // Post-process result to ensure prayer data is preserved and rules are enforced
    const processedChronicles = (result.chronicles || []).map((c: any, idx: number) => {
      const pre = preCalculatedData[idx] || preCalculatedData[preCalculatedData.length - 1];
      const prayersUsed = c.prayersUsed !== undefined ? c.prayersUsed : pre.prayersUsed;
      const originalGrowthPercent = c.originalGrowthPercent !== undefined ? c.originalGrowthPercent : pre.originalGrowthPercent;
      let growthPercent = c.growthPercent !== undefined ? c.growthPercent : pre.growthPercent;
      
      // Enforce prayer rules: x2 for success, 0 for failure
      if (prayersUsed) {
        if (pre.isSuccess) {
          growthPercent = originalGrowthPercent * 2;
        } else {
          growthPercent = 0;
        }
      }

      return {
        ...c,
        year: c.year || pre.year,
        prayersUsed,
        originalGrowthPercent,
        growthPercent: Number(growthPercent.toFixed(2))
      };
    });

    return { 
      ...result, 
      chronicles: processedChronicles,
      outcomeType, 
      choiceTitle: choice.title,
      accelerationBonus: result.accelerationBonus ? {
        ...result.accelerationBonus,
        prayerText: result.accelerationBonus.prayerText,
        tapsRequired,
        yearsToPass
      } : null
    };
  } catch (error: any) {
    console.error("Fate generation failed:", error);
    throw error;
  }
};

export const generateFallbackInitialEra = (planet: any, race: any) => {
  return {
    name: "Первобытная эпоха",
    description: `Ваша раса, ${race.name}, делает свои первые шаги на планете ${planet.name}. Это время великих открытий и суровой борьбы за выживание. В тени гигантских лесов и на просторах бескрайних равнин зарождаются первые искры разума. Ваши соплеменники учатся понимать язык природы, находить пищу и защищаться от хищников. Это эпоха, когда каждый день — это победа над смертью, а каждая ночь — время для рассказов у костра о великих духах, населяющих этот мир. Ваша история только начинается, и впереди лежат бесчисленные века развития и трансформации.`,
    initialSituation: "Ваша цивилизация только что зародилась. Первые поселения появились в плодородных долинах. Что станет вашим первым шагом к величию?",
    initialChoices: FALLBACK_CHOICES.map((c, i) => ({ 
      ...c, 
      id: `choice-init-fallback-${i}`
    })).sort(() => Math.random() - 0.5)
  };
};

export const generateInitialEra = async (planet: any, race: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `
      Вы - ИИ "Ткач Судеб" для игры CIIV.
      Сгенерируйте описание ПЕРВОБЫТНОЙ ЭПОХИ для следующей комбинации:
      Планета: ${planet.name} (${planet.desc})
      Раса: ${race.name} (${race.desc})
      
      Описание должно быть подробным, атмосферным, на 2000 символов, разделено на абзацы.
      Оно должно описывать первые шаги этой расы в этом мире, их верования, борьбу за выживание и начало культуры.
      Учитывайте биологию расы и особенности планеты.
      
      ТАКЖЕ сгенерируйте начальную ситуацию и 3 пути выбора для Ткача Судеб.
      
      ОТВЕТЬТЕ СТРОГО В ФОРМАТЕ JSON:
      {
        "name": "Первобытная эпоха",
        "description": string,
        "initialSituation": string,
        "initialChoices": [{"title": string, "desc": string}]
      }
    `;
  
    const response = await callWithRetry((modelName) => ai.models.generateContent({
      model: modelName || "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        maxOutputTokens: 4096
      }
    }));
  
    const text = (response.text || "").trim();
    
    try {
      return JSON.parse(text);
    } catch (e) {
      const jsonStr = extractJSON(text);
      if (jsonStr) {
        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error("Failed to parse extracted JSON (initial era):", jsonStr);
          throw e2;
        }
      } else {
        console.error("No JSON found in response (initial era):", text);
        throw e;
      }
    }
  } catch (error) {
    console.error("Initial era generation failed:", error);
    throw error;
  }
};
