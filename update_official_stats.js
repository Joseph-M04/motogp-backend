const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:IfMUIfAvaXLYdOSHKKQEhPUXMTGYPafb@crossover.proxy.rlwy.net:35722/railway',
  ssl: { rejectUnauthorized: false }
});

// 100% official stats from motogp.com/en/riders/motogp
const stats = [
  { name: 'Johann Zarco',            wins: 18, podiums: 64,  poles: 27, races: 304, titles: 2, height: 171, weight: 68 },
  { name: 'Toprak Razgatlıoğlu',     wins: 0,  podiums: 0,   poles: 0,  races: 1,   titles: 0, height: 185, weight: 80 },
  { name: 'Luca Marini',             wins: 6,  podiums: 17,  poles: 7,  races: 183, titles: 0, height: 184, weight: 69 },
  { name: 'Diogo Moreira',           wins: 5,  podiums: 13,  poles: 9,  races: 81,  titles: 1, height: 169, weight: 60 },
  { name: 'Maverick Viñales',        wins: 26, podiums: 75,  poles: 26, races: 263, titles: 1, height: 171, weight: 64 },
  { name: 'Fabio Quartararo',        wins: 12, podiums: 36,  poles: 24, races: 201, titles: 1, height: 177, weight: 69 },
  { name: 'Franco Morbidelli',       wins: 11, podiums: 29,  poles: 8,  races: 214, titles: 1, height: 176, weight: 68 },
  { name: 'Enea Bastianini',         wins: 13, podiums: 51,  poles: 11, races: 213, titles: 1, height: 168, weight: 64 },
  { name: 'Raul Fernandez',          wins: 11, podiums: 19,  poles: 13, races: 139, titles: 0, height: 178, weight: 65 },
  { name: 'Brad Binder',             wins: 17, podiums: 46,  poles: 7,  races: 260, titles: 1, height: 170, weight: 63 },
  { name: 'Joan Mir',                wins: 12, podiums: 35,  poles: 2,  races: 177, titles: 2, height: 181, weight: 69 },
  { name: 'Pedro Acosta',            wins: 16, podiums: 38,  poles: 6,  races: 98,  titles: 2, height: 171, weight: 63 },
  { name: 'Alex Rins',               wins: 18, podiums: 58,  poles: 17, races: 234, titles: 0, height: 176, weight: 68 },
  { name: 'Jack Miller',             wins: 10, podiums: 33,  poles: 10, races: 255, titles: 0, height: 173, weight: 64 },
  { name: 'Fabio Di Giannantonio',   wins: 4,  podiums: 28,  poles: 2,  races: 187, titles: 0, height: 177, weight: 62 },
  { name: 'Fermin Aldeguer',         wins: 9,  podiums: 15,  poles: 9,  races: 96,  titles: 0, height: 181, weight: 69 },
  { name: 'Francesco Bagnaia',       wins: 41, podiums: 82,  poles: 34, races: 235, titles: 3, height: 176, weight: 64 },
  { name: 'Marco Bezzecchi',         wins: 13, podiums: 43,  poles: 14, races: 175, titles: 0, height: 176, weight: 64 },
  { name: 'Alex Marquez',            wins: 15, podiums: 55,  poles: 17, races: 247, titles: 2, height: 180, weight: 65 },
  { name: 'Ai Ogura',                wins: 6,  podiums: 27,  poles: 6,  races: 130, titles: 1, height: 169, weight: 60 },
  { name: 'Jorge Martin',            wins: 18, podiums: 60,  poles: 41, races: 181, titles: 2, height: 168, weight: 63 },
  { name: 'Marc Marquez',            wins: 99, podiums: 165, poles: 102,races: 286, titles: 9, height: 169, weight: 64 },
];

async function run() {
  const client = await pool.connect();
  try {
    // Ensure fastest_laps column exists (not on official site, keep as-is)
    let updated = 0;
    for (const s of stats) {
      const res = await client.query(
        `UPDATE riders SET
          career_wins = $1,
          career_podiums = $2,
          career_poles = $3,
          career_races = $4,
          world_titles = $5,
          height_cm = $6,
          weight_kg = $7
        WHERE name = $8`,
        [s.wins, s.podiums, s.poles, s.races, s.titles, s.height, s.weight, s.name]
      );
      if (res.rowCount > 0) {
        console.log(`✓ ${s.name}: ${s.wins}W / ${s.podiums} podiums / ${s.poles}P / ${s.races} races / ${s.titles} titles`);
        updated++;
      } else {
        console.log(`✗ Not found: ${s.name}`);
      }
    }
    console.log(`\nDone! ${updated}/22 riders updated`);
  } finally {
    client.release();
    await pool.end();
  }
}
run().catch(console.error);
