import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import { config } from "dotenv";

config();

const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  password: process.env.PG_PASSWORD,
  database: "books",
  port: 5432,
});

db.connect();

let books = [];

app.get("/", async (req, res) =>{
  try{
    const result = await db.query("SELECT * FROM books"); 
    books = result.rows;
    res.render("index.ejs",{books: books});
  } catch(err){
    console.log("error fetching books", err);
    res.status(500).send("internal server error");
  }
});

app.post("/add", async (req, res) =>{
  try{
    const response = await db.query("INSERT INTO books (book_name, isbn, author,date_finished, rating, review) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      req.body.name,
      req.body.isbn,
      req.body.author,
      req.body.date,
      req.body.rating,
      req.body.review
    ]);

    res.redirect("/");
  }catch(err){
    console.log("error adding book", err);
    res.status(500).send("internal server error");
}
});

app.post("/new", (req, res) => {
  res.render("add.ejs");
  });


app.post("/edit", (req, res) =>{
    const updatedBookId = req.body.bookId;
    res.render("edit.ejs", {bookId: updatedBookId});
    });

app.post("/update", async (req, res) =>{
  try{
      await db.query(
        "UPDATE books SET book_name = $1, isbn = $2, author = $3, date_finished = $4, rating = $5, review = $6 WHERE id = $7",
        [
          req.body.name,
          req.body.isbn,
          req.body.author,
          req.body.date,
          req.body.rating,
          req.body.review,
          req.body.editedBookId
        ]
      );
  
      res.redirect("/");
  } catch (error) {
    console.error("Error updating book", error);
    res.status(500).send("Internal Server Error");
  } 
});

app.post("/delete", async (req, res) => {
  const deletedBookId = req.body.bookId;
  await db.query("DELETE FROM books WHERE id = $1",[deletedBookId]);
  res.redirect("/");
  });

  app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
