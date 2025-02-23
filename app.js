const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables
const db = require("./config/db"); // MySQL connection pool

const app = express();
const port = 3000;

// Import route files
const loginRoutes = require("./routes/login");
const bookRoutes = require("./routes/book");
const studentRoutes = require("./routes/student");
const cors = require("cors");
const allowedOrigins = [
  "http://localhost:4200", // For local Angular dev
  "https://library2004.netlify.app/", // For your deployed frontend
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests if origin is in the list or it's a non-browser request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Middleware
app.use(bodyParser.json());

// // Use the routes (these must be functions, not objects)
app.use("/admin", loginRoutes); // Login API
app.use("/book", bookRoutes); // User Operations API
app.use("/student", studentRoutes);

db.getConnection((err, connection) => {
  console.log("in connection");
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Database connected successfully");
    connection.release(); // Release the connection back to the pool
  }
});
// Start the server
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
