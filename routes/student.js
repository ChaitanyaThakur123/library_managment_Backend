const express = require("express");
const router = express.Router();
const db = require("../config/db");
// 1. Get all users
router.get("/getStudents", async (req, res) => {
  console.log("enter");
  try {
    const query = `
    SELECT 
     
      s.enrollmentNo,
      s.studentName,
      s.createdAt,
      s.stud_id,
      d.name AS departmentName,
      se.name AS semesterName
      FROM 
      student s
  
	JOIN
		department d ON s.departmentId= d.department_id
    JOIN 
      semester se ON s.semesterId = se.semester_id
    WHERE 
      s.is_delete = 'N' 
  `;

    const [rows] = await db.query(query);
    res.json({ status: "success", result: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "failed", error: "Failed to fetch users" });
  }
});
router.post("/getStudentByEnrollmentNo", async (req, res) => {
  const { enrollmentNo } = req.body;

  try {
    const checkQuery =
      'SELECT * FROM student WHERE enrollmentNo = ? AND is_delete = "N"';
    const [rows] = await db.query(checkQuery, [enrollmentNo]);

    // Check if the user was found
    if (rows.length > 0) {
      res.status(201).json({
        status: "success",
        result: rows,
      });
    } else {
      console.log(rows);
      res
        .status(500)
        .json({ status: "failed", message: "Enrollment Number is not Exist" });
    }

    // Execute the query
  } catch (err) {
    // Handle errors
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to load Enrollment Number", status: "failed" });
  }
});
router.post("/getReturnStudentByEnrollmentNo", async (req, res) => {
  const { enrollmentNo } = req.body;

  try {
    const checkQuery = `SELECT 
      s.stud_id,
      s.studentName,
      s.departmentId,
      s.semesterId,
      s.contact,
      s.email,
      b.issuedDate,
      b.b_id
       FROM student s
    JOIN book b
      ON s.stud_id =b.stud_id
    WHERE s.enrollmentNo = ? AND s.is_delete = "N" AND b.status="I"`;
    const [rows] = await db.query(checkQuery, [enrollmentNo]);

    // Check if the user was found
    if (rows.length > 0) {
      res.status(201).json({
        status: "success",
        result: rows,
      });
    } else {
      res
        .status(500)
        .json({ status: "failed", message: "Enrollment Number is not Exist" });
    }

    // Execute the query
  } catch (err) {
    // Handle errors
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to load Enrollment Number", status: "failed" });
  }
});
// 2. Create a new user
router.post("/createStudent", async (req, res) => {
  const {
    studentName,
    enrollmentNo,
    departmentId,
    semesterId,
    contact,
    email,
    bookId,
  } = req.body;

  try {
    const checkQuery =
      'SELECT * FROM student WHERE enrollmentNo = ? AND is_delete = "N"';
    const [rows] = await db.query(checkQuery, [enrollmentNo]);

    // Check if the user was found
    if (rows.length > 0) {
      res
        .status(500)
        .json({ status: "failed", message: "Student is already Exist" });
    } else {
      const sql = `INSERT INTO student (
                       studentName, enrollmentNo, departmentId, semesterId, contact, email,is_delete, createdAt
                     ) 
                     VALUES (?, ?, ?, ?, ?,?, 'N', NOW())`;
      const values = [
        studentName,
        enrollmentNo,
        departmentId,
        semesterId,
        contact,
        email,
      ];
      const [result] = await db.query(sql, values);

      // Return a success response with the inserted user ID
      res.status(201).json({
        message: "Student created successfully",
        studentId: result.insertId,
        status: "success",
      });
    }

    // Execute the query
  } catch (err) {
    // Handle errors
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to create Student", status: "failed" });
  }
});

//3. Update User
router.post("/updateStudent", async (req, res) => {
  const {
    stud_id,
    studentName,
    enrollmentNo,
    departmentId,
    semesterId,
    contact,
    email,
    bookId,
  } = req.body;
  if (!stud_id) {
    return res
      .status(400)
      .json({ status: "failed", error: "Student id is required" });
  }

  try {
    const updateQuery = `UPDATE student SET studentName = ?,enrollmentNo = ?,departmentId = ?,semesterId = ?,contact = ?,email = ? WHERE stud_id = ?`;
    const values = [
      studentName,
      enrollmentNo,
      departmentId,
      semesterId,
      contact,
      email,
      stud_id,
    ];
    // Execute the query
    const [result] = await db.query(updateQuery, values);

    // Check if the user was updated
    if (result.affectedRows > 0) {
      res.json({ status: "success", message: "Student updated successfully" });
    } else {
      res.status(404).json({ status: "failed", error: "Student not found" });
    }
  } catch (err) {
    console.log(err);
    // Handle errors
    res
      .status(500)
      .json({ status: "failed", error: "Failed to update student" });
  }
});

//4. get user by ID
router.post("/getStudentById", async (req, res) => {
  const { stud_id } = req.body; // Get user_id from the request body

  // Check if user_id is provided
  if (!stud_id) {
    return res
      .status(400)
      .json({ status: "failed", message: "student id is required" });
  }

  try {
    const query = "SELECT * FROM student WHERE stud_id = ?";

    // Execute the query
    const [rows] = await db.query(query, [stud_id]);

    // Check if the user was found
    if (rows.length > 0) {
      res.json({ status: "success", student: rows[0] });
    } else {
      res.status(404).json({ status: "failed", message: "Student not found" });
    }
  } catch (err) {
    // Handle errors
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ status: "failed", message: "Failed to retrieve student" });
  }
});

//5. Delete User By Id
router.post("/deleteStudentById", async (req, res) => {
  const { stud_id } = req.body; // Get user_id from the request body

  // Check if user_id is provided
  if (!stud_id) {
    return res
      .status(400)
      .json({ status: "failed", message: "Student id is required" });
  }

  try {
    const query = 'UPDATE student SET is_delete = "Y" WHERE stud_id = ?';

    // Execute the query
    const [result] = await db.query(query, [stud_id]);

    // Check if the user was updated
    if (result.affectedRows > 0) {
      res.json({
        status: "success",
        message: "Student deleted successfully",
      });
    } else {
      res.status(404).json({ status: "failed", message: "Student not found" });
    }
  } catch (err) {
    // Handle errors
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ status: "failed", message: "Failed to mark student as deleted" });
  }
});

//6. get All Department
router.get("/getAllDepartment", async (req, res) => {
  console.log("enter");
  try {
    const [rows] = await db.query("SELECT * FROM department ");
    res.json({ status: "success", result: rows });
  } catch (err) {
    res
      .status(500)
      .json({ status: "failed", error: "Failed to fetch department" });
  }
});

//6. get All Semester
router.get("/getAllSemester", async (req, res) => {
  console.log("enter");
  try {
    const [rows] = await db.query("SELECT * FROM semester ");
    res.json({ status: "success", result: rows });
  } catch (err) {
    res
      .status(500)
      .json({ status: "failed", error: "Failed to fetch semester" });
  }
});
module.exports = router;
