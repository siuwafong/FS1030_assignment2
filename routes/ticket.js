const fs = require("fs");
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

module.exports = {
  createTicket: (req, res) => {
    let cust_id = req.params.id;
    console.log(cust_id);

    let createTicketQuery =
      "INSERT INTO tickets (acquired_time, est_support_time, ticket_status, created_by) VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'active', ?);";
    db.query(createTicketQuery, [cust_id]);
    let query =
      "SELECT ticket_no, DATE_FORMAT(acquired_time, '%H:%i, %d/%m/%Y') AS acquired_time, DATE_FORMAT(est_support_time, '%H:%i, %d/%m/%Y') AS est_support_time, ticket_status  FROM tickets WHERE ticket_status = 'active' AND created_by = ?";
    db.query(query, [cust_id], (err, result) => {
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
      db.query(query2, [cust_id], (err, result) => {
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
  },

  toggleTicket: (req, res) => {
    console.log(req.params.id);
    let ticket_no = req.params.id;
    let status = "";
    let toggleTicketQuery = "";

    let statusQuery = "SELECT ticket_status FROM tickets WHERE ticket_no = ?;";
    db.query(statusQuery, [ticket_no], (err, result) => {
      if (err) {
        throw err;
      }
      status = result.map(res => {
        return {
          ticket_status: res.ticket_status
        };
      });

      if (status[0]["ticket_status"] === "active") {
        toggleTicketQuery =
          "UPDATE tickets SET ticket_status = 'completed' WHERE ticket_no = ? ;";
      } else if (status[0]["ticket_status"] === "completed") {
        toggleTicketQuery =
          "UPDATE tickets SET ticket_status = 'active' WHERE ticket_no = ? ;";
      }
      db.query(toggleTicketQuery, [ticket_no], (err, result) => {
        if (err) {
          throw err;
        }
        res.redirect("/");
      });
    });
  },

  customer_login: (req, res) => {
    loginRequest = req.params.id;
    if (err) {
      throw err;
    }
    res.render(loginRequest);
  },

  register: (req, res) => {
    registerRequest = req.params.id;
    if (err) {
      throw err;
    }
    res.render(registerRequest);
  },

  redirectLogin: (req, res, next) => {
    if (!req.session.userId) {
      res.redirect("/customer_login");
    } else {
      next();
    }
  },

  redirectHome: (req, res, next) => {
    if (req.session.userId) {
      res.redirect("/register");
    } else {
      next();
    }
  },

  postMessage: (req, res) => {
    let cust_id = req.params.id;
    let message = req.body.message;
    console.log(cust_id + message);
    let createMessageQuery =
      "UPDATE ticket_details SET message = ? WHERE cust_id = ?;";
    db.query(createMessageQuery, [message, cust_id], (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("/" + cust_id);
    });
  }
};
