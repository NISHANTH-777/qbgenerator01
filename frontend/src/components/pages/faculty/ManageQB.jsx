import { Eye, Pencil, Trash } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from '../../navbar/FacultyNavbar';
import { Imagecomp } from '../../images/Imagecomp';

const ManageQB = () => {
  const [questionRows, setQuestionRows] = useState([]);
  const [courseCode, setCourseCode] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      axios
        .get("http://localhost:7000/get-course-code", {
          params: { email: user.email },
        })
        .then((res) => {
          setCourseCode(res.data.course_code);
        })
        .catch((err) => console.error("Error fetching course code:", err));
    }
  }, []);

  useEffect(() => {
    if (courseCode) {
      axios
        .get(`http://localhost:7000/faculty-question-list?course_code=${courseCode}`)
        .then((res) => {
          const formattedRows = res.data.map((item, index) => ({
            id: index + 1,
            facultyId: item.id,
            code: item.courseCode || courseCode,
            unit: item.unit,
            datetime: new Date(item.updated_at).toLocaleString(),
          }));
          setQuestionRows(formattedRows);
        })
        .catch((err) => {
          console.error("Error fetching question data:", err);
        });
    }
  }, [courseCode]);

  const handleView = (rowId) => {
    const selected = questionRows.find(row => row.id === rowId);
    axios
      .get(`http://localhost:7000/question-view/${selected.facultyId}`)
      .then((res) => {
        setSelectedQuestion(res.data[0]);
        setViewModalOpen(true);
      })
      .catch((err) => console.error("Error viewing question:", err));
  };

  const handleEdit = (rowId) => {
    const selected = questionRows.find(row => row.id === rowId);
    axios
      .get(`http://localhost:7000/question-view/${selected.facultyId}`)
      .then((res) => {
        setSelectedQuestion(res.data[0]);
        setEditModalOpen(true);
      })
      .catch((err) => console.error("Error fetching for edit:", err));
  };

  const handleSaveEdit = () => {
    const { id, exam_name, unit, topic, mark, question, answer } = selectedQuestion;

    axios
      .put(`http://localhost:7000/question-edit/${id}`, {
        exam_name, unit, topic, mark, question, answer,
      })
      .then(() => {
        setEditModalOpen(false);
        setSelectedQuestion(null);
        window.location.reload(); // Refresh to update table
      })
      .catch((err) => console.error("Error updating question:", err));
  };

  const handleDelete = (rowId) => {
    const selected = questionRows.find(row => row.id === rowId);
    if (window.confirm("Are you sure you want to delete this question?")) {
      axios
        .delete(`http://localhost:7000/question-delete/${selected.facultyId}`)
        .then(() => {
          setQuestionRows(prev => prev.filter(row => row.id !== rowId));
        })
        .catch((err) => console.error("Error deleting question:", err));
    }
  };

  const questionColumns = [
    { field: 'facultyId', headerName: 'Faculty ID', width: 200 },
    { field: 'code', headerName: 'Course Code', width: 250 },
    { field: 'unit', headerName: 'Unit', width: 250 },
    { field: 'datetime', headerName: 'Date & Time', width: 275 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-4 items-center">
          <button onClick={() => handleView(params.row.id)} title="View">
            <Eye className="text-blue-500 hover:scale-110 transition-transform" size={20} />
          </button>
          <button onClick={() => handleEdit(params.row.id)} title="Edit">
            <Pencil className="text-green-500 hover:scale-110 transition-transform" size={20} />
          </button>
          <button onClick={() => handleDelete(params.row.id)} title="Delete">
            <Trash className="text-red-500 hover:scale-110 transition-transform" size={20} />
          </button>
        </div>
      ),
    },
  ];


  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <FacultyNavbar />
      </div>

      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">QUESTION ADDED DETAILS</h2>
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

        {/* View Modal */}
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
              <button
                onClick={() => setViewModalOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
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
