import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

const FacultyTaskProgress = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // Dummy data
    const data = [
      {
        unit: 'Unit 1',
        m1_required: 10, m1_added: 8, m1_pending: 2,
        m2_required: 12, m2_added: 12, m2_pending: 0,
        m3_required: 8,  m3_added: 6,  m3_pending: 2,
        m4_required: 9,  m4_added: 5,  m4_pending: 4,
        m5_required: 7,  m5_added: 7,  m5_pending: 0,
        m6_required: 6,  m6_added: 3,  m6_pending: 3,
      },
      {
        unit: 'Unit 2',
        m1_required: 15, m1_added: 10, m1_pending: 5,
        m2_required: 10, m2_added: 10, m2_pending: 0,
        m3_required: 9,  m3_added: 9,  m3_pending: 0,
        m4_required: 12, m4_added: 8,  m4_pending: 4,
        m5_required: 11, m5_added: 6,  m5_pending: 5,
        m6_required: 5,  m6_added: 5,  m6_pending: 0,
      },
    ];

    const formattedRows = data.flatMap((unitData, unitIndex) =>
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
  }, []);

  const columns = [
    { field: 'unit', headerName: 'Unit', width: 275, align: 'center', headerAlign: 'left' },
    { field: 'mark', headerName: 'Mark', width: 230, align: 'center', headerAlign: 'left' },
    { field: 'required', headerName: 'Required', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
    { field: 'added', headerName: 'Added', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
    { field: 'pending', headerName: 'Pending', width: 215, type: 'number', align: 'center', headerAlign: 'left' },
  ];

  return (
    <div className="px-4 py-4">
      <Typography variant="h5" gutterBottom>Faculty Task Progress</Typography>
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
