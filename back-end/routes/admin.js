const express = require('express');
const router = express.Router();
const seedrandom = require('seedrandom');
const db = require("../db"); 
const verifyToken = require('./jwtMiddleware');

router.get("/generated-qb-stats",verifyToken, (req, res) => {
    const weeklyQuery = `
      SELECT 
        YEARWEEK(date_time, 1) AS week, 
        COUNT(*) AS total_generated
      FROM qb.generated_papers
      WHERE date_time >= NOW() - INTERVAL 7 WEEK
      GROUP BY YEARWEEK(date_time, 1)
      ORDER BY week ASC
    `;
  
    const monthlyQuery = `
      SELECT 
        DATE_FORMAT(date_time, '%Y-%m') AS month, 
        COUNT(*) AS total_generated
      FROM qb.generated_papers
      WHERE date_time >= NOW() - INTERVAL 6 MONTH
      GROUP BY DATE_FORMAT(date_time, '%Y-%m')
      ORDER BY month ASC
    `;
  
    db.query(weeklyQuery, (err, weeklyResults) => {
      if (err) return res.status(400).json({ error: err.message });
  
      db.query(monthlyQuery, (err, monthlyResults) => {
        if (err) return res.status(400).json({ error: err.message });
  
        res.status(200).json({
          weekly: weeklyResults,
          monthly: monthlyResults
        });
      });
    });
});

router.get('/generate-history',verifyToken, (req, res) => {
  const sql = `
    SELECT id, course_code, subject_name, exam_name, date_time
    FROM generated_papers
    ORDER BY date_time DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching question history:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});


router.get("/faculty-list",verifyToken, (req, res) => {
    const query = "SELECT * FROM faculty_list";
    db.query(query, (err, results) => {
      if (!err) res.status(200).send(results);
      else return res.status(400).send(err);
    });
});

router.get("/faculty-question-list",verifyToken, (req, res) => {
    const { course_code } = req.query;
    if (!course_code) return res.status(400).json({ error: "Course code is required" });
  
    const query = "SELECT id, course_code,unit, updated_at FROM questions WHERE course_code = ?";
    db.query(query, [course_code], (err, results) => {
      if (!err) res.status(200).json(results);
      else res.status(400).json({ error: err.message });
    });
});

router.post('/generate-history',verifyToken,(req, res) => {
  const { course_code, subject_name, exam_name } = req.body;

  if (!course_code || !subject_name || !exam_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const date_time = new Date(); 

  const sql = `
    INSERT INTO generated_papers (course_code, subject_name, exam_name, date_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [course_code, subject_name, exam_name, date_time], (err, result) => {
    if (err) {
      console.error('Error inserting question history:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ message: 'History recorded successfully', insertId: result.insertId });
  });
});
  
router.get("/question-history",verifyToken, (req, res) => {
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
  
router.get("/recently-added",verifyToken, (req, res) => {
    const query = `
      SELECT fl.course_code,fl.faculty_id, q.unit, q.created_at 
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

function normalizeUnit(unit) {
    return unit
      .replace("Unit ", "")
      .replace(/([A-Za-z]+)/g, ".$1")
      .split(".")
      .map((v) => (isNaN(v) ? v : parseInt(v)));
}

function compareUnits(u1, u2) {
    const a = normalizeUnit(u1);
    const b = normalizeUnit(u2);
  
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const valA = a[i] !== undefined ? a[i] : 0;
      const valB = b[i] !== undefined ? b[i] : 0;
  
      if (valA < valB) return -1;
      if (valA > valB) return 1;
    }
    return 0;
}
  
function shuffleArray(arr, seed) {
    let rng = new seedrandom(seed);
    let shuffled = arr.slice();
  
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
  
    return shuffled;
}
  
function groupQuestions(unit, results, usedIds) {
    return {
      oneMarks: results.filter((q) => q.unit === unit && q.mark === 1 && !usedIds.has(q.id)),
      fourMarks: results.filter((q) => q.unit === unit && q.mark === 4 && !usedIds.has(q.id)),
      otherMarks: results.filter((q) => q.unit === unit && q.mark !== 1 && q.mark !== 4 && !usedIds.has(q.id)),
    };
}
  
router.get("/generate-qb",verifyToken, (req, res) => {
    const { course_code, from_unit, to_unit } = req.query;
  
    if (!course_code || !from_unit || !to_unit) {
      return res.status(400).json({ error: "Missing course_code, from_unit, or to_unit" });
    }
  
    const validRange1 = compareUnits(from_unit, "Unit 1") === 0 && compareUnits(to_unit, "Unit 3A") === 0;
    const validRange2 = compareUnits(from_unit, "Unit 3B") === 0 && compareUnits(to_unit, "Unit 5") === 0;
  
    if (!validRange1 && !validRange2) {
      return res.status(400).json({ error: "Only Unit 1–3A or Unit 3B–5 are allowed" });
    }
  
    const sectionUnits = validRange1
      ? { A: "Unit 1", B: "Unit 2", C: "Unit 3A" }
      : { A: "Unit 4", B: "Unit 5", C: "Unit 3B" };
  
    db.query("SELECT * FROM questions WHERE course_code = ?", [course_code], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
  
      const randomSalt = Math.floor(Math.random() * 10000);
      const seed = `${course_code}-${from_unit}-${to_unit}-${randomSalt}`;
  
      const shuffledQuestions = shuffleArray(results, seed);
  
      const paper = {};
      const usedIds = new Set();
  
      for (const section of ["A", "B"]) {
        const unit = sectionUnits[section];
        const { oneMarks, otherMarks } = groupQuestions(unit, shuffledQuestions, usedIds);
  
        const selectedOneMarks = oneMarks.slice(0, 2);
        const selectedOtherMarks = otherMarks.slice(0, 2);
  
        if (selectedOneMarks.length < 2 || selectedOtherMarks.length < 2) {
          return res.status(400).json({ error: `Not enough questions in ${unit} for Section ${section}` });
        }
  
        for (let i = 1; i <= 3; i++) {
          paper[`${section}${i}`] = [...selectedOneMarks, ...selectedOtherMarks];
        }
      }
      const unitC = sectionUnits.C;
      const { oneMarks: oneMarkC, fourMarks: fourMarkC } = groupQuestions(unitC, shuffledQuestions, usedIds);
  
      if (oneMarkC.length < 3 || fourMarkC.length < 3) {
        return res.status(400).json({ error: `Not enough questions in ${unitC} for Section C` });
      }
  
      for (let i = 1; i <= 3; i++) {
        paper[`C${i}`] = [oneMarkC[i - 1], fourMarkC[i - 1]];
      }
  
      return res.json(paper);
    });
});

router.get('/qb-history', verifyToken,(req, res) => {
    const query = "SELECT course_code, subject_name,exam_name,date_time FROM generated_papers";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching faculty subjects:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json(results);
    });
});

router.post('/question-history',verifyToken, (req, res) => {
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

router.get("/get-faculty-subjects",verifyToken,(req, res) => {
    const query = "SELECT course_code, subject_name FROM faculty_list";
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching faculty subjects:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json(results);
    });
});

router.post("/give-task",verifyToken, (req, res) => {
  const { unit, m1, m2, m3, m4, m5, m6, due_date } = req.body;

  const getFacultyQuery = `SELECT faculty_id FROM faculty_list`;

  db.query(getFacultyQuery, (err, facultyResults) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch faculty list" });
    }

    if (facultyResults.length === 0) {
      return res.status(404).json({ message: "No faculty found" });
    }

    const insertQuery = `
      INSERT INTO task (faculty_id, unit, m1, m2, m3, m4, m5, m6, due_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const tasks = facultyResults.map((faculty) => {
      return new Promise((resolve, reject) => {
        db.query(
          insertQuery,
          [faculty.faculty_id, unit, m1, m2, m3, m4, m5, m6, due_date],
          (err, result) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    });

    Promise.all(tasks)
      .then(() => {
        res.status(200).json({ message: "Task assigned to all faculty" });
      })
      .catch((err) => {
        console.error("Error assigning task:", err);
        res.status(500).json({ error: "Failed to assign task to all faculty" });
      });
  });
});

router.post("/add-vetting", verifyToken, (req, res) => {
  const { vetting_id, faculty_id} = req.body;

  if (!vetting_id || !faculty_id ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO vetting (vetting_id, faculty_id)
    VALUES (?, ?)
  `;

  db.query(query, [vetting_id, faculty_id], (err, result) => {
    if (err) {
      console.error("Error inserting vetting record:", err);
      return res.status(500).json({ message: "Failed to add vetting record" });
    }

    res.status(200).json({ message: "Vetting entry added successfully" });
  });
});


module.exports = router;
