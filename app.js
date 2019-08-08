const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "uGotY0rked",
  database: "fs1030_assignment_2"
});

// const { getHomePage } = require("./routes/index");

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

app.get("/", (req, res) => {
  let query = "SELECT * from book_copies";
  db.query(query, (err, result) => {
    if (err) {
      throw err;
    }
    const book_copies = result.map(res => {
      return {
        "book id": res.copies_book_id,
        "branch id": res.copies_branch_id,
        "# of copies": res.no_of_copies
      };
    });
    res.json(book_copies);
    console.log(result);
    // const book_copies = result;
    // res.render("index.ejs", {
    //   title: "Book List | Book Info",
    //   data: result
    // });
  });
});

db.query("SELECT * from book_copies", function(error, results, fields) {
  if (error) {
    throw error;
  }
  console.log("The solution is: ", results[2]);
});

// app.get("/", (req, res) => {
//   db.query("SELECT * from book_copies", function(error, results, fields) {
//     if (error) {
//       throw error;
//     }
//     console.log("The solution is: ", results[1]);
//     res.sendstatus(200);
//   });
// });
