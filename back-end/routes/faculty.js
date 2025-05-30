const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../db"); 
const verifyToken = require('./jwtMiddleware');
const app = express()

// Serve uploaded files statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../uploads/"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, uniqueSuffix + extension);
    },
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get('/test-dir', (req, res) => {
  res.send(`__dirname is: ${__dirname}`);
});


const upload = multer({ storage: storage });
  

router.post("/upload-figure", verifyToken, upload.single("figure"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // Return the file path that will be stored in the database
  const figurePath = `/uploads/${req.file.filename}`;
  res.status(200).json({ figurePath });
});

router.get("/get-course-code",verifyToken, (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).send("Missing email");
  
    const query = `
      SELECT course_code 
      FROM faculty_list 
      WHERE email = ?
    `;
  
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).send("Error fetching course code");
      if (results.length === 0) return res.status(404).send("No course code found");
      res.json({ course_code: results[0].course_code });
    });
});

router.get("/faculty-question-stats",verifyToken, (req, res) => {
    const courseCode = req.query.course_code;
  
    if (!courseCode) {
      return res.status(400).json({ error: "Course code is required" });
    }
  
    const weeklyQuery = `
      SELECT fl.faculty_id, YEARWEEK(q.created_at, 1) AS week, COUNT(*) AS total_papers
      FROM qb.questions AS q
      JOIN qb.faculty_list AS fl ON q.course_code = fl.course_code
      WHERE q.course_code = ?
      AND q.created_at >= NOW() - INTERVAL 7 WEEK
      GROUP BY fl.faculty_id, YEARWEEK(q.created_at, 1)
      ORDER BY week ASC
    `;
  
    const monthlyQuery = `
      SELECT fl.faculty_id, DATE_FORMAT(q.created_at, '%Y-%m') AS month, COUNT(*) AS total_papers
      FROM qb.questions AS q
      JOIN qb.faculty_list AS fl ON q.course_code = fl.course_code
      WHERE q.course_code = ?
      AND q.created_at >= NOW() - INTERVAL 6 MONTH
      GROUP BY fl.faculty_id, DATE_FORMAT(q.created_at, '%Y-%m')
      ORDER BY month ASC
    `;
  
    db.query(weeklyQuery, [courseCode], (err, weeklyResults) => {
      if (err) return res.status(400).json({ error: err.message });
  
      db.query(monthlyQuery, [courseCode], (err, monthlyResults) => {
        if (err) return res.status(400).json({ error: err.message });
  
        res.status(200).json({ weekly: weeklyResults, monthly: monthlyResults });
      });
    });
});

router.get("/faculty-data",verifyToken, (req, res) => {
    const {email} = req.query
    const query = "SELECT * FROM faculty_list WHERE email=?";
    db.query(query,[email], (err, results) => {
      if (!err) res.status(200).send(results);
      else return res.status(400).send(err);
    });
});

router.get("/get-vetting-id",verifyToken,(req,res)=>{
  const {faculty_id} = req.query ;
  const query = "SELECT vetting_id FROM vetting WHERE faculty_id=?";
    db.query(query,[faculty_id], (err, results) => {
      if (!err) res.status(200).send(results[0]);
      else return res.status(400).send(err);
      console.log(results[0]);
    });
})

router.get("/get-faculty-id",verifyToken,(req,res)=>{
  const {vetting_id} = req.query ;
  const query = "SELECT faculty_id FROM vetting WHERE vetting_id=?";
    db.query(query,[vetting_id], (err, results) => {
      if (!err) res.status(200).send(results[0]);
      else return res.status(400).send(err);
      console.log(results[0]);
    });
})
router.get("/get-email",verifyToken,(req,res)=>{
  const {faculty_id} = req.query ;
  const query = "SELECT email FROM faculty_list where faculty_id=?";
   db.query(query,[faculty_id], (err, results) => {
      if (!err) res.status(200).send(results[0]);
      else return res.status(400).send(err);
      console.log(results[0]);
    });
})

router.get("/question-view/:id",verifyToken, (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM question_status WHERE question_id = ?";
    db.query(query, [id], (err, results) => {
      if (!err) res.status(200).send(results);
      else return res.status(400).send(err);
    });
});
  
router.put("/question-edit/:id",verifyToken, (req, res) => {
    const { id } = req.params;
    const { unit, topic, mark, question, answer, figure } = req.body;
  
    if (!unit || !topic || !mark || !question || !answer) {
      return res.status(400).json({ message: "All fields are required!" });
    }
  
    const query = `
      UPDATE question_status 
      SET unit = ?, topic = ?, mark = ?, question = ?, answer = ?, figure = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
  
    db.query(query, [unit, topic, mark, question, answer, figure || null, id], (err) => {
      if (!err) res.status(200).send("Updated successfully");
      else res.status(400).send(err);
    });
});
  
router.delete("/question-delete/:id",verifyToken, (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM question_status WHERE id = ?";
    db.query(query, [id], (err) => {
      if (!err) res.status(200).send("Deleted successfully");
      else return res.status(400).send(err);
    });
});

router.get('/faculty-recently-added',verifyToken, (req, res) => {
    const courseCode = req.query.course_code;
    
    if (!courseCode) {
      return res.status(400).json({ error: 'Course code is required' });
    }
  
    const query = `
      SELECT course_code, unit, created_at
      FROM questions
      WHERE course_code = ?
      ORDER BY created_at DESC
      LIMIT 5
    `;
  
    db.query(query, [courseCode], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      res.json(results);
    });
});

router.post("/upload", upload.single("file"), verifyToken, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "../uploads", req.file.filename);
  const courseCode = req.body.course_code;
  const facultyId = req.body.faculty_id;
  const vettingId = req.body.vetting_id;

  if (!courseCode) return res.status(400).send("Missing course_code in request");
  if (!facultyId) return res.status(400).send("Missing faculty_id in request");
  if (!vettingId) return res.status(400).send("Missing vetting_id in request");

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      if (
        data.unit &&
        data.topic &&
        data.question &&
        data.answer &&
        !isNaN(parseInt(data.mark))
      ) {
        results.push(data);
      }
    })
    .on("end", () => {
      // Step 1: Get max existing ID
      db.query("SELECT MAX(id) AS maxId FROM question_status", (err, result) => {
        if (err) {
          console.error("Error fetching max ID:", err);
          return res.status(500).send("Error while preparing insertion");
        }

        let currentId = (result[0].maxId || 0) + 1;

        // Step 2: Insert each row with a custom ID
        results.forEach((row) => {
          const query = `
            INSERT INTO question_status 
            (id, unit, topic, mark, question, answer, course_code, option_a, option_b, option_c, option_d,
            faculty_id, vetting_id, cognitive_dimension, knowledge_dimension, portion, figure, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
          `;

          db.query(
            query,
            [
              currentId++,
              row.unit,
              row.topic,
              parseInt(row.mark),
              row.question,
              row.answer,
              courseCode,
              row.option_a || null,
              row.option_b || null,
              row.option_c || null,
              row.option_d || null,
              facultyId || row.faculty_id || null,
              vettingId || row.vetting_id || null,
              row.cognitive_dimension || null,
              row.knowledge_dimension || null,
              row.portion || null,
              row.figure || null
            ],
            (err) => {
              if (err) console.error("Insert error:", err);
            }
          );
        });

        // Delete uploaded CSV
        fs.unlink(filePath, (err) => {
          if (err) console.error("Failed to delete uploaded file:", err);
        });

        res.send("File uploaded and questions inserted with custom IDs");
      });
    });
});


router.get("/faculty-task-progress/:faculty_id",verifyToken, (req, res) => {
    const facultyId = req.params.faculty_id;
    const query = `
      SELECT 
        t.unit,
        t.m1, 
        t.m2, 
        t.m3, 
        t.m4, 
        t.m5, 
        t.m6,
        t.due_date,
        IFNULL(SUM(CASE WHEN q.mark = 1 THEN 1 ELSE 0 END), 0) AS m1_added,
        IFNULL(SUM(CASE WHEN q.mark = 2 THEN 1 ELSE 0 END), 0) AS m2_added,
        IFNULL(SUM(CASE WHEN q.mark = 3 THEN 1 ELSE 0 END), 0) AS m3_added,
        IFNULL(SUM(CASE WHEN q.mark = 4 THEN 1 ELSE 0 END), 0) AS m4_added,
        IFNULL(SUM(CASE WHEN q.mark = 5 THEN 1 ELSE 0 END), 0) AS m5_added,
        IFNULL(SUM(CASE WHEN q.mark = 6 THEN 1 ELSE 0 END), 0) AS m6_added
      FROM task t
      LEFT JOIN questions q ON t.unit = q.unit AND t.faculty_id = q.faculty_id
      WHERE t.faculty_id = ? AND t.due_date >= CURDATE()
      GROUP BY t.unit, t.m1, t.m2, t.m3, t.m4, t.m5, t.m6, t.due_date
    `;
  
    db.query(query, [facultyId], (err, results) => {
      if (err) return res.status(500).json({ error: err });
  
      const data = results.map(row => ({
        unit: row.unit,
        due_date: row.due_date, 
        m1_added: row.m1_added,
        m1_required: row.m1,
        m1_pending: Math.max(row.m1 - row.m1_added, 0),
        m2_added: row.m2_added,
        m2_required: row.m2,
        m2_pending: Math.max(row.m2 - row.m2_added, 0),
        m3_added: row.m3_added,
        m3_required: row.m3,
        m3_pending: Math.max(row.m3 - row.m3_added, 0),
        m4_added: row.m4_added,
        m4_required: row.m4,
        m4_pending: Math.max(row.m4 - row.m4_added, 0),
        m5_added: row.m5_added,
        m5_required: row.m5,
        m5_pending: Math.max(row.m5 - row.m5_added, 0),
        m6_added: row.m6_added,
        m6_required: row.m6,
        m6_pending: Math.max(row.m6 - row.m6_added, 0)
      }));
  
      res.status(200).json(data);
    });
});

router.get("/faculty-id", verifyToken , (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).send("Missing email");
  
    const query = `
      SELECT faculty_id 
      FROM faculty_list 
      WHERE email = ?
    `;
  
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).send("Error fetching faculty-id");
      if (results.length === 0) return res.status(404).send("No faculty found");
      
      res.json({ faculty_id: results[0].faculty_id });
    });
});

router.post("/add-question", verifyToken, (req, res) => {
  let {
    unit, topic, mark, question, answer, course_code,
    option_a, option_b, option_c, option_d,
    faculty_id, vetting_id,
    cognitive_dimension, knowledge_dimension, portion, figure
  } = req.body;

  if (!unit || !topic || !mark || !question || !answer || !course_code || !faculty_id || !vetting_id) {
    return res.status(400).send("Missing required fields");
  }

  const markInt = parseInt(mark);

  // 🟡 Validate MCQs for 1-mark questions
  if (markInt === 1) {
    if (!option_a || !option_b || !option_c || !option_d) {
      return res.status(400).send("MCQ options are required for 1-mark questions");
    }
  } else {
    // Set options to empty string for non-1-mark questions
    option_a = "";
    option_b = "";
    option_c = "";
    option_d = "";
  }

  // 🔁 Step 1: Get the latest ID
  const getIdQuery = "SELECT MAX(id) AS maxId FROM question_status";
  db.query(getIdQuery, (err, results) => {
    if (err) {
      console.error("Error fetching latest ID:", err);
      return res.status(500).send("Failed to generate question ID");
    }

    const newId = (results[0].maxId || 0) + 1;

    // 🔁 Step 2: Insert with manually computed ID
    const insertQuery = `
      INSERT INTO question_status 
      (id, unit, topic, mark, question, answer, course_code, option_a, option_b, option_c, option_d,
       faculty_id, vetting_id, cognitive_dimension, knowledge_dimension, portion, figure, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(
      insertQuery,
      [newId, unit, topic, markInt, question, answer, course_code, option_a, option_b, option_c, option_d,
       faculty_id, vetting_id, cognitive_dimension, knowledge_dimension, portion, figure],
      (err, result) => {
        if (err) {
          console.error("Error inserting question:", err);
          return res.status(500).send("Failed to insert question");
        }

        res.status(200).json({ message: "Question submitted for review", id: newId });
      }
    );
  });
});


router.put("/review-question/:question_id", verifyToken, (req, res) => {
  const { question_id } = req.params;
  const { status, remarks } = req.body;
  const loginVettingEmail = req.user.email;

  if (!status || (status !== "accepted" && status !== "rejected")) {
    return res.status(400).send("Invalid or missing status");
  }

  // Step 1: Get vetting_id from question_status
  const getStatusQuery = `SELECT * FROM question_status WHERE question_id = ?`;

  db.query(getStatusQuery, [question_id], (err, statusResults) => {
    if (err) {
      console.error("Error fetching question_status:", err);
      return res.status(500).send("Error fetching question status");
    }

    if (statusResults.length === 0) {
      return res.status(404).send("Question status not found");
    }

    const question = statusResults[0];
    const dbVettingId = question.vetting_id;
    // Step 2: Get current logged-in vetting's faculty_id using email
    const vettingQuery = `SELECT faculty_id FROM faculty_list WHERE email = ?`;

    db.query(vettingQuery, [loginVettingEmail], (err2, vettingResults) => {
      if (err2) {
        console.error("Error fetching vetting ID:", err2);
        return res.status(500).send("Error verifying reviewer");
      }

      const loginVettingId = vettingResults[0]?.faculty_id;

      if (dbVettingId !== loginVettingId) {
        return res.status(403).send("You are not authorized to review this question");
      }

      // Step 3: Process based on status
      if (status === "accepted") {
        const insertQuery = `
          INSERT INTO questions 
          (unit, topic, mark, question, answer, course_code, option_a, option_b, option_c, option_d,
           faculty_id, cognitive_dimension, knowledge_dimension, portion, figure)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
          question.unit, question.topic, question.mark, question.question, question.answer,
          question.course_code, question.option_a, question.option_b, question.option_c, question.option_d,
          question.faculty_id, question.cognitive_dimension, question.knowledge_dimension,
          question.portion, question.figure
        ], (err3) => {
          if (err3) {
            console.error("Error inserting accepted question:", err3);
            return res.status(500).send("Error inserting accepted question");
          }

          const updateQuery = `UPDATE question_status SET status = 'accepted' WHERE question_id = ?`;
          db.query(updateQuery, [question_id], (err4) => {
            if (err4) return res.status(500).send("Inserted but failed to update status");
            res.status(200).send("Question accepted and inserted successfully");
          });
        });

      } else {
        // Rejected path
        const updateQuery = `UPDATE question_status SET status = 'rejected', remarks = ? WHERE question_id = ?`;
        db.query(updateQuery, [remarks || null, question_id], (err5) => {
          if (err5) {
            console.error("Error updating rejected status:", err5);
            return res.status(500).send("Failed to update rejection");
          }
          res.status(200).send("Question rejected with remarks");
        });
      }
    });
  });
});

module.exports = router ;
