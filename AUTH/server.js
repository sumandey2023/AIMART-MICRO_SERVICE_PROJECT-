require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
require("dotenv").config();
const { connect } = require("./src/broker/broker");

// Connect to the database
connectDB();
connect();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
