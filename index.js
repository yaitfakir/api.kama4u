require("dotenv").config();
const { API_PORT } = process.env;
const app = require("./app");

const port = process.env.PORT || API_PORT;

app.listen(port, () => console.log(`Server running on port ${port}`));
