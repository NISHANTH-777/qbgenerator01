import React, { useState } from "react";
import AdminNavbar from "../../navbar/AdminNavbar";
import axios from "axios";
import { Menu } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const res = await axios.post("http://localhost:7000/give-task", formData);
      alert(res.data.message);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <AdminNavbar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}


      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center px-4 py-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">TASK ASSIGNING TO FACULTY</h2>
          </div>
          <Imagecomp />
        </div>

        <div className="flex justify-center px-4 pb-6 my-6">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-100 p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4"
          >
            <h2 className="text-xl font-semibold text-black text-center">ASSIGN TASK TO FACULTY</h2>

            <input
              name="faculty_id"
              placeholder="Faculty ID"
              value={formData.faculty_id}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="Unit 1">1</option>
              <option value="Unit 2">2</option>
              <option value="Unit 3">3</option>
              <option value="Unit 4">4</option>
              <option value="Unit 5">5</option>
              
            </select>

            {[
              { name: "m1", placeholder: "Required Number of 1-Mark Questions", type: "number" },
              { name: "m2", placeholder: "Required Number of 2-Mark Questions", type: "number" },
              { name: "m3", placeholder: "Required Number of 3-Mark Questions", type: "number" },
              { name: "m4", placeholder: "Required Number of 4-Mark Questions", type: "number" },
              { name: "m5", placeholder: "Required Number of 5-Mark Questions", type: "number" },
              { name: "m6", placeholder: "Required Number of 6-Mark Questions", type: "number" },
              { name: "due_date", placeholder: "Due Date", type: "date" },
            ].map(({ name, placeholder, type = "text" }) => (
              <input
                key={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Submit Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GiveTaskForm;
