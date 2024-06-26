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

app.get("/api/persons/:id", (req, res, next) => {
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

app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    let thePhone = await Phone.findById(id);

    if (!thePhone) {
      throw new Error({ status: 404, message: "wrong id" });
    }

    await Phone.findByIdAndDelete(id);

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Missing name or number",
    });
  }

  const phone = new Phone({
    name: body.name,
    number: body.number,
  });

  phone.save().then((savedPhone) => {
    res.json(savedPhone);
  });
});

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error("errorHandler", error.message);

  if (error.status === 404) {
    return res.status(400).send(error.message);
  }
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
