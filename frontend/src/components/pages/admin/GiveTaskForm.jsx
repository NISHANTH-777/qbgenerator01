import React, { useState, useEffect } from "react";
import AdminNavbar from "../../navbar/AdminNavbar";
import axios from "axios";
import { Menu, CalendarDays, User, ListChecks } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";
import { Drawer } from "@mui/material";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

const GiveTaskForm = () => {
  const [formData, setFormData] = useState({
    faculty_id: "",
    unit: "",
    m1: "",
    m2: "",
    m3: "",
    m4: "",
    m5: "",
    m6: "",
    due_date: "",
  });

  const [openSidebar, setOpenSidebar] = useState(false);
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://localhost:7000/api/admin/faculty-list");
        setFacultyList(res.data);
      } catch (err) {
        toast.error("Failed to load faculty list");
      }
    };
    fetchFaculty();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:7000/api/admin/give-task", formData);
      toast.success(res.data.message || "Task Assigned Successfully!");
      setFormData({
        faculty_id: "",
        unit: "",
        m1: "",
        m2: "",
        m3: "",
        m4: "",
        m5: "",
        m6: "",
        due_date: "",
      });
    } catch (err) {
      toast.error("Failed to assign task");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex flex-col fixed top-0 left-0 w-56 h-screen bg-white shadow-md z-50">
        <AdminNavbar />
      </div>

      <Drawer
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 250,
            top: 0,
            height: "100vh",
          },
        }}
      >
        <AdminNavbar />
      </Drawer>

      <div className="flex-1 px-4 pt-5 pb-10 md:ml-3 lg:ml-64">
        <div className="flex flex-wrap justify-between items-center mb-6 px-4 py-3 bg-white shadow-md rounded-md sticky top-0 z-10 overflow-auto">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setOpenSidebar(!openSidebar)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Task Assignment
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <Imagecomp />
          </div>
        </div>

        <div className="flex justify-center px-2">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl px-6 sm:px-10 py-8 animate-fadeIn space-y-6"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
              Faculty Task Assignment
            </h3>
            <p className="text-center text-gray-500 text-sm">
              Assign specific question types and units to faculty with a deadline.
            </p>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <User size={18} /> Faculty
              </label>
              <select
                name="faculty_id"
                value={formData.faculty_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Faculty</option>
                {facultyList.map((faculty, idx) => (
                  <option key={idx} value={faculty.faculty_id}>
                    {faculty.faculty_id} — {faculty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <ListChecks size={18} /> Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Unit</option>
                {[1, 2, 3, 4, 5].map((u) => (
                  <option key={u} value={`Unit ${u}`}>{`Unit ${u}`}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["m1", "m2", "m3", "m4", "m5", "m6"].map((m) => (
                <div key={m}>
                  <label className="text-sm text-gray-600 font-medium">
                    {`${m.slice(1)}-Mark`}
                  </label>
                  <input
                    type="number"
                    name={m}
                    value={formData[m]}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <CalendarDays size={18} /> Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition duration-300 shadow-lg"
            >
              Assign Task
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default GiveTaskForm;
