require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

app.listen(3004, () => {
  console.log("Payment service is running on port 3004");
});
