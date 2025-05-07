const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../db"); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });
  
router.get("/get-course-code", (req, res) => {
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

router.get("/faculty-question-stats", (req, res) => {
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

router.get("/faculty-data", (req, res) => {
    const {email} = req.query
    const query = "SELECT * FROM faculty_list WHERE email=?";
    db.query(query,[email], (err, results) => {
      if (!err) res.status(200).send(results);
      else return res.status(400).send(err);
    });
});
  
router.get("/question-view/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM questions WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (!err) res.status(200).send(results);
      else return res.status(400).send(err);
    });
});
  
router.put("/question-edit/:id", (req, res) => {
    const { id } = req.params;
    const { exam_name, unit, topic, mark, question, answer } = req.body;
  
    if (!exam_name || !unit || !topic || !mark || !question || !answer) {
      return res.status(400).json({ message: "All fields are required!" });
    }
  
    const query = `
      UPDATE questions 
      SET exam_name = ?, unit = ?, topic = ?, mark = ?, question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
  
    db.query(query, [exam_name, unit, topic, mark, question, answer, id], (err) => {
      if (!err) res.status(200).send("Updated successfully");
      else res.status(400).send(err);
    });
});
  
router.delete("/question-delete/:id", (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM questions WHERE id = ?";
    db.query(query, [id], (err) => {
      if (!err) res.status(200).send("Deleted successfully");
      else return res.status(400).send(err);
    });
});

router.get('/faculty-recently-added', (req, res) => {
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

router.post("/upload", upload.single("file"), (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.file.filename);
  const courseCode = req.body.course_code;
  const results = [];

  if (!courseCode) return res.status(400).send("Missing course_code in request");

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      // Make sure all required fields are present
      if (
        data.exam_name &&
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
      results.forEach((row) => {
        const query = `
          INSERT INTO questions 
          (exam_name, unit, topic, question, answer, mark, course_code, type, option_a, option_b, option_c, option_d) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [
          row.exam_name,
          row.unit,
          row.topic,
          row.question,
          row.answer,
          parseInt(row.mark),
          courseCode,
          row.type || "Descriptive",
          row.option_a || null,
          row.option_b || null,
          row.option_c || null,
          row.option_d || null
        ], (err) => {
          if (err) console.error("Insert error:", err);
        });
      });

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete uploaded file:", err);
      });

      res.send("File uploaded and data inserted successfully");
    });
});

router.post("/add-question", (req, res) => {
  const {
    exam_name,
    unit,
    topic,
    mark,
    question,
    answer,
    course_code,
    type,
    option_a,
    option_b,
    option_c,
    option_d,
  } = req.body;

  if (!exam_name || !unit || !topic || !mark || !question || !answer || !course_code) {
    return res.status(400).send("Missing required fields");
  }

  const query = `
    INSERT INTO questions 
    (exam_name, unit, topic, mark, question, answer, course_code, type, option_a, option_b, option_c, option_d) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      exam_name,
      unit,
      topic,
      parseInt(mark),
      question,
      answer,
      course_code,
      type || "Descriptive",
      option_a || null,
      option_b || null,
      option_c || null,
      option_d || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting question:", err);
        return res.status(500).send("Failed to insert question");
      }

      res.status(200).send("Question added successfully");
    }
  );
});

router.get("/faculty-task-progress/:faculty_id", (req, res) => {
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

router.get("/faculty-id", (req, res) => {
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


module.exports = router;
