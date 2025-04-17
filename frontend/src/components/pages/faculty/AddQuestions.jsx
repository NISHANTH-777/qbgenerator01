import React, { useState, useEffect } from "react";
import axios from "axios";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import { Imagecomp } from "../../images/Imagecomp";

const AddQuestions = () => {
  const [isUpload, setIsUpload] = useState(false); 
  const [examName, setExamName] = useState("");
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [mark, setMark] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [courseCode, setCourseCode] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [questionType, setQuestionType] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
  }, [email]);

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
    console.log("Data being sent to the server:", data);

    try {
      let response;
      if (isUpload && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_code", courseCode);

        response = await axios.post("http://localhost:7000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("File uploaded successfully!");
      } else {
        response = await axios.post("http://localhost:7000/add-question", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        alert("Question added successfully!");
      }

      setExamName("");
      setUnit("");
      setTopic("");
      setMark("");
      setQuestion("");
      setAnswer("");
      setCourseCode("");
      setQuestionType("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setFile(null);
    } catch (error) {
      setErrorMessage("Error adding question.");
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <FacultyNavbar />
      </div>

      <div className="flex-1 pl-11 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-3xl font-bold text-gray-800">Add Question Bank</h2>
          <Imagecomp />
        </div>
        

    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add a Question</h2>

      <div className="mb-4">
        <label className="block text-gray-700">Choose Input Method</label>
        <select
          className="border border-gray-300 rounded px-4 py-2 w-full"
          value={isUpload ? "upload" : "input"}
          onChange={(e) => setIsUpload(e.target.value === "upload")}
        >
          <option value="input">Manual Input</option>
          <option value="upload">File Upload</option>
        </select>
      </div>

      {!isUpload && (
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div>
            <label className="block text-gray-700">Exam Name</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Unit</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Topic</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Mark</label>
            <input
              type="number"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={mark}
              onChange={(e) => setMark(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Question</label>
            <textarea
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Answer</label>
            <textarea
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
            />
          </div>

          
          <div>
            <label className="block text-gray-700">Course Code</label>
            <div className="border border-gray-300 rounded px-4 py-2 w-full bg-gray-100">
              {courseCode || "Loading..."}
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Question Type</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Option A</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Option B</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Option C</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Option D</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
          >
            Add Question
          </button>
        </form>
      )}

      {isUpload && (
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-gray-700">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="border border-gray-300 rounded px-4 py-2 w-full"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
          >
            Upload File
          </button>
        </form>
      )}

      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
    </div>
    </div>
    </div>
  );
};

export default AddQuestions;
