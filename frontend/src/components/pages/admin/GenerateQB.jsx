import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import AdminNavbar from "../../navbar/AdminNavbar";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Imagecomp } from "../../images/Imagecomp";
import bitlogo from '../../images/bitlogo.png';
import Select from 'react-select';

const GenerateQuestion = () => {
  const token = localStorage.getItem('token');
  const [paperData, setPaperData] = useState(null);
  const [formData, setFormData] = useState({
    course_code: "",
    semester: "",
    set:"",
    from_unit: "",
    to_unit: "",
    department: [], 
    exam_type: "",
    exam_month: ""
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [error, setError] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

   const departmentOptions = [
    { value: 'ALL', label: 'All Departments' },
    { value: 'C.S.E', label: 'C.S.E' },
    { value: 'C.S.B.S', label: 'C.S.B.S' },
    { value: 'E.E.E', label: 'E.E.E' },
    { value: 'M.E', label: 'M.E' },
    { value: 'I.T', label: 'I.T' },
    { value: 'A.I.D.S', label: 'A.I.D.S' },
    { value: 'A.I.M.L', label: 'A.I.M.L' },
    { value: 'B.T', label: 'B.T' },
  ];

  const handleDepartmentChange = (selectedOptions) => {
  if (!selectedOptions) {
    setFormData({ ...formData, department: [] });
    return;
  }

  const hasAll = selectedOptions.find(opt => opt.value === 'ALL');

  if (hasAll) {
    const allDepartments = departmentOptions
      .filter(opt => opt.value !== 'ALL')
      .map(opt => opt.value);

    setFormData({ ...formData, department: allDepartments });
  } else {
    const selectedValues = selectedOptions.map(opt => opt.value);
    setFormData({ ...formData, department: selectedValues });
  }
};

useEffect(() => {
  if (formData.exam_type === "End Semester") {
    setFormData((prev) => ({
      ...prev,
      from_unit: "Unit 1",
      to_unit: "Unit 5",
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      from_unit: "",
      to_unit: "",
    }));
  }
}, [formData.exam_type]);

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/admin/get-faculty-subjects", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }})
      .then((res) => setSubjectOptions(res.data))
      .catch((err) => console.error("Error fetching subject options:", err));
  }, []);

 const fetchPaper = async () => {
  const { from_unit, to_unit, course_code, department, exam_type } = formData;

  if (!course_code || !department || !exam_type) {
    setError("Please fill all the fields before generating the paper.");
    return;
  }

  try {
    let res;

    if (exam_type === "End Semester") {
      res = await axios.get(
        `http://localhost:7000/api/admin/generate-semester-qb?course_code=${course_code}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
    } else {
      if (!from_unit || !to_unit) {
        setError("Please select units for internal exams.");
        return;
      }

      const from = from_unit.replace("Unit ", "");
      const to = to_unit.replace("Unit ", "");

      res = await axios.get(
        `http://localhost:7000/api/admin/generate-qb?course_code=${course_code}&from_unit=${from}&to_unit=${to}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
    }

    if (res.data.error) {
      setError(res.data.error);
      setPaperData(null);
    } else {
      const subject = subjectOptions.find(
        (s) => s.course_code === course_code
      );

      await axios.post("http://localhost:7000/api/admin/generate-history", {
        course_code: course_code,
        subject_name: subject?.subject_name || "Subject Name",
        exam_name: exam_type
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setPaperData({
        college: "Bannari Amman Institute of Technology",
        exam_name: exam_type,
        department: `IV Sem – B.E. / B.Tech. ${department}`,
        course_code,
        subject_name: subject?.subject_name || "Subject Name",
        time: "1:30 hrs",
        max_marks: exam_type.toLowerCase() === "end semester" ? 100 : 50,
        instructions: [
          "1. Students should not mark/write anything on the Question Paper other than the register number.",
          "2. Section A of the Question Paper contains questions for 15 Marks. Sections B and C contain questions for 30 Marks each.",
          "3. Section A: 10 marks, Section B: 20 marks, Section C: 20 marks. Students can attempt answering any two out of three subsections in each section. The maximum mark is limited to 10 in section A and 20 in section B & C.",
        ],
        paper: res.data,
      });
      setError("");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to generate question paper.");
  }
};

  

  const exportToPDF = () => {
    const element = document.getElementById("question-paper");
  
    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `${paperData.course_code}_question_paper.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };
  
  
    html2pdf()
      .set(opt)
      .from(element)
      .save();
  };

  const renderQuestions = (sectionData, sectionLabel) => (
    <div className="section-wrapper">
      <table className="w-full border border-gray-400 text-sm mt-4 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black px-2 py-2" style={{ width: '15%' }}>Section</th>
            <th className="border border-black px-2 py-2" style={{ width: '15%' }}>Q. No</th>
            <th className="border border-black px-2 py-2" style={{ width: '70%' }}>Question</th>
          </tr>
        </thead>
        <tbody>
          {sectionData?.map((q, idx) => (
            <tr key={q.id || idx} className="align-top">
              {idx === 0 && (
                <td
                  className="border border-black px-2 py-3 text-center"
                  rowSpan={sectionData.length}
                >
                  {sectionLabel}
                </td>
              )}
              <td className="border border-black px-2 py-3 text-center">
                ({toRoman(1 + idx)})
              </td>
              <td className="border border-black px-3 py-3 whitespace-pre-line">
                <div>{q.question}</div>
                {q.mark === 1 && (
                  <div className="mt-2">
                    <div>i) {q.option_a}</div>
                    <div>ii) {q.option_b}</div>
                    <div>iii) {q.option_c}</div>
                    <div>iv) {q.option_d}</div>
                  </div>
                )}
                <div className="text-right mt-2">({q.mark} Mark - [ {q.cognitive_dimension}/{q.knowledge_dimension} ])</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function toRoman(num) {
  const romans = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];

  let result = "";
  for (const [roman, value] of romans) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result.toLowerCase(); 
}

return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex flex-col fixed top-0 left-0 w-56 h-screen bg-white shadow-md z-50">
        <AdminNavbar />
      </div>

      <Drawer
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            top: 0,
            height: "100vh",
          },
        }}
      >
        <AdminNavbar />
      </Drawer>

      <div className="flex flex-col w-full h-screen overflow-y-auto mb-5 p-4 lg:ml-64">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md rounded-md">
          <div className="block lg:hidden">
            <IconButton
              onClick={() => setOpenSidebar(true)}
              edge="start"
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left mb-2 sm:mb-0 flex-grow">
            Generate Question Paper
          </h2>

          <Imagecomp />
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <select
            name="course_code"
            value={formData.course_code}
            onChange={(e) =>
              setFormData({ ...formData, course_code: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
          >
            <option value="">-- Select Subject --</option>
            {subjectOptions.map((subject, idx) => (
              <option key={idx} value={subject.course_code}>
                {subject.course_code} - {subject.subject_name}
              </option>
            ))}
          </select>

          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={(e) =>
            setFormData({ ...formData, exam_type: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
            >
            <option value="">-- Select Exam Type --</option>
            <option value="Periodical Test - I">PT-1</option>
            <option value="Periodical Test - II">PT-2</option>
            <option value="Optional Test - I">Optional Test - 1</option>
            <option value="Optional Test - II">Optional Test - 2</option>
            <option value="End Semester">End Semester</option>
          </select>

          {formData.exam_type !== "End Semester" && (
            <div className="flex gap-3">
              <select
                name="from_unit"
                value={formData.from_unit}
                onChange={(e) =>
                  setFormData({ ...formData, from_unit: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded mb-4"
              >
                <option value="">From Unit</option>
                {["Unit 1", "Unit 2", "Unit 3", "Unit 3A", "Unit 3B", "Unit 4", "Unit 5"].map((unit, idx) => (
                  <option key={idx} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <select
                name="to_unit"
                value={formData.to_unit}
                onChange={(e) =>
                  setFormData({ ...formData, to_unit: e.target.value })
                }
                className="w-1/2 p-3 border border-gray-300 rounded mb-4"
              >
                <option value="">To Unit</option>
                {["Unit 1", "Unit 2", "Unit 3", "Unit 3A", "Unit 3B", "Unit 4", "Unit 5"].map((unit, idx) => (
                  <option key={idx} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          )}

            <input 
            type="text"
            name="exam_month"
            placeholder="-- Exam Month --"
            required
            value={formData.exam_month}
            onChange={(e) =>
              setFormData({ ...formData, exam_month: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
         
          <select
            name="semester"
            value={formData.semester}
            onChange={(e) =>
              setFormData({ ...formData, semester: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
          >
            <option value="">-- Select Semester --</option>
            <option value="I">1</option>
            <option value="II">2</option>
            <option value="III">3</option>
            <option value="IV">4</option>
            <option value="V">5</option>
            <option value="VI">6</option>
            <option value="VII">7</option>
            <option value="VIII">8</option>
           
          </select>

          <Select
            isMulti
            name="department"
            options={departmentOptions}
           value={departmentOptions
                .filter(option =>
                formData.department.includes(option.value)
             )}
            onChange={handleDepartmentChange}
            className="w-full mb-4"
            placeholder="-- Select Department --"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: 'white', 
                borderColor: '#ccc',  
                padding: '5px', 
              }),
              option: (provided) => ({
                ...provided,
                backgroundColor: 'white', 
                color: 'black', 
                ':hover': {
                  backgroundColor: '#f5f5f5', 
                  color: 'black',
                },
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: 'white', 
                color: 'black',
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: 'black', 
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: 'black', 
                ':hover': {
                  backgroundColor: 'black', 
                  color: 'white',
                },
              }),
            }}
          />

          <select 
          name="set"
          value={formData.set}
          onChange={(e) =>
              setFormData({ ...formData, set: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
            required
          >
            <option value="">-- Select Set --</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>

          <button
            onClick={fetchPaper}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Generate Paper
          </button>

          {error && (
            <div className="text-red-600 mt-3 text-center font-medium">
              {error}
            </div>
          )}
        </div>

        {paperData && (
          <>
            <div className="flex justify-end mt-6">
              <button
                onClick={exportToPDF}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Export to PDF
              </button>
            </div>

            <div
              id="question-paper"
              className="mt-6 p-12 bg-white text-black leading-relaxed border rounded shadow"
              style={{ 
                paddingTop: "60px",
                paddingBottom: "60px",
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
               }}
            >
              <div className="flex justify-between mb-6">
                <div className="border border-black px-4 py-3 text-md font-semibold">
                  Regulation: 2022
                </div>
                <div className="border border-black px-4 py-3 text-lg font-semibold">
                  {formData.set}
                </div>
              </div>

              <div className="flex items-center justify-end mb-6 gap-2">
                <div className="text-sm font-semibold">Reg No :</div>
                <div className="flex">
                  {[...Array(12)].map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="w-8 h-8 text-center border border-black text-sm font-semibold"
                      maxLength="1"
                    />
                  ))}
                </div>
              </div>

              <div className="border border-black rounded-md mb-6 shadow-sm">
                  <div className="flex items-stretch justify-center ">
                    <div className="border-r border-black flex justify-center items-center w-1/6 py-4">
                      <img
                        src={bitlogo}
                        alt="BIT LOGO"
                        className="w-48 h-36 object-contain"
                      />
                    </div>
                    <div className="flex flex-col w-full justify-center">
                      <div className="text-center mb-2 border-b border-black pb-2">
                        <h1 className="text-lg font-bold uppercase">
                          {paperData.college}
                        </h1>
                        <p className="text-sm italic">
                          (An Autonomous Institution Affiliated to Anna University)
                        </p>
                        <p className="text-md font-semibold">
                          SATHYAMANGALAM - 638 401
                        </p>
                      </div>

                      <div className="text-center pt-2">
                        <h2 className="text-md font-semibold">
                          {formData.exam_type && ` ${formData.exam_type}`} - {formData.exam_month}
                        </h2>

                        {formData.department && (
                          <div className="text-sm font-semibold my-1">
                           <strong>{formData.semester}</strong> Semester
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


              <div className="flex flex-col text-sm mb-4">
                <div>
                  <strong>Degree & Branch : </strong> B.E/B.Tech - {formData.department.join(", ")} 
                </div>
                <div className="flex mt-2 justify-between">
                  <div className="mr-4">
                    <strong>Time:</strong> {paperData.time}
                  </div>
                  <div>
                    <strong>Max Marks:</strong> {paperData.max_marks}
                  </div>
                </div>
              </div>

              <div className="border border-black px-8 py-5 mb-6 ">
                <h3 className="font-semibold underline mb-2">Instructions:</h3>
                <ul className="list-disc list-inside text-sm mb-4">
                  {paperData.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>

                {Object.entries(paperData.paper).map(([section, questions]) => (
                  <div key={section} className="mb-6 ">
                    <h4 className="text-md font-bold mb-2 text-center">Section {section}</h4>
                    {renderQuestions(questions, section)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateQuestion;
