import React, { useState } from 'react';
import AdminNavbar from '../../navbar/AdminNavbar';
import Profile from '../../images/profile.png';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

const bankRows = [
  { id: 1, adminId: "ADM001", code: "22CH007", name: "Engineering Chemistry 01", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 2, adminId: "ADM002", code: "22CH007", name: "Engineering Chemistry 02", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 3, adminId: "ADM004", code: "22CH007", name: "Engineering Chemistry 03", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 4, adminId: "ADM005", code: "22CH007", name: "Engineering Chemistry 04", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 5, adminId: "ADM006", code: "22CH007", name: "Engineering Chemistry 05", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 6, adminId: "ADM007", code: "22CH007", name: "Engineering Chemistry 06", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 7, adminId: "ADM008", code: "22CH007", name: "Engineering Chemistry 07", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 8, adminId: "ADM009", code: "22CH007", name: "Engineering Chemistry 08", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 9, adminId: "ADM003", code: "22CH007", name: "Engineering Chemistry 09", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  { id: 10, adminId: "ADM010", code: "22CH007", name: "Engineering Chemistry 10", exam: "PT-1", datetime: "2025-03-01 10:30 AM" },
  
];

const bankColumns = [
  { field: 'adminId', headerName: 'Admin ID', width: 185 },
  { field: 'code', headerName: 'Course Code', width: 200 },
  { field: 'name', headerName: 'Subject Name', width: 350 },
  { field: 'exam', headerName: 'Exam Name', width: 200 },
  { field: 'datetime', headerName: 'Date & Time', width: 225 },
];

const GenerateQB = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [formData, setFormData] = useState({
    examName: '',
    subjectCode: '',
    subjectName: ''
  });
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
    };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setOpenModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-16 pr-4 bg-gray-50 overflow-y-auto mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">QUESTION BANK HISTORY</h2>
          <img src={Profile} alt="ADMIN"className="w-14 h-14 rounded-full cursor-pointer"onClick={() => setOpenProfileModal(true)} />
          {openProfileModal && (
          <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-40 z-50 flex items-center justify-end ">
          <div className="bg-white w-[360px] p-8 rounded-2xl relative shadow-xl text-center mr-10 ">
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

        <div className="flex justify-end mb-4">
          <Tooltip title="CLICK TO GENERATE NEW QB" enterDelay={500} leaveDelay={300}>
            <button
              className="bg-blue-500 px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-700"
              onClick={() => setOpenModal(true)}
            >
              GENERATE
            </button>
          </Tooltip>
        </div>

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-[450px] shadow-xl">
              <h2 className="text-xl font-bold mb-6 text-center">GENERATE QUESTION BANK</h2>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="block font-semibold mb-1">Exam Name :</label>
                  <select
                    name="examName"
                    value={formData.examName}
                    onChange={handleChange}
                    className="w-full bg-gray-200 rounded-md px-4 py-2 pr-10"
                    required
                  >
                    <option value="">-- Select Exam --</option>
                    <option value="PT-1">PT-1</option>
                    <option value="PT-2">PT-2</option>
                    <option value="Semester">Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject Code :</label>
                  <select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    className="w-full bg-gray-200 rounded-md px-4 py-2"
                    required
                  >
                    <option value="">-- Select Code --</option>
                    <option value="22CH007">22CH007</option>
                    <option value="22CS101">22CS101</option>
                    <option value="22EE202">22EE202</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject Name :</label>
                  <select
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    className="w-full bg-gray-200 rounded-md px-4 py-2"
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    <option value="Engineering Chemistry">Engineering Chemistry</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Circuit Theory">Circuit Theory</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    className="bg-blue-500 px-10 py-3 text-white font-semibold rounded-lg hover:bg-blue-600"
                  >
                    GENERATE
                  </button>
                </div>
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="text-lg px-10 py-2 rounded-md text-white  bg-slate-700  hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Paper sx={{ height: 550, width: '100%', p: 2 }}>
          <DataGrid
            rows={bankRows}
            columns={bankColumns}
            pageSizeOptions={[6, 10]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 6 } } }}
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

export default GenerateQB;
