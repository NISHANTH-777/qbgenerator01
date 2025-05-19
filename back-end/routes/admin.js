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

router.get("/faculty-question-list", verifyToken, (req, res) => {
    const { course_code } = req.query;
    if (!course_code) return res.status(400).json({ error: "Course code is required" });
  
    const query = "SELECT faculty_id,question_id,question,unit,updated_at,status  FROM question_status WHERE course_code = ?";
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
        q.created_at ,
        q.status
      FROM 
        qb.faculty_list AS fl 
      JOIN 
        qb.question_status AS q 
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
      SELECT fl.course_code,fl.faculty_id, q.unit, q.created_at ,q.status
      FROM qb.faculty_list AS fl 
      JOIN qb.question_status AS q ON fl.course_code = q.course_code 
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
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getPortionFilter(sectionName) {
  const index = sectionName[1]; // "1", "2", or "3"
  if (index === "1") return ["A"];
  if (index === "2") return ["A", "B"];
  if (index === "3") return ["B"];
  return ["A", "B"];
}

function isPortionAllowed(portion, allowedPortions) {
  if (!portion) return false;
  const normalized = portion.toUpperCase();
  if (normalized === "A&B" || normalized === "A AND B") {
    return allowedPortions.some((p) => ["A", "B"].includes(p));
  }
  return allowedPortions.includes(normalized);
}

function isMCQ(q) {
  return (
    q.mark === 1 &&
    q.option_a && q.option_b && q.option_c && q.option_d
  );
}

function groupQuestions(unit, questions, usedIds, sectionName) {
  const allowedPortions = getPortionFilter(sectionName);
  const unitArray = Array.isArray(unit) ? unit : [unit];

  return {
    oneMarks: questions.filter(
      (q) =>
        unitArray.includes(q.unit) &&
        q.mark === 1 &&
        isMCQ(q) &&
        !usedIds.has(q.id) &&
        isPortionAllowed(q.portion, allowedPortions)
    ),
    otherMarks: questions.filter(
      (q) =>
        unitArray.includes(q.unit) &&
        q.mark !== 1 &&
        !usedIds.has(q.id) &&
        isPortionAllowed(q.portion, allowedPortions)
    ),
  };
}

function findPairForSum(questions, targetSum) {
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      if (questions[i].mark + questions[j].mark === targetSum) {
        return [questions[i], questions[j]];
      }
    }
  }
  return null;
}

const sectionUnits = {
  A1: "Unit 1",
  A2: "Unit 1",
  A3: "Unit 1",
  B1: "Unit 2",
  B2: "Unit 2",
  B3: "Unit 2",
  C1: "Unit 3",
  C2: "Unit 3",
  C3: "Unit 3",
  D1: "Unit 4",
  D2: "Unit 4",
  D3: "Unit 4",
  E1: "Unit 5",
  E2: "Unit 5",
  E3: "Unit 5",
};

router.get("/generate-semester-qb", verifyToken, (req, res) => {
  const { course_code } = req.query;

  if (!course_code) {
    return res.status(400).json({ error: "Missing course_code" });
  }

  db.query(
    "SELECT * FROM question_status WHERE course_code = ?",
    [course_code],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const randomSalt = Math.floor(Math.random() * 10000);
      const seed = `${course_code}-semester-${randomSalt}`;
      const shuffledQuestions = shuffleArray(results, seed);

      const paper = {};
      const usedIds = new Set();

      for (const sectionName of Object.keys(sectionUnits)) {
        const unit = sectionUnits[sectionName];

        const { oneMarks, otherMarks } = groupQuestions(
          unit,
          shuffledQuestions,
          usedIds,
          sectionName
        );

        if (oneMarks.length < 2) {
          return res.status(400).json({
            error: `Not enough 1-mark MCQs in ${unit} for section ${sectionName}. Required: 2, Found: ${oneMarks.length}`,
          });
        }

        const selectedOneMarks = oneMarks.slice(0, 2);
        selectedOneMarks.forEach((q) => usedIds.add(q.id));

        const pair = findPairForSum(
          otherMarks.filter((q) => !usedIds.has(q.id)),
          8
        );

        if (!pair) {
          return res.status(400).json({
            error: `Not enough valid question pairs in ${unit} to complete Section ${sectionName} (need 2 questions summing to 8 marks).`,
          });
        }

        pair.forEach((q) => usedIds.add(q.id));

        paper[sectionName] = [...selectedOneMarks, ...pair];
      }

      return res.json(paper);
    }
  );
});

function parseUnitPortion(unitStr) {
  const match = unitStr.match(/(Unit \d+)([AB])?/i);
  if (!match) {
    return { baseUnit: unitStr, portion: null };
  }
  return {
    baseUnit: match[1],
    portion: match[2] ? match[2].toUpperCase() : null,
  };
}

function pnormalizeUnit(unit) {
  return unit
    .replace("Unit ", "")
    .replace(/([A-Za-z]+)/g, ".$1")
    .split(".")
    .map((v) => (isNaN(v) ? v : parseInt(v)));
}

function pcompareUnits(u1, u2) {
  const a = pnormalizeUnit(u1);
  const b = pnormalizeUnit(u2);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const valA = a[i] !== undefined ? a[i] : 0;
    const valB = b[i] !== undefined ? b[i] : 0;

    if (valA < valB) return -1;
    if (valA > valB) return 1;
  }
  return 0;
}

function pshuffleArray(arr, seed) {
  let rng = new seedrandom(seed);
  let shuffled = arr.slice();

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function pgetPortionFilter(sectionName) {
  const section = sectionName[0];
  const index = sectionName[1];

  if (section === "C") return ["A"];
  if (index === "1") return ["A"];
  if (index === "2") return ["A", "B"];
  if (index === "3") return ["B"];
  return ["A", "B"];
}

function pisPortionAllowed(portion, allowedPortions) {
  if (!portion) return false;
  const normalized = portion.toUpperCase();
  if (normalized === "A&B") {
    return allowedPortions.includes("A") && allowedPortions.includes("B");
  }
  return allowedPortions.includes(normalized);
}

function pisMCQ(q) {
  return (
    q.mark === 1 &&
    q.option_a && q.option_b && q.option_c && q.option_d
  );
}

function pgroupQuestions(baseUnit, questions, usedIds, sectionName, portionFilter = null) {
  const allowedPortions = pgetPortionFilter(sectionName);
  const portionsToCheck = portionFilter ? [portionFilter] : allowedPortions;

  return {
    oneMarks: questions.filter(
      (q) =>
        q.unit === baseUnit &&
        q.mark === 1 &&
        pisMCQ(q) &&
        !usedIds.has(q.id) &&
        pisPortionAllowed(q.portion, portionsToCheck)
    ),
    fourMarks: questions.filter(
      (q) =>
        q.unit === baseUnit &&
        q.mark === 4 &&
        !usedIds.has(q.id) &&
        pisPortionAllowed(q.portion, portionsToCheck)
    ),
    otherMarks: questions.filter(
      (q) =>
        q.unit === baseUnit &&
        q.mark !== 1 &&
        q.mark !== 4 &&
        !usedIds.has(q.id) &&
        pisPortionAllowed(q.portion, portionsToCheck)
    ),
  };
}

function pickMarkCombination(questions, target = 8) {
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const sum = questions[i].mark + questions[j].mark;
      if (sum === target) {
        return [questions[i], questions[j]];
      }
    }
  }
  return null;
}

// ROUTE STARTS HERE
router.get("/generate-qb", (req, res) => {
  const { course_code, from_unit, to_unit } = req.query;

  if (!course_code || !from_unit || !to_unit) {
    return res.status(400).json({ error: "Missing course_code, from_unit, or to_unit" });
  }

  const validRange1 =
    pcompareUnits(from_unit, "Unit 1") === 0 &&
    pcompareUnits(to_unit, "Unit 3A") === 0;

  const validRange2 =
    pcompareUnits(from_unit, "Unit 3B") === 0 &&
    pcompareUnits(to_unit, "Unit 5") === 0;

  if (!validRange1 && !validRange2) {
    return res.status(400).json({ error: "Only Unit 1–3A or Unit 3B–5 are allowed" });
  }

  const rawSectionUnits = validRange1
    ? { A: "Unit 1", B: "Unit 2", C: "Unit 3A" }
    : { A: "Unit 4", B: "Unit 5", C: "Unit 3B" };

  const sectionUnits = {};
  for (const [section, unitStr] of Object.entries(rawSectionUnits)) {
    sectionUnits[section] = parseUnitPortion(unitStr);
  }

  db.query(
    "SELECT * FROM question_status WHERE course_code = ?",
    [course_code],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const randomSalt = Math.floor(Math.random() * 10000);
      const seed = `${course_code}-${from_unit}-${to_unit}-${randomSalt}`;
      const shuffledQuestions = pshuffleArray(results, seed);

      const paper = {};
      const usedIds = new Set();

      // Section A1–A3 and B1–B3
      for (const section of ["A", "B"]) {
        const { baseUnit, portion } = sectionUnits[section];
        for (let i = 1; i <= 3; i++) {
          const sectionKey = `${section}${i}`;
          const { oneMarks, otherMarks } = pgroupQuestions(
            baseUnit,
            shuffledQuestions,
            usedIds,
            sectionKey,
            portion
          );

          if (oneMarks.length < 2) {
            return res.status(400).json({
              error: `Not enough 1-mark MCQs in ${baseUnit} portion ${portion || "Any"} for ${sectionKey}`,
            });
          }

          const selectedOneMarks = oneMarks.splice(0, 2);
          const selectedOtherMarks = pickMarkCombination(otherMarks, 8);

          if (!selectedOtherMarks) {
            return res.status(400).json({
              error: `Not enough valid 2-question combination summing to 8 marks in ${baseUnit} portion ${portion || "Any"} for ${sectionKey}`,
            });
          }

          paper[sectionKey] = [...selectedOneMarks, ...selectedOtherMarks];
          selectedOneMarks.forEach((q) => usedIds.add(q.id));
          selectedOtherMarks.forEach((q) => usedIds.add(q.id));
        }
      }

      // Section C1–C3
      const { baseUnit: baseUnitC, portion: portionC } = sectionUnits.C;
      for (let i = 1; i <= 3; i++) {
        const sectionKey = `C${i}`;
        const { oneMarks, fourMarks } = pgroupQuestions(
          baseUnitC,
          shuffledQuestions,
          usedIds,
          sectionKey,
          portionC
        );

        if (oneMarks.length < 1 || fourMarks.length < 1) {
          return res.status(400).json({
            error: `Not enough valid MCQ + 4-mark in ${baseUnitC} portion ${portionC || "Any"} for ${sectionKey}`,
          });
        }

        const one = oneMarks.shift();
        const four = fourMarks.shift();

        paper[sectionKey] = [one, four];
        usedIds.add(one.id);
        usedIds.add(four.id);
      }

      return res.json(paper);
    }
  );
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
