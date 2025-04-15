import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import Profile from '../../images/profile.png';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Imagecomp } from '../../images/Imagecomp';

const GenerateQB = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [formData, setFormData] = useState({ examName: '', subjectCode: '', subjectName: '' });
  const [clicked, setClicked] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const navigate = useNavigate();
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [bankRows, setBankRows] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:7000/get-faculty-subjects')
      .then((res) => setSubjectOptions(res.data))
      .catch((err) => console.error("Error fetching subject options:", err));
  }, []);

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenModal(false);
    await handleGenerateHistory();
    await generatePaper();
    await GenerateHistory();
    setShowGenerated(true);
  };

  const handleGenerateHistory = async () => {
    try {
      await axios.post("http://localhost:7000/question-history", {
        course_code: formData.subjectCode,
        subject_name: formData.subjectName,
        exam_name: formData.examName,
        date_time: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating paper history:", error);
    }
  };

  const GenerateHistory = async () => {
    try {
      const res = await axios.get("http://localhost:7000/qb-history");
      const formattedRows = res.data.map((row, index) => ({
        id: index + 1,
        course_code: row.course_code,
        subject_name: row.subject_name,
        exam_name: row.exam_name,
        date_time: new Date(row.date_time).toLocaleString()
      }));
      setBankRows(formattedRows);
    } catch (error) {
      console.error("Error fetching paper history:", error);
    }
  };

  useEffect(() => {
    GenerateHistory();
  }, []);

  const generatePaper = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) throw new Error("User not logged in");
      const courseRes = await axios.get(`http://localhost:7000/get-course-code?email=${user.email}`);
      const course = courseRes.data.course_code;
      setCourseCode(course);
      const paperRes = await axios.get(`http://localhost:7000/generate-qb?course_code=${course}`);
      setPaper(paperRes.data);
    } catch (err) {
      console.error("Error generating paper:", err);
      alert("Failed to generate paper. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;
    const input = document.getElementById('question-paper');
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('question-paper.pdf');
    });
  };

  const sections = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
  const bankColumns = [
    { field: 'id', headerName: 'ID', width: 125 },
    { field: 'course_code', headerName: 'Course Code', width: 250 },
    { field: 'subject_name', headerName: 'Subject', width: 300 },
    { field: 'exam_name', headerName: 'Exam Name', width: 200 },
    { field: 'date_time', headerName: 'Generated At', width: 300 },
  ];

  return (
    <div className="flex h-auto min-h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>
      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5 pb-10">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">

          <h2 className="text-2xl font-bold text-gray-800">QUESTION BANK HISTORY</h2>
           <Imagecomp />
        </div>

        <div className="flex justify-end mb-4">
          <Tooltip title="CLICK TO GENERATE NEW QB" enterDelay={500} leaveDelay={300}>
            <button className="bg-blue-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-700" onClick={() => setOpenModal(true)}>GENERATE</button>
          </Tooltip>
        </div>

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-[450px] shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-center">GENERATE QUESTION BANK</h2>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="block font-semibold mb-1">Exam Name :</label>
                  <select name="examName" value={formData.examName} onChange={handleChange} className="w-full bg-gray-200 rounded-md px-4 py-2 pr-10" required>
                    <option value="">-- Select Exam --</option>
                    <option value="PT-1">PT-1</option>
                    <option value="PT-2">PT-2</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject :</label>
                  <select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={(e) => {
                      const selected = subjectOptions.find(s => s.course_code === e.target.value);
                      setFormData({
                        ...formData,
                        subjectCode: e.target.value,
                        subjectName: selected?.subject_name || ''
                      });
                    }}
                    className="w-full bg-gray-200 rounded-md px-4 py-2"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {subjectOptions.map((subject, idx) => (
                      <option key={idx} value={subject.course_code}>
                        {subject.course_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex justify-center">
                  <button type="submit" className="bg-blue-500 px-10 py-3 text-white font-semibold rounded-lg hover:bg-blue-600">
                    GENERATE
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => setOpenModal(false)} className="text-lg px-10 py-2 rounded-md text-white bg-slate-700 hover:underline">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Paper sx={{ height: 550, width: '100%', p: 2, mb: 6 }}>
          <DataGrid
            rows={bankRows}
            columns={bankColumns}
            pageSizeOptions={[6, 10]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 6 } } }}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            rowHeight={60}
          />
        </Paper>

        {showGenerated && paper && (
          <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ marginBottom: '20px' }}>📄 Generated Question Paper</h1>
            <p><strong>Course Code:</strong> {courseCode}</p>

            <div className="mb-4">
              <button onClick={exportToPDF} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
                Export to PDF
              </button>
            </div>

            <div id="question-paper">
              {sections.map(section => (
                <div key={section} style={{ marginBottom: '30px' }}>
                  <h2>Section {section}</h2>
                  {paper[section] && paper[section].length > 0 ? (
                    paper[section].sort((a, b) => a.mark - b.mark).map((q, idx) => (
                      <div key={q.id || idx} style={{ marginLeft: '20px', marginBottom: '15px' }}>
                        <p><strong>Q{idx + 1}:</strong> {q.question} <em>({q.mark} mark{q.mark > 1 ? 's' : ''})</em></p>
                        {q.mark === 1 && (
                          <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                            <li><strong>A)</strong> {q.option_a}</li>
                            <li><strong>B)</strong> {q.option_b}</li>
                            <li><strong>C)</strong> {q.option_c}</li>
                            <li><strong>D)</strong> {q.option_d}</li>
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ marginLeft: '20px' }}>No questions selected for this section.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQB;
