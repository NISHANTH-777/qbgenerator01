import React, { useState, useEffect } from "react";
import axios from "axios";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import { Imagecomp } from "../../images/Imagecomp";
import { Menu } from "lucide-react"; 

const AddQuestions = () => {
  const [isUpload, setIsUpload] = useState(false);
  const [examName, setExamName] = useState("");
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [mark, setMark] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) throw new Error("User not logged in");

    axios
      .get(`http://localhost:7000/get-course-code?email=${user?.email}`)
      .then((res) => {
        setCourseCode(res.data.course_code);
      })
      .catch((err) => {
        console.error("Error fetching course code:", err);
        alert("Failed to load course code.");
      });
  }, []);

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    if (!isUpload) {
      if (!examName || !unit || !topic || !mark || !question || !answer || !courseCode || !questionType) {
        setErrorMessage("All fields are required when submitting manually.");
        return;
      }
    }

    const data = {
      exam_name: examName,
      unit,
      topic,
      mark,
      question,
      answer,
      course_code: courseCode,
      type: questionType,
      option_a: optionA || null,
      option_b: optionB || null,
      option_c: optionC || null,
      option_d: optionD || null,
    };

    try {
      if (isUpload && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_code", courseCode);

        await axios.post("http://localhost:7000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("File uploaded successfully!");
      } else {
        await axios.post("http://localhost:7000/add-question", data, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Question added successfully!");
      }

      setExamName("");
      setUnit("");
      setTopic("");
      setMark("");
      setQuestion("");
      setAnswer("");
      setQuestionType("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setFile(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error adding question.");
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
     
      <div
        className={`md:w-56 w-full bg-white shadow-md ${sidebarOpen ? 'block' : 'hidden'} md:block`}
      >
        <FacultyNavbar />
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto">
    
        <div className="flex flex-row justify-between items-center mb-5 p-4 bg-white shadow sticky top-0 z-10">
        
          <button
            className="md:hidden text-gray-800"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 ml-4">Add Question Bank</h2>

          <div className="mt-3 sm:mt-0 w-full sm:w-auto ml-4">
            <Imagecomp />
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Add a Question</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Choose Input Method</label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
              value={isUpload ? "upload" : "input"}
              onChange={(e) => setIsUpload(e.target.value === "upload")}
            >
              <option value="input">Manual Input</option>
              <option value="upload">File Upload</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Course Code</label>
            <div className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-sm">
              {courseCode || "Loading..."}
            </div>
          </div>

          {!isUpload ? (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {[{ label: "Exam Name", value: examName, onChange: setExamName },
                { label: "Unit", value: unit, onChange: setUnit },
                { label: "Topic", value: topic, onChange: setTopic },
                { label: "Mark", value: mark, onChange: setMark, type: "number" },
                { label: "Question", value: question, onChange: setQuestion, textarea: true },
                { label: "Answer", value: answer, onChange: setAnswer, textarea: true },
                { label: "Question Type", value: questionType, onChange: setQuestionType },
                { label: "Option A", value: optionA, onChange: setOptionA },
                { label: "Option B", value: optionB, onChange: setOptionB },
                { label: "Option C", value: optionC, onChange: setOptionC },
                { label: "Option D", value: optionD, onChange: setOptionD }]
                .map(({ label, value, onChange, textarea, type = "text" }, i) => (
                  <div key={i}>
                    <label className="block text-gray-700 mb-1">{label}</label>
                    {textarea ? (
                      <textarea
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required
                      />
                    ) : (
                      <input
                        type={type}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={label !== "Option A" && label !== "Option B" && label !== "Option C" && label !== "Option D"}
                      />
                    )}
                  </div>
                ))}

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition duration-200 text-sm"
              >
                Add Question
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition duration-200 text-sm"
              >
                Upload File
              </button>
            </form>
          )}

          {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
