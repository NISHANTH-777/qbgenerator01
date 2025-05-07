import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import FacultyNavbar from '../../navbar/FacultyNavbar';
import { Imagecomp } from '../../images/Imagecomp';
import { Menu } from 'lucide-react';
import { useSelector } from 'react-redux'; 

const QBDetails = () => {
  const [questionRows, setQuestionRows] = useState([]);
  const [courseCode, setCourseCode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);    
   const email = user.email
  useEffect(() => {
    
    if (email) {
      axios
        .get("http://localhost:7000/api/faculty/get-course-code", {
          params: { email: email },
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
        .get(`http://localhost:7000/api/admin/faculty-question-list?course_code=${courseCode}`)
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

  const questionColumns = [
    { field: 'facultyId', headerName: 'Faculty ID', flex: 1 },
    { field: 'code', headerName: 'Course Code', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'datetime', headerName: 'Date & Time', flex: 1.2 },
  ];
  

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
    
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
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Question Added Details</h2>
          </div>
          <Imagecomp />
        </div>

        <div >
          <Paper sx={{ minWidth: 600, height: 550, p: 2 }}>
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
        </div>
      </div>
    </div>
  );
};

export default QBDetails;
