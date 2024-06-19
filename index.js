require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3001;
const Phone = require("./models/phone");
let persons = [
  {
    id: "1",
    name: "Testing Keren",
    number: "123123123",
  },
  {
    id: "3",
    name: "Abraham",
    number: "12312323",
  },
  {
    id: "6",
    name: "asdfasdf",
    number: "12312321323232",
  },
];

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Custom token to log the body of POST requests
morgan.token("body", (req) => JSON.stringify(req.body));

// Use morgan with the custom token
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(express.static("dist"));
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
  Phone.find({}).then((phones) => {
    res.json(phones);
  });
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
  const thePerson = persons.find((person) => Number(person.id) === id);
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

  const thePerson = persons.find((person) => Number(person.id) === id);
  if (!thePerson) {
    return res.status(404).json({
      reason: "person not found",
    });
  }

  persons = persons.filter((person) => Number(person.id) !== id);
  return res.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;
  return (maxId + 1).toString();
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
