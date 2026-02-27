const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "motogp_mvp",
});

async function seedDatabase() {
  try {
    console.log("Starting 2026 MotoGP database seed...\n");

    const riders = [
      {
        name: "Francesco Bagnaia",
        number: 1,
        team: "Ducati Lenovo",
        country: "Italy",
      },
      {
        name: "Marc Marquez",
        number: 93,
        team: "Ducati Lenovo",
        country: "Spain",
      },
      {
        name: "Jorge Martin",
        number: 89,
        team: "Aprilia Racing",
        country: "Spain",
      },
      {
        name: "Marco Bezzecchi",
        number: 27,
        team: "Aprilia Racing",
        country: "Italy",
      },
      {
        name: "Pedro Acosta",
        number: 31,
        team: "Red Bull KTM Factory",
        country: "Spain",
      },
      {
        name: "Brad Binder",
        number: 33,
        team: "Red Bull KTM Factory",
        country: "South Africa",
      },
      {
        name: "Enea Bastianini",
        number: 23,
        team: "Red Bull KTM Tech3",
        country: "Italy",
      },
      {
        name: "Maverick Vinales",
        number: 12,
        team: "Red Bull KTM Tech3",
        country: "Spain",
      },
      {
        name: "Fabio di Giannantonio",
        number: 49,
        team: "Pertamina Enduro VR46",
        country: "Italy",
      },
      {
        name: "Franco Morbidelli",
        number: 21,
        team: "Pertamina Enduro VR46",
        country: "Italy",
      },
      {
        name: "Alex Marquez",
        number: 73,
        team: "Gresini Racing",
        country: "Spain",
      },
      {
        name: "Fermin Aldeguer",
        number: 11,
        team: "Gresini Racing",
        country: "Spain",
      },
      {
        name: "Fabio Quartararo",
        number: 20,
        team: "Monster Energy Yamaha",
        country: "France",
      },
      {
        name: "Alex Rins",
        number: 42,
        team: "Monster Energy Yamaha",
        country: "Spain",
      },
      {
        name: "Miguel Oliveira",
        number: 88,
        team: "Prima Pramac Yamaha",
        country: "Portugal",
      },
      {
        name: "Jack Miller",
        number: 43,
        team: "Prima Pramac Yamaha",
        country: "Australia",
      },
      {
        name: "Joan Mir",
        number: 36,
        team: "Castrol Honda Racing",
        country: "Spain",
      },
      {
        name: "Luca Marini",
        number: 10,
        team: "Castrol Honda Racing",
        country: "Italy",
      },
      { name: "Johann Zarco", number: 5, team: "LCR Honda", country: "France" },
      {
        name: "Somkiat Chantra",
        number: 64,
        team: "Idemitsu LCR Honda",
        country: "Thailand",
      },
      {
        name: "Raul Fernandez",
        number: 25,
        team: "Trackhouse Racing",
        country: "Spain",
      },
      {
        name: "Ai Ogura",
        number: 79,
        team: "Trackhouse Racing",
        country: "Japan",
      },
    ];

    for (const rider of riders) {
      await pool.query(
        "INSERT INTO riders (name, number, team, country) VALUES ($1, $2, $3, $4) ON CONFLICT (number) DO UPDATE SET team = $3, country = $4",
        [rider.name, rider.number, rider.team, rider.country],
      );
    }
    console.log(`✓ Inserted/Updated ${riders.length} riders for 2026`);

    const races = [
      {
        season: 2026,
        round: 1,
        name: "Thai Grand Prix",
        circuit_name: "Buriram",
        circuit_country: "Thailand",
        circuit_length: 4.554,
        race_date: "2026-03-02",
        qualifying_date: "2026-03-01",
        status: "completed",
      },
      {
        season: 2026,
        round: 2,
        name: "Brazil Grand Prix",
        circuit_name: "Goiania",
        circuit_country: "Brazil",
        circuit_length: 4.321,
        race_date: "2026-03-16",
        qualifying_date: "2026-03-15",
        status: "completed",
      },
      {
        season: 2026,
        round: 3,
        name: "American Grand Prix",
        circuit_name: "Circuit of the Americas",
        circuit_country: "USA",
        circuit_length: 5.513,
        race_date: "2026-04-06",
        qualifying_date: "2026-04-05",
        status: "completed",
      },
      {
        season: 2026,
        round: 4,
        name: "Qatar Grand Prix",
        circuit_name: "Lusail",
        circuit_country: "Qatar",
        circuit_length: 5.38,
        race_date: "2026-04-20",
        qualifying_date: "2026-04-19",
        status: "completed",
      },
      {
        season: 2026,
        round: 5,
        name: "Spanish Grand Prix",
        circuit_name: "Jerez",
        circuit_country: "Spain",
        circuit_length: 4.423,
        race_date: "2026-05-04",
        qualifying_date: "2026-05-03",
        status: "completed",
      },
      {
        season: 2026,
        round: 6,
        name: "British Grand Prix",
        circuit_name: "Silverstone",
        circuit_country: "UK",
        circuit_length: 5.901,
        race_date: "2026-05-18",
        qualifying_date: "2026-05-17",
        status: "completed",
      },
      {
        season: 2026,
        round: 7,
        name: "Catalan Grand Prix",
        circuit_name: "Barcelona",
        circuit_country: "Spain",
        circuit_length: 4.657,
        race_date: "2026-06-01",
        qualifying_date: "2026-05-31",
        status: "completed",
      },
      {
        season: 2026,
        round: 8,
        name: "French Grand Prix",
        circuit_name: "Le Mans",
        circuit_country: "France",
        circuit_length: 4.185,
        race_date: "2026-06-15",
        qualifying_date: "2026-06-14",
        status: "completed",
      },
      {
        season: 2026,
        round: 9,
        name: "German Grand Prix",
        circuit_name: "Sachsenring",
        circuit_country: "Germany",
        circuit_length: 3.671,
        race_date: "2026-07-06",
        qualifying_date: "2026-07-05",
        status: "completed",
      },
      {
        season: 2026,
        round: 10,
        name: "Czech Grand Prix",
        circuit_name: "Brno",
        circuit_country: "Czechia",
        circuit_length: 5.426,
        race_date: "2026-07-20",
        qualifying_date: "2026-07-19",
        status: "completed",
      },
      {
        season: 2026,
        round: 11,
        name: "Austrian Grand Prix",
        circuit_name: "Red Bull Ring",
        circuit_country: "Austria",
        circuit_length: 5.243,
        race_date: "2026-08-17",
        qualifying_date: "2026-08-16",
        status: "completed",
      },
      {
        season: 2026,
        round: 12,
        name: "Dutch Grand Prix",
        circuit_name: "Assen",
        circuit_country: "Netherlands",
        circuit_length: 4.542,
        race_date: "2026-08-31",
        qualifying_date: "2026-08-30",
        status: "completed",
      },
      {
        season: 2026,
        round: 13,
        name: "Aragon Grand Prix",
        circuit_name: "Aragon",
        circuit_country: "Spain",
        circuit_length: 5.344,
        race_date: "2026-09-14",
        qualifying_date: "2026-09-13",
        status: "completed",
      },
      {
        season: 2026,
        round: 14,
        name: "San Marino Grand Prix",
        circuit_name: "Misano",
        circuit_country: "Italy",
        circuit_length: 4.226,
        race_date: "2026-09-21",
        qualifying_date: "2026-09-20",
        status: "completed",
      },
      {
        season: 2026,
        round: 15,
        name: "Indonesian Grand Prix",
        circuit_name: "Mandalika",
        circuit_country: "Indonesia",
        circuit_length: 4.305,
        race_date: "2026-10-05",
        qualifying_date: "2026-10-04",
        status: "completed",
      },
      {
        season: 2026,
        round: 16,
        name: "Japanese Grand Prix",
        circuit_name: "Motegi",
        circuit_country: "Japan",
        circuit_length: 4.801,
        race_date: "2026-10-19",
        qualifying_date: "2026-10-18",
        status: "completed",
      },
      {
        season: 2026,
        round: 17,
        name: "Australian Grand Prix",
        circuit_name: "Phillip Island",
        circuit_country: "Australia",
        circuit_length: 4.445,
        race_date: "2026-11-02",
        qualifying_date: "2026-11-01",
        status: "completed",
      },
      {
        season: 2026,
        round: 18,
        name: "Malaysian Grand Prix",
        circuit_name: "Sepang",
        circuit_country: "Malaysia",
        circuit_length: 5.543,
        race_date: "2026-11-16",
        qualifying_date: "2026-11-15",
        status: "completed",
      },
      {
        season: 2026,
        round: 19,
        name: "Hungarian Grand Prix",
        circuit_name: "Balaton Park",
        circuit_country: "Hungary",
        circuit_length: 4.381,
        race_date: "2026-10-26",
        qualifying_date: "2026-10-25",
        status: "upcoming",
      },
      {
        season: 2026,
        round: 20,
        name: "Portuguese Grand Prix",
        circuit_name: "Portimao",
        circuit_country: "Portugal",
        circuit_length: 5.592,
        race_date: "2026-11-23",
        qualifying_date: "2026-11-22",
        status: "upcoming",
      },
      {
        season: 2026,
        round: 21,
        name: "Valencia Grand Prix",
        circuit_name: "Valencia",
        circuit_country: "Spain",
        circuit_length: 4.005,
        race_date: "2026-11-30",
        qualifying_date: "2026-11-29",
        status: "upcoming",
      },
    ];

    for (const race of races) {
      await pool.query(
        `INSERT INTO races (season, round, name, circuit_name, circuit_country, circuit_length, race_date, qualifying_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (season, round) DO UPDATE SET name = $3, status = $9`,
        [
          race.season,
          race.round,
          race.name,
          race.circuit_name,
          race.circuit_country,
          race.circuit_length,
          race.race_date,
          race.qualifying_date,
          race.status,
        ],
      );
    }
    console.log(`✓ Inserted ${races.length} races for 2026`);

    console.log("\n✓ 2026 MotoGP database seed completed successfully!");
  } catch (err) {
    console.error("Error seeding database:", err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
