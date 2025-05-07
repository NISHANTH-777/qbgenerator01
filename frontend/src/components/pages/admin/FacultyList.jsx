import React, { useState, useEffect } from "react";
import AdminNavbar from "../../navbar/AdminNavbar";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import { Imagecomp } from "../../images/Imagecomp";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FacultyList = () => {
  const token = localStorage.getItem('token');
  const [data, setData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/admin/faculty-list", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }})
      .then((response) => {
        const formatted = response.data.map((item, index) => ({
          id: index + 1,
          facultyId: item.faculty_id,
          name: item.faculty_name,
          photo: item.photo,
          code: item.course_code,
          subject: item.subject_name,
        }));
        setData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching faculty list:", error);
      });
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const facultyColumns = [
    {
      field: "photo",
      headerName: "Photo",
      flex: 0.7,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt="Profile"
          sx={{ width: 50, height: 50 }}
        />
      ),
      sortable: false,
      filterable: false,
    },
    { field: "facultyId", headerName: "Faculty ID", flex: 1 },
    { field: "name", headerName: "Faculty Name", flex: 1.2 },
    { field: "code", headerName: "Course Code", flex: 1 },
    { field: "subject", headerName: "Subject Name", flex: 1.5 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <AdminNavbar
          onNavigate={handleNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto pl-1 pr-4 bg-gray-50 ml-3 mt-4">
        <div className="flex flex-wrap justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md rounded-md">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              FACULTY LIST
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Imagecomp />
          </div>
        </div>

        <div className="pb-6 my-4  overflow-x-auto">
          <Paper sx={{ minWidth: 600, width: "100%", p: { xs: 1, sm: 2 } }}>
            <DataGrid
              rows={data}
              columns={facultyColumns}
              pageSizeOptions={[6, 10]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 6 } },
              }}
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              rowHeight={60}
              sx={{
                border: 0,
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#F7F6FE",
                },
                "& .MuiDataGrid-row:nth-of-type(even)": {
                  backgroundColor: "#ffffff",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#ffffff",
                  fontWeight: "bold",
                  fontSize: 16,
                },
                "& .MuiDataGrid-row": {
                  alignItems: "center",
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "16px",
                },
              }}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default FacultyList;
