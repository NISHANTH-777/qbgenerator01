const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Database Connected");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  dest: "uploads/", // Store files in the uploads folder
});

app.post('/check-user', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM user WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    if (results.length > 0) {
      const user = results[0];
      return res.json({
        exists: true,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        course_code: user.course_code
      });
    } else {
      return res.json({ exists: false });
    }
  });
});

app.post('/manual-login', (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", email, password); 

  const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("MySQL error:", err); 
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        course_code: user.course_code
      }
    });
  });
});

app.get('/test-user', (req, res) => {
  db.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json(results);
  });
});


app.get("/faculty-list", (req, res) => {
  const query = "SELECT * FROM faculty_list";
  db.query(query, (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});

app.get("/faculty-data", (req, res) => {
  const {email} = req.query
  const query = "SELECT * FROM faculty_list WHERE email=?";
  db.query(query,[email], (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});

app.get("/question-list", (req, res) => {
  const query = "SELECT id, unit, topic, mark, question FROM questions";
  db.query(query, (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});

app.get("/faculty-question-list", (req, res) => {
  const { course_code } = req.query;
  if (!course_code) return res.status(400).json({ error: "Course code is required" });

  const query = "SELECT id, course_code,unit, updated_at FROM questions WHERE course_code = ?";
  db.query(query, [course_code], (err, results) => {
    if (!err) res.status(200).json(results);
    else res.status(400).json({ error: err.message });
  });
});

app.get("/question-view/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM questions WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});

app.put("/question-edit/:id", (req, res) => {
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

app.delete("/question-delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM questions WHERE id = ?";
  db.query(query, [id], (err) => {
    if (!err) res.status(200).send("Deleted successfully");
    else return res.status(400).send(err);
  });
});

app.get("/question-history", (req, res) => {
  const query = `
    SELECT 
      q.id AS id,
      fl.faculty_id,
      fl.course_code,
      q.unit,
      q.created_at 
    FROM 
      qb.faculty_list AS fl 
    JOIN 
      qb.questions AS q 
    ON 
      fl.course_code = q.course_code
  `;
  db.query(query, (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});


app.get("/recently-added", (req, res) => {
  const query = `
    SELECT fl.course_code, q.unit, q.created_at 
    FROM qb.faculty_list AS fl 
    JOIN qb.questions AS q ON fl.course_code = q.course_code 
    ORDER BY q.created_at DESC 
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (!err) res.status(200).send(results);
    else return res.status(400).send(err);
  });
});

app.get('/faculty-recently-added', (req, res) => {
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



app.get("/question-stats", (req, res) => {
  const weeklyQuery = `
    SELECT YEARWEEK(created_at) AS week, COUNT(*) AS total_papers 
    FROM qb.questions 
    GROUP BY YEARWEEK(created_at) 
    ORDER BY week DESC
  `;

  const monthlyQuery = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total_papers 
    FROM qb.questions 
    GROUP BY DATE_FORMAT(created_at, '%Y-%m') 
    ORDER BY month DESC
  `;

  db.query(weeklyQuery, (err, weeklyResults) => {
    if (err) return res.status(400).json({ error: err.message });

    db.query(monthlyQuery, (err, monthlyResults) => {
      if (err) return res.status(400).json({ error: err.message });

      res.status(200).json({ weekly: weeklyResults, monthly: monthlyResults });
    });
  });
});


app.get("/faculty-question-stats", (req, res) => {
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

app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.file.filename);
  const courseCode = req.body.course_code;
  const results = [];

  if (!courseCode) {
    return res.status(400).send("Missing course_code in request");
  }

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      if (data.question && data.answer && !isNaN(parseInt(data.mark))) {
        results.push(data);
      }
    })
    .on("end", () => {
      results.forEach((row) => {
        const query = "INSERT INTO questions (question, answer, mark, course_code) VALUES (?, ?, ?, ?)";
        db.query(query, [row.question, row.answer, parseInt(row.mark), courseCode], (err) => {
          if (err) console.error("Insert error:", err);
        });
      });

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete uploaded file:", err);
      });

      res.send("File uploaded and data inserted");
    })
    .on("error", (err) => {
      console.error("Error processing file:", err);
      res.status(500).send("Error processing CSV file.");
    });
});

app.get("/get-course-code", (req, res) => {
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

app.get("/generate-qb", (req, res) => {
  const courseCode = req.query.course_code;

  if (!courseCode) return res.status(400).json({ error: "Missing course_code" });

  db.query("SELECT * FROM questions WHERE course_code = ? ORDER BY RAND()", [courseCode], (err, all) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const paper = {};
    const usedIds = new Set();

    const oneMarkQs = all.filter((q) => q.mark === 1);
    const fourMarkQs = all.filter((q) => q.mark === 4);
    const others = all.filter((q) => q.mark !== 1);

    if (oneMarkQs.length < 15) {
      return res.status(400).json({ error: "Not enough 1-mark questions to generate full paper." });
    }

    const getUniqueQuestions = (source, count) => {
      const selected = [];
      let i = 0;
      while (selected.length < count && i < source.length) {
        const q = source[i++];
        if (!usedIds.has(q.id)) {
          usedIds.add(q.id);
          selected.push(q);
        }
      }
      return selected;
    };

    const getComboThatSumsTo = (target) => {
      const available = others.filter((q) => !usedIds.has(q.id));
      const result = [];
      let found = false;

      function backtrack(path, sum, index) {
        if (found || sum > target || index >= available.length) return;
        if (sum === target && path.length === 2) {
          result.push(...path);
          found = true;
          return;
        }

        backtrack([...path, available[index]], sum + available[index].mark, index + 1);
        backtrack(path, sum, index + 1);
      }

      backtrack([], 0, 0);
      return result;
    };

    ["A1", "A2", "A3", "B1", "B2", "B3"].forEach((section) => {
      const oneMarks = getUniqueQuestions(oneMarkQs, 2);
      const combo = getComboThatSumsTo(8);
      combo.forEach((q) => usedIds.add(q.id));
      paper[section] = [...oneMarks, ...combo];
    });

    ["C1", "C2", "C3"].forEach((section) => {
      const oneMark = getUniqueQuestions(oneMarkQs, 1);
      const fourMark = getUniqueQuestions(fourMarkQs, 1);
      paper[section] = [...oneMark, ...fourMark];
    });

    res.json(paper);
  });
});

app.post('/question-history', (req, res) => {
  const { course_code, subject_name, exam_name } = req.body;

const query = `
  INSERT INTO generated_papers (course_code, subject_name, exam_name, date_time)
  VALUES (?, ?, ?, NOW())
`;

db.query(query, [course_code, subject_name, exam_name], (err, result) => {
  if (err) {
    console.error("Error inserting history:", err);
    return res.status(500).json({ error: "Database error" });
  }
  res.status(200).json({ message: "History saved successfully" });
});
});



app.get('/qb-history', (req, res) => {
  const query = "SELECT course_code, subject_name,exam_name,date_time FROM generated_papers";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching faculty subjects:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

app.get("/get-faculty-subjects", (req, res) => {
  const query = "SELECT course_code, subject_name FROM faculty_list";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching faculty subjects:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
});

app.get("/test", (req, res) => {
  res.send("Hello from test route");
});



app.listen(7000, () => {
  console.log("🚀 Server running on http://localhost:7000");
});