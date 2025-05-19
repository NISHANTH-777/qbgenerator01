import { Eye, Pencil, Trash, Menu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from '../../navbar/FacultyNavbar';
import { Imagecomp } from '../../images/Imagecomp';
import { useSelector } from 'react-redux';


const ManageQB = () => {
  const [questionRows, setQuestionRows] = useState([]);
  const [courseCode, setCourseCode] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const token = localStorage.getItem('token');

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);    
   const email = user.email

   useEffect(() => {
  
    if (email && token) {
      axios
        .get("http://localhost:7000/api/faculty/get-course-code", {
          params: { email: email },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setCourseCode(res.data.course_code);
        })
        .catch((err) => console.error("Error fetching course code:", err));
    }
  }, [email]); 
  

  useEffect(() => {
    if (courseCode) {
      
  
      axios
        .get(`http://localhost:7000/api/admin/faculty-question-list?course_code=${courseCode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          const formattedRows = res.data.map((item, index) => ({
            id: index + 1,
            questionId: item.question_id,
            facultyId: item.faculty_id,
            question : item.question,
            // code: item.courseCode || courseCode,
            unit: item.unit,
            datetime: new Date(item.updated_at).toLocaleString(),
            status: item.status,
          }));
          setQuestionRows(formattedRows);
        })
        .catch((err) => {
          console.error("Error fetching question data:", err);
        });
    }
  }, [courseCode]);
  
  const handleView = (rowId) => {
    const selected = questionRows.find(row => row.questionId === rowId);
    // console.log(selected)
    const token = localStorage.getItem("token");
  
    axios
      .get(`http://localhost:7000/api/faculty/question-view/${selected.questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSelectedQuestion(res.data[0]);
        console.log(selectedQuestion)
        setViewModalOpen(true);
      })
      .catch((err) => console.error("Error viewing question:", err));
  };
  
  const handleEdit = (rowId) => {
    const selected = questionRows.find(row => row.questionId === rowId);
    console.log(selected)
    const token = localStorage.getItem("token");
  
    axios
      .get(`http://localhost:7000/api/faculty/question-view/${selected.questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSelectedQuestion(res.data[0]);
        console.log(selectedQuestion)
        setEditModalOpen(true);
      })
      .catch((err) => console.error("Error fetching for edit:", err));
  };
  
  const handleSaveEdit = () => {
    const { id, exam_name, unit, topic, mark, question, answer } = selectedQuestion;
    const token = localStorage.getItem("token");
  
    axios
      .put(
        `http://localhost:7000/api/faculty/question-edit/${selectedQuestion.id}`,
        { exam_name, unit, topic, mark, question, answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setEditModalOpen(false);
        setSelectedQuestion(null);
        window.location.reload();
      })
      .catch((err) => console.error("Error updating question:", err));
  };
  
  const handleDelete = (rowId) => {
    const selected = questionRows.find(row => row.id === rowId);
    const token = localStorage.getItem("token");
  
    if (window.confirm("Are you sure you want to delete this question?")) {
      axios
        .delete(`http://localhost:7000/api/faculty/question-delete/${selected.facultyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setQuestionRows(prev => prev.filter(row => row.id !== rowId));
        })
        .catch((err) => console.error("Error deleting question:", err));
    }
  };
  
  

  const questionColumns = [
    { field: 'facultyId', headerName: 'Faculty ID', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'question', headerName: 'Question', flex: 1 },
    { field: 'datetime', headerName: 'Date & Time', flex: 1.2 },
     { field: 'status' , headerName: 'Status', flex: 1.0 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex gap-4 items-center">
          <button onClick={() => handleView(params.row.questionId)} title="View">
            <Eye className="text-blue-500 hover:scale-110 transition-transform" size={20} />
          </button>
          <button onClick={() => handleEdit(params.row.questionId)} title="Edit">
            <Pencil className="text-green-500 hover:scale-110 transition-transform" size={20} />
          </button>
          <button onClick={() => handleDelete(params.row.questionId)} title="Delete">
            <Trash className="text-red-500 hover:scale-110 transition-transform" size={20} />
          </button>
        </div>
      ),
    },
  ];
  

  return (
    <div className="flex h-screen bg-gray-50">
      
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <FacultyNavbar onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 pl-1 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
     
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md rounded-md">
          <div className="flex items-center gap-4 ">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Manage Question</h2>
          </div>
          <Imagecomp />
        </div>

        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
          <DataGrid
            rows={questionRows}
            columns={questionColumns}
            pageSizeOptions={[6, 10]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 6 } }
            }}
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-[600px] shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Question Details</h2>
              <p><strong>Exam:</strong> {selectedQuestion.exam_name}</p>
              <p><strong>Unit:</strong> {selectedQuestion.unit}</p>
              <p><strong>Topic:</strong> {selectedQuestion.topic}</p>
              <p><strong>Marks:</strong> {selectedQuestion.mark}</p>
              <p><strong>Question:</strong> {selectedQuestion.question}</p>
              <p><strong>Answer:</strong> {selectedQuestion.answer}</p>
              {selectedQuestion.figure && (
                <div className="mt-4">
                  <p><strong>Figure:</strong></p>
                  <img 
                    src={`http://localhost:7000${selectedQuestion.figure}`} 
                    alt="Question Figure" 
                    className="mt-2 max-w-full h-auto border rounded"
                  />
                </div>
              )}
              <button
                onClick={() => setViewModalOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {editModalOpen && selectedQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-xl p-6 w-[600px] shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Edit Question</h2>
              <div className="flex flex-col gap-3">
                <input type="text" value={selectedQuestion.exam_name} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, exam_name: e.target.value })} placeholder="Exam Name" className="border p-2 rounded" />
                <input type="text" value={selectedQuestion.unit} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, unit: e.target.value })} placeholder="Unit" className="border p-2 rounded" />
                <input type="text" value={selectedQuestion.topic} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, topic: e.target.value })} placeholder="Topic" className="border p-2 rounded" />
                <input type="number" value={selectedQuestion.mark} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, mark: e.target.value })} placeholder="Marks" className="border p-2 rounded" />
                <textarea value={selectedQuestion.question} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, question: e.target.value })} placeholder="Question" className="border p-2 rounded" />
                <textarea value={selectedQuestion.answer} onChange={(e) => setSelectedQuestion({ ...selectedQuestion, answer: e.target.value })} placeholder="Answer" className="border p-2 rounded" />
                {selectedQuestion.figure && (
                  <div className="mt-3">
                    <p className="mb-2"><strong>Current Figure:</strong></p>
                    <img 
                      src={`http://localhost:7000${selectedQuestion.figure}`} 
                      alt="Question Figure" 
                      className="max-w-full h-auto max-h-[200px] border rounded mb-2"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQB;
