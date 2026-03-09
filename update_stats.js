require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:IfMUIfAvaXLYdOSHKKQEhPUXMTGYPafb@crossover.proxy.rlwy.net:35722/railway',
  ssl: { rejectUnauthorized: false }
});

const updates = [
  { match: 'Pedro Acosta',          pts: 32,  wins: 0,  poles: 1,  podiums: 12, fl: 1,  races: 43,  titles: 2 },
  { match: 'Marco Bezzecchi',       pts: 27,  wins: 10, poles: 9,  podiums: 31, fl: 8,  races: 91,  titles: 0 },
  { match: 'Raul Fernandez',        pts: 23,  wins: 1,  poles: 2,  podiums: 7,  fl: 2,  races: 76,  titles: 0 },
  { match: 'Jorge Martin',          pts: 18,  wins: 14, poles: 21, podiums: 47, fl: 14, races: 101, titles: 2 },
  { match: 'Ai Ogura',              pts: 17,  wins: 0,  poles: 1,  podiums: 3,  fl: 1,  races: 23,  titles: 0 },
  { match: 'Brad Binder',           pts: 13,  wins: 2,  poles: 1,  podiums: 20, fl: 5,  races: 111, titles: 1 },
  { match: 'Di Giannantonio',       pts: 12,  wins: 2,  poles: 2,  podiums: 8,  fl: 2,  races: 75,  titles: 0 },
  { match: 'Marc Marquez',          pts: 9,   wins: 65, poles: 74, podiums: 126,fl: 64, races: 210, titles: 9 },
  { match: 'Morbidelli',            pts: 8,   wins: 2,  poles: 3,  podiums: 15, fl: 5,  races: 130, titles: 1 },
  { match: 'Bagnaia',               pts: 8,   wins: 31, poles: 31, podiums: 78, fl: 25, races: 135, titles: 3 },
  { match: 'Luca Marini',           pts: 6,   wins: 0,  poles: 0,  podiums: 8,  fl: 1,  races: 85,  titles: 0 },
  { match: 'Zarco',                 pts: 5,   wins: 2,  poles: 8,  podiums: 15, fl: 8,  races: 170, titles: 2 },
  { match: 'Bastianini',            pts: 4,   wins: 7,  poles: 4,  podiums: 25, fl: 6,  races: 88,  titles: 0 },
  { match: 'Moreira',               pts: 3,   wins: 0,  poles: 0,  podiums: 0,  fl: 0,  races: 1,   titles: 0 },
  { match: 'Joan Mir',              pts: 3,   wins: 3,  poles: 2,  podiums: 25, fl: 4,  races: 110, titles: 1 },
  { match: 'Quartararo',            pts: 2,   wins: 10, poles: 18, podiums: 35, fl: 12, races: 112, titles: 1 },
  { match: 'Alex Rins',             pts: 1,   wins: 6,  poles: 6,  podiums: 28, fl: 8,  races: 150, titles: 0 },
  { match: 'Vinales',               pts: 0,   wins: 14, poles: 21, podiums: 62, fl: 18, races: 200, titles: 0 },
  { match: 'Razgatlioglu',          pts: 0,   wins: 0,  poles: 0,  podiums: 0,  fl: 0,  races: 1,   titles: 0 },
  { match: 'Jack Miller',           pts: 0,   wins: 7,  poles: 4,  podiums: 25, fl: 8,  races: 180, titles: 0 },
  { match: 'Pirro',                 pts: 0,   wins: 0,  poles: 1,  podiums: 2,  fl: 1,  races: 65,  titles: 0 },
  { match: 'Alex Marquez',          pts: 0,   wins: 4,  poles: 5,  podiums: 25, fl: 5,  races: 102, titles: 2 },
  { match: 'Aldeguer',              pts: 0,   wins: 0,  poles: 0,  podiums: 0,  fl: 0,  races: 22,  titles: 1 },
];

async function run() {
  const client = await pool.connect();
  try {
    const colCheck = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'riders'`);
    const cols = colCheck.rows.map(r => r.column_name);

    const toAdd = [
      ['season_2026_points', 'INTEGER DEFAULT 0'],
      ['career_wins',        'INTEGER DEFAULT 0'],
      ['career_poles',       'INTEGER DEFAULT 0'],
      ['career_podiums',     'INTEGER DEFAULT 0'],
      ['career_fastest_laps','INTEGER DEFAULT 0'],
      ['career_races',       'INTEGER DEFAULT 0'],
      ['world_titles',       'INTEGER DEFAULT 0'],
    ];
    for (const [col, type] of toAdd) {
      if (!cols.includes(col)) {
        await client.query(`ALTER TABLE riders ADD COLUMN ${col} ${type}`);
        console.log(`Added column: ${col}`);
      }
    }

    const { rows } = await client.query('SELECT id, name FROM riders');
    console.log(`\nFound ${rows.length} riders`);

    let updated = 0;
    for (const rider of rows) {
      const rLower = rider.name.toLowerCase();
      const match = updates.find(u => rLower.includes(u.match.toLowerCase()));
      if (match) {
        await client.query(`
          UPDATE riders SET
            season_2026_points = $1, career_wins = $2, career_poles = $3,
            career_podiums = $4, career_fastest_laps = $5, career_races = $6, world_titles = $7
          WHERE id = $8
        `, [match.pts, match.wins, match.poles, match.podiums, match.fl, match.races, match.titles, rider.id]);
        console.log(`✓ ${rider.name} → ${match.pts}pts, ${match.wins}W, ${match.poles}P, ${match.titles} titles`);
        updated++;
      } else {
        console.log(`✗ No match: ${rider.name}`);
      }
    }
    console.log(`\nDone! Updated ${updated}/${rows.length} riders`);
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(console.error);
