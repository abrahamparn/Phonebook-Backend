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
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
