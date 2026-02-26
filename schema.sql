-- MotoGP Platform MVP - PostgreSQL Schema

-- Riders table
CREATE TABLE riders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  number INT UNIQUE NOT NULL,
  team VARCHAR(255),
  country VARCHAR(100),
  image_url VARCHAR(500),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Races table (calendar)
CREATE TABLE races (
  id SERIAL PRIMARY KEY,
  season INT NOT NULL,
  round INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  circuit_name VARCHAR(255) NOT NULL,
  circuit_country VARCHAR(100),
  circuit_length DECIMAL(5, 3),
  race_date DATE,
  qualifying_date DATE,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(season, round)
);

-- Race results
CREATE TABLE race_results (
  id SERIAL PRIMARY KEY,
  race_id INT NOT NULL REFERENCES races(id),
  rider_id INT NOT NULL REFERENCES riders(id),
  finish_position INT,
  grid_position INT,
  points INT,
  fastest_lap BOOLEAN DEFAULT FALSE,
  fastest_lap_time VARCHAR(50),
  pole_position BOOLEAN DEFAULT FALSE,
  pole_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(race_id, rider_id)
);

-- Rider season stats
CREATE TABLE rider_season_stats (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL REFERENCES riders(id),
  season INT NOT NULL,
  total_points INT DEFAULT 0,
  wins INT DEFAULT 0,
  podiums INT DEFAULT 0,
  poles INT DEFAULT 0,
  fastest_laps INT DEFAULT 0,
  races_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(rider_id, season)
);

-- Rider career stats
CREATE TABLE rider_career_stats (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL REFERENCES riders(id),
  total_points INT DEFAULT 0,
  wins INT DEFAULT 0,
  podiums INT DEFAULT 0,
  poles INT DEFAULT 0,
  fastest_laps INT DEFAULT 0,
  races_completed INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circuit stats (historical data)
CREATE TABLE circuit_stats (
  id SERIAL PRIMARY KEY,
  race_id INT NOT NULL REFERENCES races(id),
  winner_id INT REFERENCES riders(id),
  pole_holder_id INT REFERENCES riders(id),
  fastest_lap_holder_id INT REFERENCES riders(id),
  second_place_id INT REFERENCES riders(id),
  third_place_id INT REFERENCES riders(id),
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_races_season ON races(season);
CREATE INDEX idx_races_status ON races(status);
CREATE INDEX idx_rider_season_stats ON rider_season_stats(rider_id, season);
CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_rider ON race_results(rider_id);
CREATE INDEX idx_circuit_stats_year ON circuit_stats(year);
