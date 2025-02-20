const express = require("express");
const router = express.Router();
const db = require("../config/db");
// 1. Get all users
router.get("/getBooks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM book where is_delete ='N'");
    res.json({ status: "success", result: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch books" });
  }
});

// 2. Create a new user
router.post("/createBook", async (req, res) => {
  const { bookName, bookPublication, purchasedDate, price, quantity } =
    req.body;

  try {
    // Create a connection to the database

    // Define the SQL insert query
    const sql = `INSERT INTO book (
                        bookName, 
                        bookPublication, 
                        purchasedDate, 
                        price, 
                        quantity, 
                        is_delete, 
                        createdAt
                     ) 
                     VALUES (?, ?, ?, ?, ?, 'N', NOW())`;

    // Define the values to be inserted
    const values = [bookName, bookPublication, purchasedDate, price, quantity];

    // Execute the query
    const [result] = await db.query(sql, values);

    // Respond with the inserted ID
    res.status(201).json({
      message: "Book created successfully",
      bookId: result.insertId,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user", status: "failed" });
  }
});

//3. Update User
router.post("/updateBook", async (req, res) => {
  const { b_id, bookName, bookPublication, purchasedDate, price, quantity } =
    req.body;
  console.log(req.body);
  if (!b_id) {
    return res
      .status(400)
      .json({ status: "failed", error: "book id is required" });
  }

  try {
    const query = `
      UPDATE book 
      SET 
        bookName = ?, 
        bookPublication = ?, 
        purchasedDate = ?, 
        price = ?, 
        quantity = ?
       
      WHERE b_id = ?;
    `;
    const values = [
      bookName,
      bookPublication,
      purchasedDate,
      price,
      quantity,
      b_id,
    ];

    // Execute the query
    const [result] = await db.query(query, values);

    // Execute the query

    // Check if the user was updated
    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Book updated successfully" });
    } else {
      console.log(result);
      res.status(404).json({ status: "failed", error: "Book not found" });
    }
  } catch (err) {
    // Handle errors
    res.status(500).json({ status: "failed", error: "Failed to update book" });
  }
});

//4. get user by ID
router.post("/getBookById", async (req, res) => {
  const { b_id } = req.body; // Get user_id from the request body

  // Check if user_id is provided
  if (!b_id) {
    return res
      .status(400)
      .json({ status: "failed", message: "book id is required" });
  }

  try {
    const query = "SELECT * FROM book WHERE b_id = ?";

    // Execute the query
    const [rows] = await db.query(query, [b_id]);

    // Check if the user was found
    if (rows.length > 0) {
      res.json({ status: "success", book: rows[0] });
    } else {
      res.status(404).json({ status: "failed", message: "Book not found" });
    }
  } catch (err) {
    // Handle errors
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ status: "failed", message: "Failed to retrieve book" });
  }
});

//5. Delete User By Id
router.post("/deleteBookById", async (req, res) => {
  const { b_id } = req.body; // Get user_id from the request body

  // Check if user_id is provided
  if (!b_id) {
    return res
      .status(400)
      .json({ status: "failed", message: "book id is required" });
  }

  try {
    const query = 'UPDATE book SET is_delete = "Y" WHERE b_id = ?';

    // Execute the query
    const [result] = await db.query(query, [b_id]);

    // Check if the user was updated
    if (result.affectedRows > 0) {
      res.json({
        status: "success",
        message: "Book deleted successfully",
      });
    } else {
      res.status(404).json({ status: "failed", message: "Book not found" });
    }
  } catch (err) {
    // Handle errors
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ status: "failed", message: "Failed to mark book as deleted" });
  }
});
router.get("/getIssueBooks", async (req, res) => {
  try {
    const query = `
    SELECT 
      b.b_id,
      b.bookName,
      b.bookPublication,
      b.issuedDate,
      s.stud_id,
      s.enrollmentNo,
      s.studentName,
      d.name AS depatmentName
    FROM 
      book b
    JOIN
      student s ON b.stud_id = s.stud_id
    JOIN
      department d ON s.departmentId = d.department_id
    WHERE 
      b.is_delete = 'N' AND b.status = 'I'
  `;
    const [rows] = await db.query(query);
    res.json({ status: "success", result: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch books" });
  }
});
router.post("/getIssueReturnBooksById", async (req, res) => {
  const { b_id, stud_id } = req.body;
  try {
    const query = `
    SELECT 
      b.b_id,
      b.bookName,
      b.issuedDate,
      b.returnDate,
      s.stud_id,
      s.enrollmentNo,
      s.studentName,
      s.contact,
      s.departmentId,
      s.semesterId,
      s.email
     
    FROM 
      book b
    JOIN
      student s ON b.stud_id = s.stud_id
    
    WHERE 
      b.b_id = ? AND b.stud_id = ?
  `;
    const [result] = await db.query(query, [b_id, stud_id]);

    res.json({ status: "success", result: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch books" });
  }
});
router.post("/issueBook", async (req, res) => {
  const { b_id, stud_id, issuedDate } = req.body;
  console.log(req.body);
  if (!b_id) {
    return res
      .status(400)
      .json({ status: "failed", error: "book id is required" });
  }

  try {
    const query = `
      UPDATE book 
      SET 
        stud_id = ?, 
        issuedDate = ?, 
        status = ?
       
       
      WHERE b_id = ?;
    `;
    const values = [stud_id, issuedDate, "I", b_id];

    // Execute the query
    const [result] = await db.query(query, values);

    // Execute the query

    // Check if the user was updated
    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Book Issued successfully" });
    } else {
      console.log(result);
      res.status(404).json({ status: "failed", error: "Book not found" });
    }
  } catch (err) {
    // Handle errors
    res.status(500).json({ status: "failed", error: "Failed to Issue book" });
  }
});
router.get("/getReturnBooks", async (req, res) => {
  try {
    const query = `
    SELECT 
      b.b_id,
      b.bookName,
      b.bookPublication,
      b.issuedDate,
      b.returnDate,
      s.stud_id,
      s.enrollmentNo,
      s.studentName,
      d.name AS depatmentName
    FROM 
      book b
    JOIN
      student s ON b.stud_id = s.stud_id
    JOIN
      department d ON s.departmentId = d.department_id
    WHERE 
      b.is_delete = 'N' AND b.status = 'R'
  `;
    const [rows] = await db.query(query);
    res.json({ status: "success", result: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch books" });
  }
});
router.post("/returnBook", async (req, res) => {
  const { b_id, stud_id, returnDate } = req.body;
  console.log(req.body);
  if (!b_id) {
    return res
      .status(400)
      .json({ status: "failed", error: "book id is required" });
  }

  try {
    const query = `
      UPDATE book 
      SET 
        returnDate = ?, 
        status = ?
       
       
      WHERE b_id = ?;
    `;
    const values = [returnDate, "R", b_id];

    // Execute the query
    const [result] = await db.query(query, values);

    // Execute the query

    // Check if the user was updated
    console.log(db.query(query, values));
    console.log(result);
    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Book Returned successfully" });
    } else {
      console.log(result);
      res.status(404).json({ status: "failed", error: "Book not found" });
    }
  } catch (err) {
    // Handle errors
    res.status(500).json({ status: "failed", error: "Failed to Return book" });
  }
});
router.post("/getUnassignedBooks", async (req, res) => {
  const { stud_id } = req.body;
  try {
    const query = `
    SELECT * FROM book where is_delete ='N' and stud_id!=?
    `;
    console.log(typeof stud_id);
    const [rows] = await db.query(query, [stud_id]);
    res.json({ status: "success", result: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch books" });
  }
});
module.exports = router;
