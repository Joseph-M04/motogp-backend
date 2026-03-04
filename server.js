const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const fetch = require("node-fetch");

const app = express();
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "motogp_mvp",
});

app.use(cors());
app.use(express.json());

// Get all riders
app.get("/api/riders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
        rss2026.total_points as season_2026_points,
        rss2025.total_points as season_2025_points
      FROM riders r
      LEFT JOIN rider_season_stats rss2026 ON r.id = rss2026.rider_id AND rss2026.season = 2026
      LEFT JOIN rider_season_stats rss2025 ON r.id = rss2025.rider_id AND rss2025.season = 2025
      ORDER BY rss2025.total_points DESC NULLS LAST, r.number ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get rider by ID with full stats
app.get("/api/riders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await pool.query("SELECT * FROM riders WHERE id = $1", [id]);
    const seasonStats = await pool.query(
      "SELECT * FROM rider_season_stats WHERE rider_id = $1 AND season = 2026",
      [id],
    );
    const careerStats = await pool.query(
      "SELECT * FROM rider_career_stats WHERE rider_id = $1",
      [id],
    );

    res.json({
      ...rider.rows[0],
      seasonStats: seasonStats.rows[0],
      careerStats: careerStats.rows[0],
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all races for a season
app.get("/api/races", async (req, res) => {
  try {
    const { season = 2026 } = req.query;
    const result = await pool.query(
      `SELECT r.*, c.photo_url, c.track_length_km, c.turns, c.race_laps,
              c.top_speed_kmh, c.description, c.map_lat, c.map_lng,
              c.lap_record, c.lap_record_holder, c.lap_record_year, c.flag
       FROM races r
       LEFT JOIN circuits c ON r.circuit_id = c.id
       WHERE r.season = $1
       ORDER BY r.race_date ASC`,
      [season],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});
// Get next upcoming race with circuit details
app.get("/api/races/next", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.name as circuit_full_name, c.city, c.flag, c.track_length_km, 
             c.turns, c.race_laps, c.description, c.map_lat, c.map_lng, c.top_speed_kmh
      FROM races r
      LEFT JOIN circuits c ON r.circuit_id = c.id
      WHERE r.season = 2026 AND r.status = 'upcoming'
      ORDER BY r.race_date ASC
      LIMIT 1
    `);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get race results for a specific race
app.get("/api/races/:id/results", async (req, res) => {
  try {
    const { id } = req.params;
    const { session = 'race' } = req.query;
    const result = await pool.query(`
      SELECT rr.*, r.name as rider_name, r.number, r.team, r.country
      FROM race_results rr
      JOIN riders r ON rr.rider_id = r.id
      WHERE rr.race_id = $1 AND rr.session_type = $2
      ORDER BY rr.finish_position ASC NULLS LAST
    `, [id, session]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get last completed race with results
app.get("/api/races/last", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.flag
      FROM races r
      LEFT JOIN circuits c ON r.circuit_id = c.id
      WHERE r.season = 2026 AND r.status = 'completed'
      ORDER BY r.race_date DESC
      LIMIT 1
    `);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all circuits
app.get("/api/circuits", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM circuits ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Insights endpoint
app.post("/api/ai-insights", async (req, res) => {
  try {
    console.log("Received body:", req.body);

    const { riderName, riderNumber, team, totalPoints, wins, poles, podiums } =
      req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5-20251101",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are a MotoGP expert analyst. Provide insights for ${riderName} (#${riderNumber}) from ${team}.
            
Career Stats: ${totalPoints} points, ${wins} wins, ${podiums} podiums, ${poles} poles

Return ONLY valid JSON, no markdown or code blocks. Use this format:
{
  "bio": "2-3 sentence professional bio of the rider",
  "analysis": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["area 1", "area 2", "area 3"]
  },
  "prediction": "1-2 sentence prediction for their next race performance"
}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      console.error("Unexpected API response:", data);
      return res.status(500).json({ error: "Invalid API response" });
    }

    let content = data.content[0].text;
    console.log("Raw content:", content);

    content = content
      .replace(/^```[\w]*\n?/g, "")
      .replace(/\n?```$/g, "")
      .trim();

    console.log("Cleaned content:", content);

    const insights = JSON.parse(content);

    res.json(insights);
  } catch (error) {
    console.error("Parse error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Championship progression - points per rider per round
app.get("/api/championship/progression", async (req, res) => {
  try {
    const { season = 2026 } = req.query;
    const result = await pool.query(`
      SELECT rider_id, name, number, team, round, MAX(cumulative_points) as cumulative_points
      FROM (
        SELECT 
          r.id as rider_id, r.name, r.number, r.team,
          ra.round,
          SUM(rr.points) OVER (
            PARTITION BY r.id 
            ORDER BY ra.round, rr.session_type
            ROWS UNBOUNDED PRECEDING
          ) as cumulative_points
        FROM riders r
        JOIN race_results rr ON r.id = rr.rider_id
        JOIN races ra ON rr.race_id = ra.id
        WHERE ra.season = $1 AND rr.session_type IN ('race', 'sprint')
      ) sub
      GROUP BY rider_id, name, number, team, round
      ORDER BY round, cumulative_points DESC
    `, [season]);
    
    // Group by rider
    const riders = {};
    result.rows.forEach(row => {
      if (!riders[row.rider_id]) {
        riders[row.rider_id] = {
          rider_id: row.rider_id,
          name: row.name,
          number: row.number,
          team: row.team,
          rounds: []
        };
      }
      riders[row.rider_id].rounds.push({
        round: row.round,
        cumulative_points: parseInt(row.cumulative_points)
      });
    });
    
    res.json(Object.values(riders));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
