const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motogp_mvp',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0]);
  }
});

// ============ RIDERS ENDPOINTS ============

// Get all riders
app.get('/api/riders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM riders ORDER BY number ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch riders' });
  }
});

// Get single rider with season and career stats
app.get('/api/riders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rider = await pool.query('SELECT * FROM riders WHERE id = $1', [id]);
    if (rider.rows.length === 0) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    const careerStats = await pool.query(
      'SELECT * FROM rider_career_stats WHERE rider_id = $1',
      [id]
    );

    // Get current season (2024 or latest)
    const currentSeason = 2024;
    const seasonStats = await pool.query(
      'SELECT * FROM rider_season_stats WHERE rider_id = $1 AND season = $2',
      [id, currentSeason]
    );

    res.json({
      rider: rider.rows[0],
      careerStats: careerStats.rows[0],
      seasonStats: seasonStats.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rider details' });
  }
});

// ============ CALENDAR/RACES ENDPOINTS ============

// Get all races for current season
app.get('/api/races', async (req, res) => {
  const season = req.query.season || 2024;
  try {
    const result = await pool.query(
      'SELECT * FROM races WHERE season = $1 ORDER BY round ASC',
      [season]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Get race details with results
app.get('/api/races/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const race = await pool.query('SELECT * FROM races WHERE id = $1', [id]);
    if (race.rows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }

    const results = await pool.query(
      `SELECT rr.*, r.name, r.number 
       FROM race_results rr
       JOIN riders r ON rr.rider_id = r.id
       WHERE rr.race_id = $1
       ORDER BY rr.finish_position ASC`,
      [id]
    );

    // Get circuit history (last 3 years)
    const circuit = race.rows[0].circuit_name;
    const season = race.rows[0].season;
    const history = await pool.query(
      `SELECT cs.*, 
              w.name as winner_name, w.number as winner_number,
              p.name as pole_name, p.number as pole_number,
              f.name as fastest_lap_name, f.number as fastest_lap_number,
              s2.name as second_place_name, s2.number as second_place_number,
              s3.name as third_place_name, s3.number as third_place_number
       FROM circuit_stats cs
       LEFT JOIN riders w ON cs.winner_id = w.id
       LEFT JOIN riders p ON cs.pole_holder_id = p.id
       LEFT JOIN riders f ON cs.fastest_lap_holder_id = f.id
       LEFT JOIN riders s2 ON cs.second_place_id = s2.id
       LEFT JOIN riders s3 ON cs.third_place_id = s3.id
       WHERE cs.year >= $1 - 3 AND cs.year < $1
       ORDER BY cs.year DESC`,
      [season]
    );

    res.json({
      race: race.rows[0],
      results: results.rows,
      history: history.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch race details' });
  }
});

// Get race results for a specific rider
app.get('/api/riders/:riderId/races/:season', async (req, res) => {
  const { riderId, season } = req.params;
  try {
    const result = await pool.query(
      `SELECT rr.*, r.name as race_name, r.circuit_name, r.race_date
       FROM race_results rr
       JOIN races r ON rr.race_id = r.id
       WHERE rr.rider_id = $1 AND r.season = $2
       ORDER BY r.race_date ASC`,
      [riderId, season]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rider race results' });
  }
});

// ============ SERVER START ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { pool, app };
