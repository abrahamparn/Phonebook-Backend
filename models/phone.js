require("dotenv").config;
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("error connecting to mongdb:", error.message);
  });

const phoneSchema = new mongoose.Schema({
  id: Number,
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\d{2,3})-\d{4,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

phoneSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Phone", phoneSchema);
