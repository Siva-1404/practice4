const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const teams = await db.all(playersQuery);
  //console.log(teams);
  let resultTeam = [];
  for (let i = 0; i < teams.length; i++) {
    resultTeam.push(convertDbObjectToResponseObject(teams[i]));
  }
  response.send(resultTeam);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES
    (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayer);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(playersQuery);
  //console.log(teams);
  response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = updatePlayerDetails;
  const updatePlayer = `
    UPDATE
        cricket_team
    SET
        player_name='${playerName}',
        jersey_number='${jerseyNumber}',
        role='${role}'
    WHERE 
    player_id =${playerId};`;

  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayer);
  //console.log(teams);
  response.send("Player Removed");
});

module.exports = app;
