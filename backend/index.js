const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

// global database connection
async function start() {
    db = await sqlite.open({
        filename: "hockey.db",
        driver: sqlite3.Database
    });

    await db.exec("DROP TABLE IF EXISTS analytics");
    await db.exec("CREATE TABLE analytics (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, date TEXT, opponent TEXT, goals INTEGER, assists INTEGER, shots INTEGER)");
}

start();

// ROUTES


// ALL ITEMS


// get all stat items
app.get("/api", async(req, res) => {
    const received = await db.all("SELECT * FROM analytics");
    res.json(received);
});

// add a stat item
app.post("/api", async(req, res) => {
    //const id = req.params.id;
    const date = req.body.date;
    const opponent = req.body.opponent;
    const goals = req.body.goals;
    const assists = req.body.assists;
    const shots = req.body.shots;
    const result = await db.run("INSERT into analytics (date, opponent, goals, assists, shots) VALUES (?, ?, ?, ?, ?)", [date, opponent, goals, assists, shots]);
    res.json({status: "CREATE ENTRY SUCCESSFUL"});
});

// delete all stat items
app.delete("/api", async(req, res) => {
    const deleted = await db.run("DELETE from analytics");
    res.json({status: "DELETE COLLECTION SUCCESSFUL"});
});


// SINGULAR ITEMS


// get a single stat item
app.get("/api/:id", async(req, res) => {
    const id = req.params.id;
    const received = await db.get("SELECT * FROM analytics WHERE id = ?", [id]);
    res.json(received);
});

// update a single stat item
app.put("/api/:id", async(req, res) => {
    const id = req.params.id;
    const date = req.body.date;
    const opponent = req.body.opponent;
    const goals = req.body.goals;
    const assists = req.body.assists;
    const shots = req.body.shots;
    const updated = await db.run("UPDATE analytics SET date = ?, opponent = ?, goals = ?, assists = ?, shots = ? WHERE id = ?", [date, opponent, goals, assists, shots, id]);
    res.json({status: "UPDATE ITEM SUCCESSFUL"});
});

// delete a single stat item
app.delete("/api/:id", async (req, res) => {
    const id = req.params.id;
    const deleted = await db.run("DELETE FROM analytics WHERE id = ?", [id]);
    res.json({status: "DELETE ITEM SUCCESSFUL"});
});

// port 3001 web server
app.listen(3001, function() {
    console.log("Running on port 3001!");
});