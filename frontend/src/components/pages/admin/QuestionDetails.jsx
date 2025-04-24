import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import { DataGrid } from '@mui/x-data-grid';
import { Menu } from 'lucide-react';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Imagecomp } from '../../images/Imagecomp';

const QuestionDetails = () => {
  const [rows, setRows] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
  };

  useEffect(() => {
    axios.get("http://localhost:7000/question-history")
      .then((res) => {
        const formatted = res.data.map((item, index) => ({
          id: index + 1,
          facultyId: item.faculty_id,
          code: item.course_code,
          unit: item.unit,
          datetime: new Date(item.created_at).toLocaleString(),
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const columns = [
    { field: 'facultyId', headerName: 'Faculty ID', flex: 1 },
    { field: 'code', headerName: 'Course Code', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'datetime', headerName: 'Date & Time', flex: 1.2 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <AdminNavbar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto ml-0  p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sticky top-0 z-10 bg-white shadow-md rounded-md p-3 md:p-4">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">QUESTION BANK DETAILS</h2>
          </div>
          <Imagecomp />
        </div>

        {/* Table Section */}
        <div className="pb-6 overflow-x-auto">
          <Paper sx={{ width: "100%", minWidth: 500, p: { xs: 1, sm: 2 } }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[6, 10]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 6 } }
              }}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              rowHeight={60}
              sx={{
                border: 0,
                minWidth: 500,
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

export default QuestionDetails;
