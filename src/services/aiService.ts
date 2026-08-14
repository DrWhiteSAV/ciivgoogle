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
    const choice = gameState.choices[choiceIndex] || gameState.choices[0];
    const overallSuccess = preCalculatedData.some(d => d.isSuccess);
    const outcomeType = overallSuccess ? 'positive' : 'negative';
  
    const response = await fetch('/api/generate-fate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameState,
        choiceIndex,
        yearsToPass,
        preCalculatedData
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const { reply } = await response.json();
    const text = (reply || "").trim();
    
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
    console.error("Fate generation failed, attempting fallback:", error);
    return generateFallbackFateOutcome(gameState, choiceIndex, yearsToPass, preCalculatedData);
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
    const response = await fetch('/api/generate-initial-era', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planet, race })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const { reply } = await response.json();
    const text = (reply || "").trim();
    
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
    console.error("Initial era generation failed, attempting fallback:", error);
    return generateFallbackInitialEra(planet, race);
  }
};
