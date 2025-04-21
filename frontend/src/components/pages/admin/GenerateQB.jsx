import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Imagecomp } from '../../images/Imagecomp';
import { Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


const GenerateQB = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ unit: '', subjectCode: '', subjectName: '' });
  const [clicked, setClicked] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [openSidebar, setOpenSidebar] = useState(false);
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
    // await handleGenerateHistory();
    await generatePaper();
    await GenerateHistory();
    setShowGenerated(true);
  };



  const GenerateHistory = async () => {
    try {
      const res = await axios.get("http://localhost:7000/qb-history");
      const formattedRows = res.data.map((row, index) => ({
        id: index + 1,
        course_code: row.course_code,
        subject_name: row.subject_name,
        exam_name: row.exam_name,
        date_time: new Date(row.date_time).toLocaleString(),
      }));
      setBankRows(formattedRows);
    } catch (error) {
      console.error(" handleGenerateHistoryror fetching paper history:");
    }
  };

  useEffect(() => {
    GenerateHistory();
  }, []);

  const generatePaper = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const course = formData.subjectCode;
      const unit = formData.unit.replace("Unit ", "");
      const paperRes = await axios.get(`http://localhost:7000/generate-qb?course_code=${course}&unit=${unit}`);
      
      if (paperRes.data.error) {
        setErrorMessage(paperRes.data.error); // 👈 shows "Not enough questions" error
        return;
      }
  
      setPaper(paperRes.data);
    } catch (err) {
      console.error("Error generating paper:", err);
      if (err.response && err.response.data?.error) {
        setErrorMessage(err.response.data.error); // 👈 show backend 400 error
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const exportToPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('question-paper');
    const opt = {
      margin: 0.5,
      filename: 'question-paper.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
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
            QUESTION BANK HISTORY
          </h2>
          <Imagecomp />
        </div>

        {errorMessage && (
  <div className="text-red-600 font-medium text-center mt-4">
    {errorMessage}
  </div>
)}

        <div className="flex justify-end mb-4 ml-4">
          <Tooltip title="CLICK TO GENERATE NEW QB" enterDelay={500} leaveDelay={300}>
            <button
              className="bg-blue-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-700 transition"
              onClick={() => setOpenModal(true)}
            >
              GENERATE
            </button>
          </Tooltip>
        </div>

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-xl max-h-full overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-bold mb-6 text-center">GENERATE QUESTION BANK</h2>
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
                <div>
                  <label className="block font-semibold mb-1">Unit:</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full bg-gray-200 rounded-md px-4 py-2"
                    required
                  >
                    <option value="">Unit</option>
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                    <option value="Unit 5">Unit 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject:</label>
                  <select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={(e) => {
                      const selected = subjectOptions.find(s => s.course_code === e.target.value);
                      setFormData({
                        ...formData,
                        subjectCode: e.target.value,
                        subjectName: selected?.subject_name || '',
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

        <div className="ml-4">
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
        </div>

        {showGenerated && paper && (
          <div className="ml-4" style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
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
