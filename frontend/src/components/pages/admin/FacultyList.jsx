import React, { useState, useEffect } from 'react';
import AdminNavbar from "../../navbar/AdminNavbar";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { Imagecomp } from '../../images/Imagecomp';

const FacultyList = () => {
  const [data, setData] = useState([]);


  useEffect(() => {
    axios.get("http://localhost:7000/faculty-list")
      .then((response) => {
        const formatted = response.data.map((item, index) => ({
          id: index + 1,
          facultyId: item.faculty_id,
          name: item.faculty_name,
          photo: item.photo,
          code: item.course_code,
          subject: item.subject_name
        }));
        setData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching faculty list:", error);
      });
  }, []);

  const facultyColumns = [
    {
      field: 'photo',
      headerName: 'Photo',
      width: 150,
      renderCell: (params) => (
        <Avatar src={params.value} alt="Profile" sx={{ width: 50, height: 50 }} />
      ),
      sortable: false,
      filterable: false,
    },
    { field: 'facultyId', headerName: 'Faculty ID', width: 200 },
    { field: 'name', headerName: 'Faculty Name', width: 200 },
    { field: 'code', headerName: 'Course Code', width: 200 },
    { field: 'subject', headerName: 'Subject Name', width: 300 },
  ];


  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">FACULTY LIST</h2>
           <Imagecomp />
        </div>

        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
          <DataGrid
            rows={data}
            columns={facultyColumns}
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

export default FacultyList;
