import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import AdminNavbar from "../../navbar/AdminNavbar";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Imagecomp } from "../../images/Imagecomp";
import bitlogo from '../../images/bitlogo.png';

const GenerateQuestion = () => {
  const token = localStorage.getItem('token');
  const [paperData, setPaperData] = useState(null);
  const [formData, setFormData] = useState({
    course_code: "",
    from_unit: "",
    to_unit: "",
    department: "", 
    exam_type: "",
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([ 
    { id: 1, name: "C.S.E" },
    { id: 2, name: "E.E.E" },
    { id: 3, name: "A.I.M.L" },
    { id: 4, name: "C.S.B.S" },
    { id: 5, name: "I.T" },
    { id: 6, name: "A.I.D.S" },
  ]);
  const [error, setError] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

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
  
    // Validation
    if (!course_code || !from_unit || !to_unit || !department || !exam_type) {
      setError("Please fill all the fields before generating the paper.");
      return;
    }
  
    try {
      const from = from_unit.replace("Unit ", "");
      const to = to_unit.replace("Unit ", "");
  
      const res = await axios.get(
        `http://localhost:7000/api/admin/generate-qb?course_code=${course_code}&from_unit=${from}&to_unit=${to}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
  
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
          max_marks: 50,
          instructions: [
            "1.Students should not mark/write anything on the Question Paper other than the register number.",
            "2.Section A of the Question Paper contains questions for 15 Marks. Sections B and C contain questions for 30 Marks each.",
            "3.Section A: 10 marks, Section B: 20 marks, Section C: 20 marks.Students can attempt answering any two out of three subsections in each section. The maximum mark is limited to 10 in section A and 20 in section B&C.",
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
      margin: [0.2, 0.2, 0.2, 0.2], // Very small margin for compact content
      filename: `${paperData.course_code}_question_paper.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
      // No pagebreak option here
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
            <th className="border border-gray-400 px-2 py-2" style={{ width: '15%' }}>Section</th>
            <th className="border border-gray-400 px-2 py-2" style={{ width: '15%' }}>Q. No</th>
            <th className="border border-gray-400 px-2 py-2" style={{ width: '70%' }}>Question</th>
          </tr>
        </thead>
        <tbody>
          {sectionData?.map((q, idx) => (
            <tr key={q.id || idx} className="align-top">
              {idx === 0 && (
                <td
                  className="border border-gray-400 px-2 py-3 text-center"
                  rowSpan={sectionData.length}
                >
                  {sectionLabel}
                </td>
              )}
              <td className="border border-gray-400 px-2 py-3 text-center">
                ({String.fromCharCode(97 + idx)})
              </td>
              <td className="border border-gray-400 px-3 py-3 whitespace-pre-line">
                <div>{q.question}</div>
                {q.mark === 1 && (
                  <div className="mt-2">
                    <div>i) {q.option_a}</div>
                    <div>ii) {q.option_b}</div>
                    <div>iii) {q.option_c}</div>
                    <div>iv) {q.option_d}</div>
                  </div>
                )}
                <div className="text-right mt-2">({q.mark} Mark)</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
          </select>

          <select
            name="department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded mb-4"
            required
          >
            <option value="">-- Select Department --</option>
            {departmentOptions.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
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
              className="mt-6 p-12 bg-white text-black font-serif leading-relaxed border rounded shadow"
              style={{ paddingTop: "60px", paddingBottom: "60px" }}
            >
              <div className="flex justify-between mb-6">
                <div className="border border-black px-4 py-3 text-md font-semibold">
                  Regulation: 2022
                </div>
                <div className="border border-black px-4 py-3 text-lg font-semibold">
                  A
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

              <div className="border border-black rounded-md p-4 mb-6 shadow-sm">
                <div className="flex items-start justify-center gap-4">
                  <div className="pr-4 border-r border-black flex justify-center items-center">
                    <img
                      src={bitlogo}
                      alt="BIT LOGO"
                      className="w-48 h-36 object-contain"
                    />
                  </div>

                  <div className="flex flex-col w-full px-4">
                    <div className="text-center pb-2 border-b border-black">
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
                       {formData.exam_type && ` ${formData.exam_type}`}
                     </h2>


                     {formData.department && (
                         <div className="text-sm font-semibold mt-2 ">
                           Department :  <strong>{formData.department}</strong>
                         </div>
                       )}
                     </div>

                  </div>
                </div>
              </div>

              <div className="flex flex-col text-sm mb-4">
                <div>
                  <strong>Subject:</strong> {paperData.subject_name} (
                  {paperData.course_code})
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
