const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motogp_mvp',
});

async function updateCareerStats() {
  try {
    const data = JSON.parse(fs.readFileSync('career-stats-2026.json', 'utf8'));
    
    console.log('Updating career stats for all riders...\n');
    
    for (const rider of data.riders) {
      try {
        // Match by number only
        const result = await pool.query(
          'SELECT id FROM riders WHERE number = $1',
          [rider.number]
        );
        
        if (result.rows.length > 0) {
          const riderId = result.rows[0].id;
          
          await pool.query(
            `UPDATE rider_career_stats 
             SET wins = $1, poles = $2, podiums = $3, fastest_laps = $4, races_completed = $5, titles = $6
             WHERE rider_id = $7`,
            [rider.wins, rider.poles, rider.podiums, rider.fastest_laps, rider.races_completed, rider.titles, riderId]
          );
          
          console.log(`✓ #${rider.number}: ${rider.wins}W ${rider.poles}P ${rider.podiums}Podiums ${rider.titles}Titles`);
        } else {
          console.log(`✗ #${rider.number} - NOT FOUND`);
        }
      } catch (err) {
        console.error(`Error #${rider.number}:`, err.message);
      }
    }
    
    console.log('\n✓ Career stats updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateCareerStats();
