import React, { useState } from 'react';
import AdminNavbar from "../../navbar/AdminNavbar";
import Profile from '../../images/profile.png';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';

const facultyRows = [
  { id: 1, photo: Profile, facultyId: "FAC001", name: "John01", code: "22CH007", subject: "Computer Science" },
  { id: 2, photo: Profile, facultyId: "FAC002", name: "John02", code: "22CH008", subject: "Physics" },
  { id: 3, photo: Profile, facultyId: "FAC003", name: "John03", code: "22CH009", subject: "Chemistry" },
  { id: 4, photo: Profile, facultyId: "FAC004", name: "John04", code: "22CH001", subject: "Electrical" },
  { id: 5, photo: Profile, facultyId: "FAC005", name: "John05", code: "22CH002", subject: "Maths" },
  { id: 6, photo: Profile, facultyId: "FAC006", name: "John06", code: "22CH003", subject: "Mathematics" },
  { id: 7, photo: Profile, facultyId: "FAC007", name: "John07", code: "22CH004", subject: "Digital computer" },
  { id: 8, photo: Profile, facultyId: "FAC008", name: "John08", code: "22CH005", subject: "Fundsmental computer" },
  { id: 9, photo: Profile, facultyId: "FAC009", name: "John09", code: "22CH006", subject: "Tamil" },
  { id: 10, photo: Profile, facultyId: "FAC0010", name: "John10", code: "22CH017", subject: "English" },
];

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
  { field: 'subject', headerName: 'Subject Name', width: 400 },
];

const FacultyList = () => {
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
          <h2 className="text-2xl font-bold text-gray-800">FACULTY LIST</h2>
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
            rows={facultyRows}
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
