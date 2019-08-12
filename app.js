const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const app = express();

const db = mysql.createConnection({
  // Replace with user-appropriate values
  host: "localhost",
  user: "root",
  password: "uGotY0rked",
  database: "customer_support"
});

const { createTicket, deleteTicket } = require("./routes/ticket");

const port = 3000;
app.set("port", process.env.port || port);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected");
});

app.get("/:id", (req, res) => {
  const userID = req.params.id;
  let query =
    "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets WHERE created_by = ?";
  db.query(query, [userID], (err, result) => {
    if (err) {
      throw err;
    }
    const tickets = result.map(res => {
      return {
        ticket_no: res.ticket_no,
        acquired_time: res.acquired_time,
        est_support_time: res.est_support_time,
        ticket_status: res.ticket_status
      };
    });
    let query2 =
      "SELECT CONCAT(customer_fname, ' ', customer_lname) AS full_name, customer_id from customers WHERE customer_id = ?;";
    db.query(query2, [userID], (err, result) => {
      if (err) {
        throw err;
      }
      const full_name = result.map(res => {
        return {
          full_name: res.full_name,
          customer_id: res.customer_id
        };
      });
      console.log(full_name[0]["customer_id"]);
      res.render("customer_page", {
        tickets: tickets,
        full_name: full_name
      });
    });
  });
});

app.get("/", (req, res) => {
  let query =
    "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets";
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    const tickets = result.map(res => {
      return {
        ticket_no: res.ticket_no,
        acquired_time: res.acquired_time,
        est_support_time: res.est_support_time,
        ticket_status: res.ticket_status
      };
    });
    res.render("staff_page.ejs", { tickets: tickets });
  });
});

app.post("/:id", createTicket);
app.get("/delete/:id", deleteTicket);
