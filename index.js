const express = require("express");
const app = express();
const PORT = 3001;

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const people = persons.length;
  const currentDate = new Date();
  res.send(`<p>Phonebook has info for ${people} people</p>
    <br/>
    <p>${currentDate}</p>
    `);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      reason: "id must be a number",
    });
  }
  const thePerson = persons.find((person) => person.id === id);
  if (!thePerson) {
    return res.status(404).json({
      reason: "person not found",
    });
  }
  return res.json(thePerson);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      reason: "id must be a number",
    });
  }

  const thePerson = persons.find((person) => person.id === id);
  if (!thePerson) {
    return res.status(404).json({
      reason: "person not found",
    });
  }

  persons = persons.filter((person) => person.id !== id);
  return res.status(204).end();
});
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};
app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Missing name or number",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);
  return res.json(person);
});
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
