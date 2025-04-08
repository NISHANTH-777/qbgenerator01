import React, { useState } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import Profile from '../../images/profile.png';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';

const questionRows = [
  { id: 1, facultyId: "FAC001", code: "22CH007", unit: "1.1", datetime: "2025-03-01 10:30 AM" },
  { id: 2, facultyId: "FAC002", code: "22CH008", unit: "1.2", datetime: "2025-03-02 11:00 AM" },
  { id: 3, facultyId: "FAC003", code: "22CH009", unit: "1.3", datetime: "2025-03-03 09:45 AM" },
  { id: 4, facultyId: "FAC004", code: "22CH001", unit: "1.4", datetime: "2025-03-04 02:15 PM" },
  { id: 5, facultyId: "FAC005", code: "22CH002", unit: "1.5", datetime: "2025-03-05 12:00 PM" },
  { id: 6, facultyId: "FAC006", code: "22CH003", unit: "1.6", datetime: "2025-03-06 03:30 PM" },
  { id: 7, facultyId: "FAC007", code: "22CH004", unit: "1.7", datetime: "2025-03-07 04:00 PM" },
  { id: 8, facultyId: "FAC008", code: "22CH005", unit: "1.8", datetime: "2025-03-08 08:20 AM" },
  { id: 9, facultyId: "FAC009", code: "22CH006", unit: "1.9", datetime: "2025-03-09 06:10 PM" },
  { id: 10, facultyId: "FAC010", code: "22CH017", unit: "2.1", datetime: "2025-03-10 05:45 PM" },
];

const questionColumns = [
  { field: 'facultyId', headerName: 'Faculty ID', width: 285 },
  { field: 'code', headerName: 'Course Code', width: 275 },
  { field: 'unit', headerName: 'Unit', width: 275 },
  { field: 'datetime', headerName: 'Date & Time', width: 350 },
];

const QuestionDetails = () => {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
    };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">QUESTION BANK DETAILS</h2>
          <img
            src={Profile}
            alt="ADMIN"
            className="w-14 h-14 rounded-full cursor-pointer"
            onClick={() => setOpenProfileModal(true)}
          />

          {openProfileModal && (
            <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-end">
              <div className="bg-white w-[360px] p-8 rounded-2xl relative shadow-xl text-center mr-10">
                <button
                  className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-black"
                  onClick={() => setOpenProfileModal(false)}
                >
                  ×
                </button>
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-6 border-2 border-gray-300"
                />
                <div className="text-left text-base font-medium text-gray-800 space-y-3 leading-relaxed">
                  <p><span className="font-semibold">Name:</span> Daniel M</p>
                  <p><span className="font-semibold">Faculty ID:</span> 12345</p>
                  <p><span className="font-semibold">Subject:</span> F.O.C</p>
                  <p><span className="font-semibold">Department:</span> C.S.E</p>
                  <p><span className="font-semibold">Email ID:</span> danielm7708@bitsathy.ac.in</p>
                  <p><span className="font-semibold">Phone No:</span> 0123456789</p>
                </div>
                <button
                  className="mt-8 w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition"
                  onClick={handlechangeclick}
                >
                  LOGOUT
                </button>
              </div>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default QuestionDetails;
