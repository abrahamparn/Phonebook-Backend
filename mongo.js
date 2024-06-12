const mongoose = require("mongoose");

let DEFAULT_NUMBER = 0;

if (!process.argv[2]) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3] || "";
const phoneNumber = process.argv[4] || "";

console.log(password, name, phoneNumber);
const url = `mongodb+srv://fullstackopen:${password}@fullstackopen.0jnh2cm.mongodb.net/?retryWrites=true&w=majority&appName=fullstackopen`;
mongoose.set("strictQuery", false);

mongoose.connect(url);

const phoneSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});

const Phone = mongoose.model("Phone", phoneSchema);

async function getsLatestId() {
  const latestId = await Phone.findOne({}).sort("-id");

  if (!latestId) {
    return DEFAULT_NUMBER;
  }
  return latestId.id;
}
if (name !== "" && phoneNumber !== "") {
  getsLatestId()
    .then((latestId) => {
      const phone = new Phone({
        id: latestId + 1,
        name: name,
        number: phoneNumber,
      });

      phone
        .save()
        .then((result) => {
          console.log(`added ${result.name} number ${result.number}`);
          mongoose.connection.close();
        })
        .catch((err) => {
          console.error(err);
          mongoose.connection.close();
        });
    })
    .catch((err) => {
      console.error(err);
      mongoose.connection.close();
    });
} else {
  Phone.find({})
    .then((phones) => {
      console.log("phonebook: ");
      phones.forEach((phone) => {
        console.log(`${phone.name} ${phone.number}`);
      });
      mongoose.connection.close();
    })
    .catch((err) => {
      console.error(err);
      mongoose.connection.close();
    });
}
