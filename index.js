require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3001;
const Phone = require("./models/phone");

app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Custom token to log the body of POST requests
morgan.token("body", (req) => JSON.stringify(req.body));

// Use morgan with the custom token
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// Use the build front end
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

app.get("/info", async (req, res) => {
  try {
    const peopleCount = await Phone.countDocuments({});
    const currentDate = new Date();
    res.send(`<p>Phonebook has info for ${peopleCount} people</p>
      <br/>
      <p>${currentDate}</p>
    `);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch info" });
  }
});

// Routes
app.get("/api/persons", (req, res) => {
  Phone.find({}).then((phones) => {
    res.json(phones);
  });
});

app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const thePerson = await Phone.findById(id);
    if (!thePerson) {
      throw new Error({ status: 404, message: "person not found" });
    }
    return res.json(thePerson);
  } catch (err) {
    next(err);
  }
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

app.post("/api/persons", async (req, res, next) => {
  try {
    const body = req.body;

    if (!body.name || !body.number) {
      throw new Error({ status: 404, message: "name or number is empty" });
    }

    let exists = await Phone.findOne({ name: body.name });
    if (exists) {
      // Redirect to PUT endpoint to update the existing entry
      req.params.id = exists._id.toString(); // Set the ID parameter for the PUT request
      req.body = { number: body.number }; // Set the body for the PUT request
      return updatePerson(req, res, next); // Call the PUT handler
    }
    const phone = new Phone({
      name: body.name,
      number: body.number,
    });

    let result = await phone.save();
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

const updatePerson = async (req, res, next) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const updatedPhone = {
      number: body.number,
    };

    const updatedPerson = await Phone.findByIdAndUpdate(id, updatedPhone, {
      new: true,
    });
    if (!updatedPerson) {
      return res.status(404).json({ error: "person not found" });
    }
    return res.json(updatedPerson);
  } catch (err) {
    next(err);
  }
};

app.put("/api/persons/:id", updatePerson);

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error("errorHandler", error.message);

  if (error.status) {
    return res.status(error.status).send({ error: error.message });
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
