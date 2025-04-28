import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

const FacultyTaskProgress = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const res = await axios.get("http://localhost:7000/faculty-id", {
          params: { email: user.email },
        });

        const facultyId = res.data.faculty_id;

        const progressRes = await axios.get(`http://localhost:7000/faculty-task-progress/${facultyId}`);
        const progressData = progressRes.data;

        const formattedRows = progressData.flatMap((unitData, unitIndex) =>
          [1, 2, 3, 4, 5, 6].map((mark) => ({
            id: `${unitIndex}-${mark}`,
            unit: unitData.unit,
            mark: `M${mark}`,
            required: unitData[`m${mark}_required`],
            added: unitData[`m${mark}_added`],
            pending: unitData[`m${mark}_pending`],
          }))
        );

        setRows(formattedRows);
      } catch (error) {
        console.error("Error fetching faculty task progress:", error);
      }
    };

    if (user?.email) {
      fetchProgressData();
    }
  }, [user]);

  const columns = [
    { field: 'unit', headerName: 'Unit', width: 275, align: 'center', headerAlign: 'left' },
    { field: 'mark', headerName: 'Mark', width: 230, align: 'center', headerAlign: 'left' },
    { field: 'required', headerName: 'Required', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
    { field: 'added', headerName: 'Added', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
    { field: 'pending', headerName: 'Pending', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
  ];

  return (
    <div className="mb-6 ">
      <Typography variant="h6" fontWeight="bold" gutterBottom marginLeft={1}>Faculty Task Progress</Typography>
      <Paper sx={{ minWidth: 600, height: 550, p: 2 }}>
        <div style={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[6, 12]}
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
  );
};

export default FacultyTaskProgress;
