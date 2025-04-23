import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import AdminNavbar from "../../navbar/AdminNavbar";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Imagecomp } from "../../images/Imagecomp";

const SampleQuestionPaper = () => {
  const [paperData, setPaperData] = useState(null);
  const [formData, setFormData] = useState({ course_code: "", unit: "" });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [error, setError] = useState("");
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:7000/get-faculty-subjects")
      .then((res) => setSubjectOptions(res.data))
      .catch((err) => console.error("Error fetching subject options:", err));
  }, []);

  const fetchPaper = async () => {
    try {
      const unit = formData.unit.replace("Unit ", "");
      const res = await axios.get(`http://localhost:7000/generate-qb?course_code=${formData.course_code}&unit=${unit}`);
      if (res.data.error) {
        setError(res.data.error);
        setPaperData(null);
      } else {
        const subject = subjectOptions.find(s => s.course_code === formData.course_code);
        setPaperData({
          college: "Bannari Amman Institute of Technology",
          exam_name: "Periodical Test – II",
          department: "IV Sem – B.E. / B.Tech. CSE",
          course_code: formData.course_code,
          subject_name: subject?.subject_name || "Subject Name",
          time: "1:30 hrs",
          max_marks: 50,
          instructions: [
            "1.Students should not mark/write anything on the Question Paper other than the register number.",
            "2.Section A of the Question Paper contains questions for 15 Marks. Sections B and C contain questions for 30 Marks each.",
            "3.Section A: 10 marks, Section B: 20 marks, Section C: 20 marks.Students can attempt answering any two out of three subsections in each section. The maximum mark is limited to 10 in section A and 20 in section B&C."
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
      margin: [0.75, 0.5],
      filename: `${paperData.course_code}_question_paper.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const renderQuestions = (sectionData) => (
    <table className="w-full border border-gray-400 text-sm mt-4 mb-6">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-400 px-2 py-2">Q. No</th>
          <th className="border border-gray-400 px-2 py-2">Question</th>
          <th className="border border-gray-400 px-2 py-2">Marks</th>
        </tr>
      </thead>
      <tbody>
        {sectionData?.map((q, idx) => (
          <React.Fragment key={q.id || idx}>
            <tr className="align-top">
              <td className="border border-gray-400 px-2 py-3 text-center">Q{idx + 1}</td>
              <td className="border border-gray-400 px-3 py-3">
                {q.question}
                {q.mark === 1 && (
                  <ul className="pl-4 mt-1 list-none">
                    <li><strong>A)</strong> {q.option_a}</li>
                    <li><strong>B)</strong> {q.option_b}</li>
                    <li><strong>C)</strong> {q.option_c}</li>
                    <li><strong>D)</strong> {q.option_d}</li>
                  </ul>
                )}
              </td>
              <td className="border border-gray-400 px-2 py-3 text-center">{q.mark}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
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
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 250,
            top: 0,
            height: '100vh',
          },
        }}
      >
        <AdminNavbar />
      </Drawer>

      <div className="flex-1 px-4 sm:px-6 md:px-8 bg-gray-50 overflow-y-auto lg:ml-56">
        <div className="flex justify-between items-center mb-5 p-4 -mr-8 sticky top-0 z-10 bg-white shadow-md">
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left mb-2 sm:mb-0">
            Generate Question Paper
          </h2>
          <Imagecomp />
        </div>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <select
            name="course_code"
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
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
            name="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded mb-4"
          >
            <option value="">Select Unit</option>
            <option value="Unit 1">Unit 1</option>
            <option value="Unit 2">Unit 2</option>
            <option value="Unit 3">Unit 3</option>
            <option value="Unit 4">Unit 4</option>
            <option value="Unit 5">Unit 5</option>
          </select>

          <button
            onClick={fetchPaper}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Generate Paper
          </button>

          {error && <div className="text-red-600 mt-3 text-center font-medium">{error}</div>}
        </div>

        {paperData && (
          <>
            <div className="flex justify-end mt-6">
              <button
                onClick={exportToPDF}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Export to PDF
              </button>
            </div>

            <div
              id="question-paper"
              className="mt-6 p-12 bg-white text-black font-serif leading-relaxed border rounded shadow"
              style={{ paddingTop: '60px', paddingBottom: '60px' }}
            >
              <h1 className="text-center text-xl font-bold uppercase">
                {paperData.college}
              </h1>
              <p className="text-center text-sm italic mb-2">
                (An Autonomous Institution Affiliated to Anna University)
              </p>
              <h2 className="text-center text-md font-semibold">{paperData.exam_name}</h2>
              <p className="text-center text-sm mb-6">{paperData.department}</p>

              <div className="flex justify-between text-sm mb-4">
                <div><strong>Subject:</strong> {paperData.subject_name} ({paperData.course_code})</div>
                <div><strong>Time:</strong> {paperData.time}</div>
                <div><strong>Max Marks:</strong> {paperData.max_marks}</div>
              </div>

              <h3 className="font-semibold underline mb-2">Instructions:</h3>
              <ul className="list-disc list-inside text-sm mb-4">
                {paperData.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>

              {Object.entries(paperData.paper).map(([section, questions]) => (
                <div key={section} className="mb-6">
                  <h4 className="text-md font-bold">Section {section}</h4>
                  <table className="w-full border border-gray-400 text-sm mt-4 mb-6">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-400 px-2 py-2">Q. No</th>
                        <th className="border border-gray-400 px-2 py-2">Question</th>
                        <th className="border border-gray-400 px-2 py-2">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions?.map((q, idx) => (
                        <tr className="align-top" key={q.id || idx}>
                          <td className="border border-gray-400 px-2 py-3 text-center">Q{idx + 1}</td>
                          <td className="border border-gray-400 px-3 py-3">
                            {q.question}
                            {q.mark === 1 && (
                              <ul className="pl-4 mt-1 list-none">
                                <li><strong>A)</strong> {q.option_a}</li>
                                <li><strong>B)</strong> {q.option_b}</li>
                                <li><strong>C)</strong> {q.option_c}</li>
                                <li><strong>D)</strong> {q.option_d}</li>
                              </ul>
                            )}
                          </td>
                          <td className="border border-gray-400 px-2 py-3 text-center">{q.mark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SampleQuestionPaper;