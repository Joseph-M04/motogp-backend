const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'motogp_mvp',
});

async function scrapeRiderStats() {
  try {
    console.log('Fetching MotoGP rider stats from API...');
    
    // Fetch all riders
    const riderResponse = await axios.get('https://api.motogp.pulsar.sh/riders');
    const riders = riderResponse.data;
    
    console.log(`Found ${riders.length} riders`);
    
    // Fetch rider stats
    for (const rider of riders) {
      try {
        const statsResponse = await axios.get(`https://api.motogp.pulsar.sh/riders/${rider.id}/career-stats`);
        const stats = statsResponse.data;
        
        // Find rider in our database by name
        const dbResult = await pool.query(
          'SELECT id FROM riders WHERE LOWER(name) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($2)',
          [`%${rider.name.split(' ')[0]}%`, `%${rider.name.split(' ')[rider.name.split(' ').length - 1]}%`]
        );
        
        if (dbResult.rows.length > 0) {
          const riderId = dbResult.rows[0].id;
          
          const wins = stats.wins || 0;
          const poles = stats.poles || 0;
          const podiums = stats.podiums || 0;
          const totalPoints = stats.points || 0;
          
          // Check if career stats exist
          const careerCheck = await pool.query(
            'SELECT id FROM rider_career_stats WHERE rider_id = $1',
            [riderId]
          );
          
          if (careerCheck.rows.length > 0) {
            // Update existing
            await pool.query(
              `UPDATE rider_career_stats 
               SET wins = $1, poles = $2, podiums = $3, total_points = $4
               WHERE rider_id = $5`,
              [wins, poles, podiums, totalPoints, riderId]
            );
          } else {
            // Insert new
            await pool.query(
              `INSERT INTO rider_career_stats (rider_id, wins, poles, podiums, total_points)
               VALUES ($1, $2, $3, $4, $5)`,
              [riderId, wins, poles, podiums, totalPoints]
            );
          }
          
          console.log(`✓ Updated ${rider.name}: ${wins}W ${poles}P ${podiums}podiums ${totalPoints}pts`);
        } else {
          console.log(`✗ Could not find ${rider.name} in database`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error fetching stats for ${rider.name}:`, err.message);
      }
    }
    
    console.log('\n✓ Stats updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

scrapeRiderStats();
