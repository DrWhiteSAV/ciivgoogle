import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getSQLiteDB, saveSQLiteDB } from './src/db/sqliteServer.js';

const PORT = 3000;

async function askProTalk(prompt: string): Promise<string> {
  const botId = Number(process.env.PROTALK_BOT_ID || '64719');
  const botToken = process.env.PROTALK_BOT_TOKEN || 'TJ1y7wo5qZLSsMY6DrrdCuKYBOM2sOfu';
  const chatId = `ask${Math.floor(Math.random() * 9000) + 1000}`;
  const TIMEOUT_MS = 300000; // 5 minutes
  const POLL_INTERVAL_MS = 5000; // 5 seconds

  console.log(`[Server] Sending message to ProTalk (bot_id: ${botId}, chat_id: ${chatId})...`);

  // 1. Send the asynchronous message
  const sendResponse = await fetch('https://eu1.api.pro-talk.ru/api/v1.0/send_message_async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bot_id: botId,
      bot_token: botToken,
      bot_chat_id: chatId,
      message: prompt
    })
  });

  if (!sendResponse.ok) {
    const errorText = await sendResponse.text();
    throw new Error(`ProTalk send message failed with status ${sendResponse.status}: ${errorText}`);
  }

  const sendResult = await sendResponse.json();
  console.log('[Server] ProTalk message sent:', sendResult);

  // 2. Poll for the reply
  const startTime = Date.now();
  while (Date.now() - startTime < TIMEOUT_MS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollResponse = await fetch('https://eu1.api.pro-talk.ru/api/v1.0/get_last_reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_id: botId,
          bot_token: botToken,
          bot_chat_id: chatId
        })
      });

      if (pollResponse.ok) {
        const pollResult: any = await pollResponse.json();
        if (pollResult && pollResult.message) {
          console.log('[Server] ProTalk response received!');
          return pollResult.message;
        }
      } else {
        console.warn(`[Server] ProTalk polling failed with status ${pollResponse.status}, retrying...`);
      }
    } catch (pollErr) {
      console.error('[Server] Error during ProTalk polling, retrying...', pollErr);
    }
  }

  throw new Error('Timeout: ProTalk did not respond within 5 minutes');
}

// Background Cron Jobs Runner
function initBackgroundCronRunner() {
  console.log('[Cron] Initializing background SQLite cron runner...');
  setInterval(async () => {
    try {
      const db = await getSQLiteDB();
      // Execute Cron task: update last_run and run_count
      db.run(`
        UPDATE cron_jobs 
        SET last_run = datetime('now'), run_count = run_count + 1 
        WHERE status = 'active'
      `);

      // Passive resource accumulation for active game saves in SQLite
      db.run(`
        UPDATE game_saves 
        SET available_years = available_years + 1, 
            prayers = prayers + 5 
        WHERE population > 0
      `);

      saveSQLiteDB();
      console.log('[Cron] Background SQLite sync cycle executed.');
    } catch (err) {
      console.error('[Cron] Error running background task:', err);
    }
  }, 60000); // Every 60 seconds
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize SQLite Database
  await getSQLiteDB();
  initBackgroundCronRunner();

  // --- SQLite API Endpoints ---

  // Get all Planets from SQLite
  app.get('/api/db/planets', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const result = db.exec("SELECT * FROM planets ORDER BY name ASC");
      if (!result.length) return res.json([]);
      const columns = result[0].columns;
      const rows = result[0].values.map(val => {
        const row: any = {};
        columns.forEach((col, idx) => {
          if (col === 'habitat_json' || col === 'loading_phrases_json') {
            try { row[col.replace('_json', '')] = JSON.parse(val[idx] as string); } catch { row[col] = val[idx]; }
          } else {
            row[col] = val[idx];
          }
        });
        return row;
      });
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all Races from SQLite
  app.get('/api/db/races', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const result = db.exec("SELECT * FROM races ORDER BY name ASC");
      if (!result.length) return res.json([]);
      const columns = result[0].columns;
      const rows = result[0].values.map(val => {
        const row: any = {};
        columns.forEach((col, idx) => {
          if (col.endsWith('_json')) {
            try { row[col.replace('_json', '')] = JSON.parse(val[idx] as string); } catch { row[col] = val[idx]; }
          } else {
            row[col] = val[idx];
          }
        });
        return row;
      });
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get latest Game Save from SQLite
  app.get('/api/db/game-saves/latest', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const result = db.exec("SELECT * FROM game_saves ORDER BY updated_at DESC LIMIT 1");
      if (!result.length || !result[0].values.length) return res.json(null);
      const columns = result[0].columns;
      const val = result[0].values[0];
      const row: any = {};
      columns.forEach((col, idx) => {
        row[col] = val[idx];
      });
      if (row.game_state_json) {
        try { row.gameState = JSON.parse(row.game_state_json); } catch {}
      }
      res.json(row);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save / Sync Game State to SQLite
  app.post('/api/db/game-saves', async (req, res) => {
    try {
      const gameState = req.body;
      const db = await getSQLiteDB();
      const id = 'active_save';
      const planetId = gameState.planet?.id || 'aetheria';
      const raceId = gameState.race?.id || 'aetherians';
      const gameStateJson = JSON.stringify(gameState);

      const stmt = db.prepare(`
        INSERT INTO game_saves (id, planet_id, race_id, era, era_description, year, era_year, population, stability, compatibility, available_years, prayers, current_situation, game_state_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          planet_id=excluded.planet_id,
          race_id=excluded.race_id,
          era=excluded.era,
          era_description=excluded.era_description,
          year=excluded.year,
          era_year=excluded.era_year,
          population=excluded.population,
          stability=excluded.stability,
          compatibility=excluded.compatibility,
          available_years=excluded.available_years,
          prayers=excluded.prayers,
          current_situation=excluded.current_situation,
          game_state_json=excluded.game_state_json,
          updated_at=datetime('now')
      `);

      stmt.run([
        id,
        planetId,
        raceId,
        gameState.era || '',
        gameState.eraDescription || '',
        gameState.year || 0,
        gameState.eraYear || 0,
        gameState.population || 144,
        gameState.stability || 100,
        gameState.compatibility || 100,
        gameState.availableYears || 10,
        gameState.prayers || 500,
        gameState.currentSituation || '',
        gameStateJson
      ]);
      stmt.free();

      saveSQLiteDB();
      res.json({ success: true, message: 'Game state saved to SQLite database.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- System Admin Inspection APIs ---

  // List all tables, row counts, and column definitions
  app.get('/api/db/tables', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const tableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      if (!tableResult.length) return res.json([]);
      const tableNames = tableResult[0].values.map(v => v[0] as string);

      const tablesInfo = tableNames.map(name => {
        const countRes = db.exec(`SELECT COUNT(*) FROM ${name}`);
        const count = countRes.length ? (countRes[0].values[0][0] as number) : 0;
        const schemaRes = db.exec(`PRAGMA table_info(${name})`);
        const columns = schemaRes.length ? schemaRes[0].values.map(col => ({
          cid: col[0],
          name: col[1] as string,
          type: col[2] as string,
          notnull: col[3],
          dflt_value: col[4],
          pk: col[5]
        })) : [];
        return { name, count, columns };
      });

      res.json(tablesInfo);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get table rows
  app.get('/api/db/tables/:tableName', async (req, res) => {
    try {
      const { tableName } = req.params;
      const db = await getSQLiteDB();
      const result = db.exec(`SELECT * FROM ${tableName} LIMIT 500`);
      if (!result.length) return res.json({ columns: [], rows: [] });
      const columns = result[0].columns;
      const rows = result[0].values.map(val => {
        const rowObj: any = {};
        columns.forEach((col, i) => {
          rowObj[col] = val[i];
        });
        return rowObj;
      });
      res.json({ columns, rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add a row to a table
  app.post('/api/db/tables/:tableName', async (req, res) => {
    try {
      const { tableName } = req.params;
      const rowData = req.body;
      const db = await getSQLiteDB();
      const keys = Object.keys(rowData);
      const values = Object.values(rowData);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

      const stmt = db.prepare(sql);
      stmt.run(values as any[]);
      stmt.free();
      saveSQLiteDB();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update a row in a table by id
  app.put('/api/db/tables/:tableName/:id', async (req, res) => {
    try {
      const { tableName, id } = req.params;
      const rowData = req.body;
      const db = await getSQLiteDB();
      delete rowData.id; // Preserve primary key
      const keys = Object.keys(rowData);
      const values = Object.values(rowData);
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

      const stmt = db.prepare(sql);
      stmt.run([...values, id] as any[]);
      stmt.free();
      saveSQLiteDB();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a row from a table by id
  app.delete('/api/db/tables/:tableName/:id', async (req, res) => {
    try {
      const { tableName, id } = req.params;
      const db = await getSQLiteDB();
      const stmt = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
      stmt.run([id]);
      stmt.free();
      saveSQLiteDB();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get list of SQLite triggers
  app.get('/api/db/triggers', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const result = db.exec("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger'");
      if (!result.length) return res.json([]);
      const columns = result[0].columns;
      const rows = result[0].values.map(val => {
        const rowObj: any = {};
        columns.forEach((col, i) => {
          rowObj[col] = val[i];
        });
        return rowObj;
      });
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get list of background cron jobs
  app.get('/api/db/cron-jobs', async (req, res) => {
    try {
      const db = await getSQLiteDB();
      const result = db.exec("SELECT * FROM cron_jobs ORDER BY created_at ASC");
      if (!result.length) return res.json([]);
      const columns = result[0].columns;
      const rows = result[0].values.map(val => {
        const rowObj: any = {};
        columns.forEach((col, i) => {
          rowObj[col] = val[i];
        });
        return rowObj;
      });
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Generate Initial Era
  app.post('/api/generate-initial-era', async (req, res) => {
    try {
      const { planet, race } = req.body;
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
          "description": "...",
          "initialSituation": "...",
          "initialChoices": [{"title": "...", "desc": "..."}]
        }
      `;

      const reply = await askProTalk(prompt);
      res.json({ reply });
    } catch (error: any) {
      console.error('[Server Error] generate-initial-era failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Generate Fate
  app.post('/api/generate-fate', async (req, res) => {
    try {
      const { gameState, choiceIndex, yearsToPass, preCalculatedData } = req.body;
      const choice = gameState.choices[choiceIndex] || gameState.choices[0];
      const overallSuccess = preCalculatedData.some((d: any) => d.isSuccess);
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
        Навыки ПРОГРЕССА: ${gameState.skills.filter((s: any) => s.type === 'progress' && s.year >= (gameState.year - gameState.eraYear)).map((s: any) => s.name).join(', ')}
        Навыки РЕГРЕССА: ${gameState.skills.filter((s: any) => s.type === 'regress' && s.year >= (gameState.year - gameState.eraYear)).map((s: any) => s.name).join(', ')}
        
        ВСЕ НАВЫКИ ЦИВИЛИЗАЦИИ (названия): ${gameState.skills.map((s: any) => s.name).join(', ')}
        Последние события (5 лет): ${JSON.stringify(gameState.chronicles.slice(-5).map((c: any) => c.event))}
        Прошлая эпоха: ${gameState.pastEras.length > 0 ? gameState.pastEras[gameState.pastEras.length - 1].name + ": " + gameState.pastEras[gameState.pastEras.length - 1].description.substring(0, 500) : "Нет"}
    
        ПРЕДОПРЕДЕЛЕННЫЕ ДАННЫЕ ДЛЯ ЛЕТОПИСИ (ИСПОЛЬЗУЙТЕ ИХ СТРОГО):
        ${JSON.stringify(preCalculatedData.map((d: any) => ({ 
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
           - Если prayersUsed = true & growthPercent = 0, опишите, как молитвы и вмешательство богов предотвратили катастрофу и спасли народ от гибели (убыль населения была нивелирована).
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
        Если количество навыков ПРОГРЕССА в ТЕКУЩЕЙ ЭПОХЕ (сейчас: ${gameState.skills.filter((s: any) => s.type === 'progress' && s.era === gameState.era).length}) достигло 25 И прошло минимум 200 лет с начала текущей эпохи (сейчас: ${gameState.eraYear} лет), ОБЯЗАТЕЛЬНО сгенерируйте НОВУЮ ЭПОХУ.
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

      const reply = await askProTalk(prompt);
      res.json({ reply });
    } catch (error: any) {
      console.error('[Server Error] generate-fate failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

startServer();
