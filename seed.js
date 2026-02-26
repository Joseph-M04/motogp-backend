const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motogp_mvp',
});

async function seedDatabase() {
  try {
    console.log('Starting database seed...\n');

    const riders = [
      { name: 'Pecco Bagnaia', number: 1, team: 'Ducati Corse', country: 'Italy' },
      { name: 'Marc Márquez', number: 93, team: 'Gresini Racing', country: 'Spain' },
      { name: 'Enea Bastianini', number: 23, team: 'Ducati Corse', country: 'Italy' },
      { name: 'Jorge Martín', number: 89, team: 'Prima Pramac Racing', country: 'Spain' },
      { name: 'Pedro Acosta', number: 31, team: 'Red Bull KTM Tech3', country: 'Spain' },
      { name: 'Franco Morbidelli', number: 21, team: 'Prima Pramac Racing', country: 'Italy' },
      { name: 'Alex Márquez', number: 73, team: 'Gresini Racing', country: 'Spain' },
      { name: 'Aleix Espargaró', number: 41, team: 'Aprilia Racing', country: 'Spain' },
      { name: 'Miguel Oliveira', number: 88, team: 'Trackhouse Racing', country: 'Portugal' },
      { name: 'Maverick Viñales', number: 12, team: 'Aprilia Racing', country: 'Spain' },
      { name: 'Fabio Quartararo', number: 20, team: 'Monster Energy Yamaha', country: 'France' },
      { name: 'Luca Marini', number: 10, team: 'Repsol Honda Team', country: 'Italy' },
    ];

    for (const rider of riders) {
      await pool.query(
        'INSERT INTO riders (name, number, team, country) VALUES ($1, $2, $3, $4) ON CONFLICT (number) DO NOTHING',
        [rider.name, rider.number, rider.team, rider.country]
      );
    }
    console.log(`✓ Inserted ${riders.length} riders`);

    const races = [
      { season: 2024, round: 1, name: 'Qatar Grand Prix', circuit_name: 'Lusail', circuit_country: 'Qatar', circuit_length: 5.380, race_date: '2024-02-25', qualifying_date: '2024-02-24', status: 'completed' },
      { season: 2024, round: 2, name: 'Indonesian Grand Prix', circuit_name: 'Mandalika', circuit_country: 'Indonesia', circuit_length: 4.305, race_date: '2024-03-03', qualifying_date: '2024-03-02', status: 'completed' },
      { season: 2024, round: 3, name: 'Argentine Grand Prix', circuit_name: 'Termas de Rio Hondo', circuit_country: 'Argentina', circuit_length: 4.808, race_date: '2024-03-17', qualifying_date: '2024-03-16', status: 'completed' },
      { season: 2024, round: 4, name: 'Americas Grand Prix', circuit_name: 'Circuit of the Americas', circuit_country: 'USA', circuit_length: 5.513, race_date: '2024-03-24', qualifying_date: '2024-03-23', status: 'completed' },
      { season: 2024, round: 5, name: 'Spanish Grand Prix', circuit_name: 'Jerez', circuit_country: 'Spain', circuit_length: 4.423, race_date: '2024-04-28', qualifying_date: '2024-04-27', status: 'completed' },
      { season: 2024, round: 6, name: 'French Grand Prix', circuit_name: 'Le Mans', circuit_country: 'France', circuit_length: 4.185, race_date: '2024-05-19', qualifying_date: '2024-05-18', status: 'completed' },
      { season: 2024, round: 7, name: 'Italian Grand Prix', circuit_name: 'Mugello', circuit_country: 'Italy', circuit_length: 5.245, race_date: '2024-06-02', qualifying_date: '2024-06-01', status: 'upcoming' },
      { season: 2024, round: 8, name: 'German Grand Prix', circuit_name: 'Sachsenring', circuit_country: 'Germany', circuit_length: 3.671, race_date: '2024-06-23', qualifying_date: '2024-06-22', status: 'upcoming' },
      { season: 2024, round: 9, name: 'Dutch Grand Prix', circuit_name: 'Assen', circuit_country: 'Netherlands', circuit_length: 4.542, race_date: '2024-06-30', qualifying_date: '2024-06-29', status: 'upcoming' },
      { season: 2024, round: 10, name: 'British Grand Prix', circuit_name: 'Silverstone', circuit_country: 'UK', circuit_length: 5.901, race_date: '2024-08-04', qualifying_date: '2024-08-03', status: 'upcoming' },
    ];

    for (const race of races) {
      await pool.query(
        `INSERT INTO races (season, round, name, circuit_name, circuit_country, circuit_length, race_date, qualifying_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (season, round) DO NOTHING`,
        [race.season, race.round, race.name, race.circuit_name, race.circuit_country, race.circuit_length, race.race_date, race.qualifying_date, race.status]
      );
    }
    console.log(`✓ Inserted ${races.length} races`);

    const riderResult = await pool.query('SELECT id, name FROM riders LIMIT 1');
    if (riderResult.rows.length === 0) {
      console.log('No riders found for stats');
      await pool.end();
      return;
    }

    const riderId = riderResult.rows[0].id;

    await pool.query(
      `INSERT INTO rider_season_stats (rider_id, season, total_points, wins, podiums, poles, fastest_laps, races_completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (rider_id, season) DO NOTHING`,
      [riderId, 2024, 245, 3, 8, 4, 2, 6]
    );

    await pool.query(
      `INSERT INTO rider_career_stats (rider_id, total_points, wins, podiums, poles, fastest_laps, races_completed) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (rider_id) DO UPDATE SET 
       total_points = EXCLUDED.total_points,
       wins = EXCLUDED.wins,
       podiums = EXCLUDED.podiums,
       poles = EXCLUDED.poles,
       fastest_laps = EXCLUDED.fastest_laps,
       races_completed = EXCLUDED.races_completed`,
      [riderId, 650, 12, 35, 15, 8, 150]
    );
    console.log('✓ Inserted sample stats');

    const raceResult = await pool.query('SELECT id FROM races WHERE season = 2024 AND round = 1');
    if (raceResult.rows.length > 0) {
      const raceId = raceResult.rows[0].id;

      await pool.query(
        `INSERT INTO race_results (race_id, rider_id, finish_position, grid_position, points, fastest_lap, pole_position) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (race_id, rider_id) DO NOTHING`,
        [raceId, riderId, 1, 1, 25, true, true]
      );
      console.log('✓ Inserted sample race result');
    }

    console.log('\n✓ Database seed completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
