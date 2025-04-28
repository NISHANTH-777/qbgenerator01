import React, { useState, useEffect } from "react";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import axios from "axios";
import { Menu, ListChecks, CalendarDays, User } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";
import { Drawer } from "@mui/material";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const AddQuestions = () => {
  const [formData, setFormData] = useState({
    exam_name: "",
    unit: "",
    topic: "",
    mark: "",
    question: "",
    answer: "",
    course_code: "",
    question_type: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
  });
  const [isUpload, setIsUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [courseCode, setCourseCode] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) throw new Error("User not logged in");

    axios
      .get(`http://localhost:7000/get-course-code?email=${user?.email}`)
      .then((res) => {
        setCourseCode(res.data.course_code);
        setFormData((prev) => ({ ...prev, course_code: res.data.course_code }));
      })
      .catch((err) => {
        toast.error("Failed to load course code.");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUpload) {
      if (Object.values(formData).some((val) => !val)) {
        toast.error("All fields are required when submitting manually.");
        return;
      }
    }

    try {
      if (isUpload && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_code", courseCode);

        await axios.post("http://localhost:7000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("File uploaded successfully!");
      } else {
        await axios.post("http://localhost:7000/add-question", formData, {
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Question added successfully!");
      }

      setFormData({
        exam_name: "",
        unit: "",
        topic: "",
        mark: "",
        question: "",
        answer: "",
        question_type: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
      });
      setFile(null);
    } catch (error) {
      toast.error("Error adding question.");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex w-56 bg-white shadow-md">
        <FacultyNavbar />
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
        <FacultyNavbar />
      </Drawer>

      <div className="flex-1 px-4 pt-5 pb-10 overflow-y-auto md:ml-10">
        <div className="flex flex-wrap justify-between items-center mb-6 px-4 py-3 bg-white shadow-md rounded-md sticky top-0 z-10 overflow-x-auto">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setOpenSidebar(!openSidebar)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Add Question Bank</h2>
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
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2 ">
              Add a Question
            </h3>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <User size={18} /> Input Method
              </label>
              <select
                name="input_method"
                value={isUpload ? "upload" : "input"}
                onChange={(e) => setIsUpload(e.target.value === "upload")}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="input">Manual Input</option>
                <option value="upload">File Upload</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-gray-700 flex items-center gap-2">
                <ListChecks size={18} /> Course Code
              </label>
              <div className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm bg-gray-100">
                {courseCode || "Loading..."}
              </div>
            </div>

            {!isUpload ? (
              <>
                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Exam Name
                  </label>
                  <input
                    type="text"
                    name="exam_name"
                    value={formData.exam_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Mark
                  </label>
                  <input
                    type="number"
                    name="mark"
                    value={formData.mark}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Question
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Answer
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Question Type
                  </label>
                  <input
                    type="text"
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Option A
                  </label>
                  <input
                    type="text"
                    name="option_a"
                    value={formData.option_a}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Option B
                  </label>
                  <input
                    type="text"
                    name="option_b"
                    value={formData.option_b}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Option C
                  </label>
                  <input
                    type="text"
                    name="option_c"
                    value={formData.option_c}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Option D
                  </label>
                  <input
                    type="text"
                    name="option_d"
                    value={formData.option_d}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="font-medium text-gray-700 flex items-center gap-2">
                  <CalendarDays size={18} /> Upload CSV/Excel
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full px-6 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none"
              >
                {isUpload ? "Upload File" : "Submit Question"}
              </button>
            </div>
          </form>
        </div>

        <ToastContainer /> 
      </div>
    </div>
  );
};

export default AddQuestions;
