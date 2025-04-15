import React, { useState } from 'react';
import FacultyNavbar from '../../navbar/FacultyNavbar';
import Profile from '../../images/profile.png';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash } from 'lucide-react'; 
import ProfileFunction from '../ProfileFunction';

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

const ManageQB = () => {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleView = (id) => {
    alert(`View clicked for ID: ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Edit clicked for ID: ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Delete clicked for ID: ${id}`);
  };

  const questionColumns = [
    { field: 'facultyId', headerName: 'Faculty ID', width: 200 },
    { field: 'code', headerName: 'Course Code', width: 200 },
    { field: 'unit', headerName: 'Unit', width: 200 },
    { field: 'datetime', headerName: 'Date & Time', width: 220 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
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
      <div className="flex-1 pl-16 pr-4 mt-5 bg-gray-50 overflow-y-auto">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">MANAGE QUESTION</h2>
          <img
            src={Profile}
            alt="ADMIN"
            className="w-14 h-14 rounded-full cursor-pointer"
            onClick={() => setOpenProfileModal(true)}
          />
        </div>

        <ProfileFunction
          isOpen={openProfileModal}
          onClose={() => setOpenProfileModal(false)}
          onLogout={handleLogout}
        />

        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
          <DataGrid
            rows={questionRows}
            columns={questionColumns}
            pageSizeOptions={[6]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 6 } }
            }}
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            rowHeight={70}
            sx={{
              border: 0,
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: '#F7F6FE',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#ffffff',
                fontWeight: 'bold',
                fontSize: 16,
              },
              '& .MuiDataGrid-cell': {
                padding: '12px',
                fontSize: 15,
              },
            }}
          />
        </Paper>

        
      </div>
    </div>
  );
};

export default ManageQB;
