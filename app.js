const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const app = express();
const session = require("express-session");

const db = mysql.createConnection({
  // Replace with user-appropriate values
  host: "localhost",
  user: "root",
  password: "uGotY0rked",
  database: "customer_support"
});

const {
  createTicket,
  toggleTicket,
  login,
  register,
  redirectLogin,
  postMessage
} = require("./routes/ticket");

const port = 3000;
app.set("port", process.env.port || port);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

app.use(
  session({
    name: "sid",
    resave: false,
    saveUnitialized: false,
    secret: "abcdef",
    cookie: {
      maxAge: 7200000,
      sameSite: true,
      secure: "production"
    }
  })
);

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected");
});

app.get("/:id", (req, res) => {
  const userID = req.params.id;

  if (userID === "register") {
    res.render("register");
  } else if (userID === "home") {
    res.render("home");
  } else if (userID === "customer_login") {
    res.render("customer_login");
  } else if (userID === "staff_login") {
    res.render("staff_login");
  } else {
    let query =
      "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets WHERE ticket_status = 'active' AND created_by = ? ORDER BY ticket_no DESC;";
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
        res.render("customer_page", {
          tickets: tickets,
          full_name: full_name
        });
      });
    });
  }
});

app.get("/", (req, res) => {
  let query =
    "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets ORDER BY ticket_no DESC";
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
    let query2 = "SELECT * FROM ticket_details;";
    db.query(query2, (err, result) => {
      if (err) {
        throw err;
      }
      const ticket_details = result.map(res => {
        return {
          cust_id: res.cust_id,
          message: res.message
        };
      });
      res.render("staff_page.ejs", {
        tickets: tickets,
        ticket_details: ticket_details
      });
    });
  });
});

app.get("/customer_login", (req, res) => {
  res.render("/customer_login");
});

app.get("/staff_login", (req, res) => {
  res.render("/staff_login");
});

app.post("/customer_login", (req, res) => {
  const { name, password } = req.body;
  let query = "SELECT * FROM customers WHERE customer_lname = ? AND pword = ?;";
  db.query(query, [name, password], (err, result) => {
    console.log(result.length);
    if (err) {
      throw err;
    } else if (result.length === 0) {
      console.log("no such user or wrong password");
      res.redirect("/customer_login");
    } else {
      const user = result.map(res => {
        return {
          userId: res.customer_id
        };
      });
      req.session.userId = user[0]["userId"];
      res.redirect("/" + req.session.userId);
    }
  });
});

app.post("/staff_login", (req, res) => {
  const { name, password } = req.body;
  console.log(req.body);
  let query = "SELECT * FROM staff WHERE staff_lname = ? AND pword = ?;";
  db.query(query, [name, password], (err, result) => {
    if (err) {
      throw err;
    } else if (result.length === 0) {
      console.log(typeof result);
      console.log("no such user or wrong password");
      res.redirect("/staff_login");
    } else {
      const user = result.map(res => {
        return {
          userId: res.staff_id
        };
      });
      req.session.userId = "staff";
      res.redirect("/");
    }
  });
});

app.post("/register", (req, res) => {
  const { lname, fname, password } = req.body;
  let query =
    "INSERT INTO customers (customer_lname, customer_fname, pword) VALUES (?, ?, ?);";
  db.query(query, [lname, fname, password], (err, result) => {
    if (err) {
      throw err;
    }
    let query2 = "SELECT * from CUSTOMERS ORDER BY customer_id DESC LIMIT 1;";

    db.query(query2, (req, result) => {
      console.log(result[0]["customer_id"]);
      if (err) {
        throw err;
      }
      console.log(result);
      const userID = Number(result[0]["customer_id"]);

      let createTicketQuery =
        "INSERT INTO tickets (acquired_time, est_support_time, ticket_status, created_by) VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', ?);";
      db.query(createTicketQuery, [userID]);

      //post blank message
      let postMessageQuery =
        "INSERT INTO ticket_details (cust_id, message) VALUES (?, '');";
      db.query(postMessageQuery, [userID]);

      let query =
        "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets WHERE ticket_status = 'active' AND created_by = ? ORDER BY ticket_no DESC;";
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
          res.render("customer_page", {
            tickets: tickets,
            full_name: full_name
          });
        });
      });
    });
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("/customer_login");
    }
    res.clearCookie("sid");
    res.redirect("/");
  });
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.post("/:id", createTicket);

app.get("/toggle/:id", toggleTicket);

app.post("/message/:id", postMessage);
