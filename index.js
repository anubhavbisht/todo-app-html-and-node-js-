const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(bodyParser.json());
const portNumber = 3000;
const dbPath = path.join(process.cwd(), "database.json");
const htmlPath = path.join(process.cwd(), "index.html");

const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return data;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

const writeFile = async (filePath, content) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    console.error("Error writing file:", error);
    throw error;
  }
};

app.get("/todos", async (req, res) => {
  try {
    const fileData = await readFile(dbPath);
    const persistedDatainDb = JSON.parse(fileData) || [];
    res.status(200).json(persistedDatainDb);
  } catch (e) {
    console.error("Error in get route /todos", e);
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fileData = await readFile(dbPath);
    const persistedDatainDb = JSON.parse(fileData) || [];
    const toDoItem = persistedDatainDb.find((x) => x.id === id);
    if (toDoItem) {
      res.status(200).json(toDoItem);
    } else {
      res.status(404).send("Not found");
    }
  } catch (e) {
    console.error("Error in get route /todos", e);
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).send("title is missing for todo");
    }
    if (!description) {
      res.status(400).send("description is missing for todo");
    }
    const genId = uuidv4();
    const newToDo = {
      id: genId,
      ["title"]: title,
      ["description"]: description,
    };
    const fileData = await readFile(dbPath);
    const persistedDatainDb = JSON.parse(fileData) || [];
    persistedDatainDb.push(newToDo);
    await writeFile(dbPath, JSON.stringify(persistedDatainDb));
    res.status(201).json({ id: genId });
  } catch (e) {
    console.error("Error in post route /todos", e);
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!id) {
      res.status(400).send("id is missing for todo update");
    }
    if (!title) {
      res.status(400).send("title is missing for todo update");
    }
    if (!description) {
      res.status(400).send("description is missing for todo update");
    }
    const fileData = await readFile(dbPath);
    const persistedDatainDb = JSON.parse(fileData) || [];
    let toDoFound = false;
    for (let i = 0; i < persistedDatainDb.length; i++) {
      if (persistedDatainDb[i].id === id) {
        persistedDatainDb[i].title = title;
        persistedDatainDb[i].description = description;
        toDoFound = true;
        break;
      }
    }
    if (!toDoFound) {
      res.status(404).send("Not found");
    }
    await writeFile(dbPath, JSON.stringify(persistedDatainDb));
    res.status(200).send("Updated");
  } catch (e) {
    console.error("Error in put route /todos/:id", e);
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).send("id is missing for todo update");
    }
    const fileData = await readFile(dbPath);
    const persistedDatainDb = JSON.parse(fileData) || [];
    let newPersistedDatainDb = persistedDatainDb.filter((x) => x.id !== id);
    if (newPersistedDatainDb.length === persistedDatainDb.length) {
      res.status(404).send("Not found");
    }
    await writeFile(dbPath, JSON.stringify(newPersistedDatainDb));
    res.status(200).send("Deleted");
  } catch (e) {
    console.error("Error in put route /todos/:id", e);
  }
});

app.get("/", (req, res) => {
  res.sendFile(htmlPath);
});

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(portNumber, () => {
  console.log(`Server running on port::${portNumber}`);
});

module.exports = app;
