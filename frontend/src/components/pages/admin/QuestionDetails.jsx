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
    { field: 'facultyId', headerName: 'Faculty ID', width: 285 },
    { field: 'code', headerName: 'Course Code', width: 280 },
    { field: 'unit', headerName: 'Unit', width: 300 },
    { field: 'datetime', headerName: 'Date & Time', width: 350 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
   
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block w-64`}
      >
        <AdminNavbar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto mt-5">
      
        <div className="flex justify-between items-center px-4 py-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">QUESTION BANK DETAILS</h2>
          </div>
          <Imagecomp />
        </div>

        <div className="px-4 my-4 pb-6 overflow-x-auto">
          <Paper sx={{ width: "100%", p: 2 }}>
            <div className="w-full overflow-x-auto">
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
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;
