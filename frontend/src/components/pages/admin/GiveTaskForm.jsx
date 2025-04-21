import React, { useState } from "react";
import axios from "axios";

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
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-blue-700 text-center">Give Task</h2>

        {[
          { name: "faculty_id", placeholder: "Faculty ID" },
          { name: "unit", placeholder: "Unit (e.g., 1 or Unit 1)" },
          { name: "m1", placeholder: "1-Mark Questions", type: "number" },
          { name: "m2", placeholder: "2-Mark Questions", type: "number" },
          { name: "m3", placeholder: "3-Mark Questions", type: "number" },
          { name: "m4", placeholder: "4-Mark Questions", type: "number" },
          { name: "m5", placeholder: "5-Mark Questions", type: "number" },
          { name: "m6", placeholder: "6-Mark Questions", type: "number" },
          { name: "due_date", placeholder: "", type: "date" },
        ].map(({ name, placeholder, type = "text" }) => (
          <input
            key={name}
            type={type}
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            required
            className="w-full p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
};

export default GiveTaskForm;
