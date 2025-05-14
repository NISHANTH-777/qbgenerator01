import { Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from '../../navbar/FacultyNavbar';
import { Imagecomp } from '../../images/Imagecomp';
import { useSelector } from 'react-redux';

const VettingPage = () => {
  const [questionRows, setQuestionRows] = useState([]);
  const [courseCode, setCourseCode] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vettingEmail, setVettingEmail] = useState("");
  const [vFacultyId, setVFacultyId] = useState(null);
  const [approvalRemark, setApprovalRemark] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const token = localStorage.getItem('token');
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  console.log("login user" + user);
  const vettingId = user.faculty_id;
  console.log("VettingId" +  vettingId)
  const email = user.email;
  console.log("loginEmail"+email)

  useEffect(() => {
    const fetchFacultyId = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/faculty/get-faculty-id", {
          headers: { Authorization: `Bearer ${token}` },
          params: { vetting_id: vettingId },
        });
        setVFacultyId(res.data.faculty_id);
      } catch (err) {
        console.error("Error fetching faculty_id:", err);
      }
    };

    if (vettingId) fetchFacultyId();
  }, [vettingId]);

  console.log("display faculty id" + vFacultyId);
  useEffect(() => {
    if (!vFacultyId) return;
    const fetchEmail = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/faculty/get-email", {
          headers: { Authorization: `Bearer ${token}` },
          params: { faculty_id: vFacultyId },
        });
        setVettingEmail(res.data.email);
      } catch (err) {
        console.error("Error fetching email:", err);
      }
    };

    fetchEmail();
  }, [vFacultyId]);

  console.log("Vetting Email"+vettingEmail)

  useEffect(() => {
    if (!vettingEmail || !token) return;
    axios
      .get("http://localhost:7000/api/faculty/get-course-code", {
        params: { email: vettingEmail },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourseCode(res.data.course_code))
      .catch((err) => console.error("Error fetching course code:", err));
  }, [vettingEmail, token]);

  console.log("Course code" + courseCode)
  useEffect(() => {
    if (!courseCode) return;
    axios
      .get(`http://localhost:7000/api/admin/faculty-question-list?course_code=${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const formattedRows = res.data.map((item, index) => ({
          id: index + 1,
          facultyId: item.faculty_id,
          questionId: item.question_id,
          code: item.courseCode || courseCode,
          unit: item.unit,
          status: item.status || 'pending',
          datetime: new Date(item.updated_at).toLocaleString(),
        }));
        setQuestionRows(formattedRows);
      })
      .catch((err) => {
        console.error("Error fetching question data:", err);
      });
  }, [courseCode, refreshTrigger]);

  const handleView = (rowId) => {
    const selected = questionRows.find(row => row.id === rowId);
    console.log(selected)
    axios
      .get(`http://localhost:7000/api/faculty/question-view/${selected.questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSelectedQuestion({ ...res.data[0], id: selected.questionId });
        setViewModalOpen(true);
      })
      .catch((err) => console.error("Error viewing question:", err));
  };
console.log(selectedQuestion)
const handleAccept = async () => {
  const status = 'accepted';
  try {
    await axios.put(
      `http://localhost:7000/api/faculty/review-question/${selectedQuestion.id}`,
      { status, remarks: approvalRemark, email },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setViewModalOpen(false);
    setRefreshTrigger(prev => !prev);
  } catch (err) {
    console.error("Error accepting question:", err);
  }
};

const handleReject = async () => {
  const status = 'rejected';
  try {
    await axios.put(
      `http://localhost:7000/api/faculty/review-question/${selectedQuestion.id}`,
      { status, remarks: rejectionReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setViewModalOpen(false);
    setRefreshTrigger(prev => !prev);
  } catch (err) {
    console.error("Error rejecting question:", err);
  }
};


  const questionColumns = [
    { field: 'facultyId', headerName: 'Faculty ID', flex: 1 },
    { field: 'code', headerName: 'Course Code', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'datetime', headerName: 'Date & Time', flex: 1.2 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-2 px-auto">
         <button
          className="flex items-center gap-1 px-6 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-150 w-20 h-8"
           onClick={() => handleView(params.row.id)}
         >
           View
        </button>
       </div>
      ),
    },
  ];

  return (
        <div className="flex h-screen bg-gray-50">
      <div
       className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block w-64`}
     >
       <FacultyNavbar onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
     </div>

    {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black opacity-30 md:hidden" 
        onClick={() => setSidebarOpen(false)}>
        </div>
      )}
      <div className="flex-1 pl-1 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md rounded-md">
         <div className="flex items-center gap-4">
            <button className="block md:hidden text-gray-700" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Vetting Assignments</h2>
          </div>
         <Imagecomp />
       </div>

      <div className="relative w-full">
        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
          <DataGrid
            rows={questionRows}
            columns={questionColumns}
            pageSizeOptions={[6, 10]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 6 } } }}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            rowHeight={60}
            sx={{
                 border: 0,
                '& .MuiDataGrid-row:nth-of-type(odd)': {
                  backgroundColor: '#F7F6FE',
                },
               '& .MuiDataGrid-row:nth-of-type(even)': {
                  backgroundColor: '#ffffff',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#ffffff',
                 fontWeight: 'bold',
                 fontSize: 16,
                },
                '& .MuiDataGrid-row': {
                 alignItems: 'center',
                },
                '& .MuiDataGrid-cell': {
                 display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                 padding: '16px',
               },
              }}
          />
        </Paper>

        {viewModalOpen && selectedQuestion && (
          <div className="absolute top-0 left-0 w-full h-full bg-white z-10 shadow-lg rounded-lg p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 h-full border border-black rounded-md">
                <div className="flex-1 rounded-lg flex flex-col gap-6 bg-white p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Question Details</h2>
              <p><strong>Unit:</strong> {selectedQuestion.unit}</p>
              <p><strong>Topic:</strong> {selectedQuestion.topic}</p>
              <p><strong>Marks:</strong> {selectedQuestion.mark}</p>
              <p><strong>Question:</strong> {selectedQuestion.question}</p>
              <p><strong>Answer:</strong> {selectedQuestion.answer}</p>
            </div>

            <div className="flex-1 flex flex-col justify-between border-l border-black p-6">
                  <div>
                <h1 className='text-center text-xl font-bold mb-6'>Process Of Vetting</h1>
                  <div className="text-sm font-semibold my-1 mb-4">COURSE CODE : {courseCode}</div>
                  <div className="text-sm font-semibold my-1 mb-4">FACULTY ID : {vettingId}</div>

                <div className='flex flex-col gap-4'>
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                      Remarks For Approval :
                    </label>
                  <select
                    value={approvalRemark}
                    onChange={(e) => setApprovalRemark(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded mb-4"
                  >
                    <option value="">-- Select A Remark --</option>
                    <option value="The Quality of the Question is Good">The Quality of the Question is Good</option>
                    <option value="Excellent Question Structure">Excellent Question Structure</option>
                    <option value="Need Improvement">Need Improvement</option>
                  </select>

                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    Reason For Rejection :
                    </label>

                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded mb-4"
                  >
                    <option value="">-- Select A Reason --</option>
                    <option value="The clarity of question is not proper">The clarity of question is not proper</option>
                    <option value="The Question is Incomplete">The Question is Incomplete</option>
                    <option value="The Figure in the Question is not clear">The Figure in the Question is not clear</option>
                  </select>
                </div>

                <div className='flex flex-row items-center justify-around'>
                  <button
                    className="w-48 mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-lg"
                    onClick={handleAccept}
                  >
                    Accept
                  </button>
                  <button
                    className="w-48 mb-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-lg"
                    onClick={handleReject}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <button
                onClick={() => setViewModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default VettingPage;
