const express = require("express");
const morgan = require("morgan");
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

// Middleware to parse JSON bodies
app.use(express.json());

// Custom token to log the body of POST requests
morgan.token("body", (req) => JSON.stringify(req.body));

// Use morgan with the custom token
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// Custom request logger middleware
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(requestLogger);

// Routes
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

  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) {
    return res.status(400).json({
      error: "Name must be unique",
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

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
