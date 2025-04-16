import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Imagecomp } from '../../images/Imagecomp';

const QuestionDetails = () => {
  const [rows, setRows] = useState([]);
  const [clicked, setClicked] = useState(false);
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
    { field: 'code', headerName: 'Course Code', width: 275 },
    { field: 'unit', headerName: 'Unit', width: 200 },
    { field: 'datetime', headerName: 'Date & Time', width: 300 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">QUESTION BANK DETAILS</h2>
          <Imagecomp />
        </div>

        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
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
        </Paper>
      </div>
    </div>
  );
};

export default QuestionDetails;
