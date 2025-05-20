import React, { useState, useEffect } from "react";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import axios from "axios";
import { Menu, ListChecks, CalendarDays, User } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";
import { Drawer } from "@mui/material";
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { useSelector } from 'react-redux';

const AddQuestions = () => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    unit: "",
    portion: "",
    topic: "",
    mark: "",
    question: "",
    cognitive_dimension: "",
    knowledge_dimension: "",
    answer: "",
    course_code: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    vetting_id: "",
    faculty_id: "",
  });
  const [isUpload, setIsUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [vettingId, setVettingId] = useState("");
   const [openSidebar, setOpenSidebar] = useState(false);

  const user = useSelector((state) => state.user.user);
  const email = user?.email;
  const facultyId = user?.faculty_id;

  // Fetch course code
  useEffect(() => {
    if (!email) return;
    axios
      .get(`http://localhost:7000/api/faculty/get-course-code?email=${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCourseCode(res.data.course_code);
        setFormData((prev) => ({
          ...prev,
          course_code: res.data.course_code,
        }));
      })
      .catch(() => {
        toast.error("Failed to load course code.");
      });
  }, [email, token]);

  // Fetch vetting ID
   useEffect(() => {
  if (!facultyId) return;

  setFormData((prev) => ({ ...prev, faculty_id: facultyId }));

  axios
    .get("http://localhost:7000/api/faculty/get-vetting-id", {
      params: { faculty_id: facultyId },
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setVettingId(res.data.vetting_id);
      setFormData((prev) => ({
        ...prev,
        vetting_id: res.data.vetting_id,
      }));
    })
    .catch(() => {
      toast.error("Failed to load vetting ID.");
    });
}, [facultyId, token]);


  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle figure upload
  const [figureFile, setFigureFile] = useState(null);
  const [figurePath, setFigurePath] = useState("");
  
  const handleFigureChange = (e) => {
    setFigureFile(e.target.files[0]);
  };

  const uploadFigure = async () => {
    if (!figureFile) return null;
    
    try {
      const figureFormData = new FormData();
      figureFormData.append("figure", figureFile);
      
      const response = await axios.post(
        "http://localhost:7000/api/faculty/upload-figure",
        figureFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data.figurePath;
    } catch (error) {
      console.error("Error uploading figure:", error);
      toast.error("Failed to upload figure");
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vetting_id && vettingId) {
      setFormData((prev) => ({
        ...prev,
        vetting_id: vettingId,
      }));
    }

    if (!formData.faculty_id && facultyId) {
      setFormData((prev) => ({
        ...prev,
        faculty_id: facultyId,
      }));
    }

    if (!formData.vetting_id || !formData.faculty_id) {
      toast.error("Missing vetting or faculty ID. Try again.");
      return;
    }

    if (!isUpload) {
      // Validation for non-upload questions
      const requiredFields = [
        "unit",
        "portion",
        "topic",
        "mark",
        "question",
        "answer",
        "cognitive_dimension",
        "knowledge_dimension",
      ];
      for (let field of requiredFields) {
        if (!formData[field]) {
          toast.error(`Please fill in ${field.replace("_", " ")}.`);
          return;
        }
      }

      if (formData.mark === "1") {
        if (!formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
          toast.error("All MCQ options are required for 1-mark questions.");
          return;
        }
      }
    }

    try {
      if (isUpload && file) {
        // Handle file upload
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("course_code", courseCode);
        if (vettingId) uploadFormData.append("vetting_id", vettingId);
        if (facultyId) uploadFormData.append("faculty_id", facultyId);
        
        // Log FormData contents properly
        console.log("File being uploaded:", file.name);
        console.log("Course code:", courseCode);
        console.log("Vetting ID:", vettingId);
        console.log("Faculty ID:", facultyId);

        await axios.post("http://localhost:7000/api/faculty/upload", uploadFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log(uploadFormData) - This doesn't work for FormData objects

        toast.success("File uploaded successfully!");
      } else {
        // First upload figure if present
        let uploadedFigurePath = null;
        if (figureFile) {
          uploadedFigurePath = await uploadFigure();
          if (!uploadedFigurePath) {
            toast.error("Failed to upload figure. Please try again.");
            return;
          }
        }

        // Handle question form submission
        const submissionData = {
          ...formData,
          vetting_id: formData.vetting_id || vettingId,
          faculty_id: formData.faculty_id || facultyId,
          figure: uploadedFigurePath // Add the figure path to submission data
        };

        await axios.post("http://localhost:7000/api/faculty/add-question", submissionData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      
        toast.success("Question added successfully!");
      }
        // console.log(formData)

      // Reset form after submission
      setFormData({
        unit: "",
        portion: "",
        topic: "",
        mark: "",
        question: "",
        cognitive_dimension: "",
        knowledge_dimension: "",
        answer: "",
        course_code: courseCode,
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        vetting_id: vettingId,
        faculty_id: facultyId,
      });
      setFile(null);
      setFigureFile(null);
      setFigurePath("");
    } catch (error) {
      toast.error("Error adding question: " + (error.response?.data?.message || error.message));
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
                    <ListChecks size={18} /> Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                     <option value="">-- Select Unit --</option>
                      <option value="Unit 1">Unit 1</option>
                      <option value="Unit 2">Unit 2</option>
                      <option value="Unit 3">Unit 3</option>
                      <option value="Unit 4">Unit 4</option>
                      <option value="Unit 5">Unit 5</option>
                    </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} /> Portion
                  </label>
                  <select
                    name="portion"
                    value={formData.portion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                     <option value="">-- Select Portion --</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
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
                  <select
                    name="mark"
                    value={formData.mark}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Mark --</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
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
                    <ListChecks size={18} /> Figure
                  </label>
                  <input
                    type="file"
                    name="figure"
                    onChange={handleFigureChange}
                    accept="image/*"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {figureFile && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {figureFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                      <label className="font-medium text-gray-700 flex items-center gap-2">
                        <ListChecks size={18} /> Cognitive Dimension
                      </label>
                      <select
                        name="cognitive_dimension"
                        value={formData.cognitive_dimension}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Option --</option>
                        <option value="Remember">Remember - R</option>
                        <option value="Analyse">Analyse - An</option>
                        <option value="Understand">Understand - U</option>
                        <option value="Apply">Apply - Ap</option>
                        <option value="Create">Create - C</option>
                        <option value="Evaluate">Evaluate - E</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-gray-700 flex items-center gap-2">
                        <ListChecks size={18} /> Knowledge Dimension
                      </label>
                      <select
                        name="knowledge_dimension"
                        value={formData.knowledge_dimension}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Option --</option>
                        <option value="Factual">Factual - F</option>
                        <option value="Conceptual">Conceptual - C</option>
                        <option value="Procedual">Procedual - P</option>
                        <option value="Metacognitive">Metacognitive - M</option>
                      </select>
                    </div>
              
                {formData.mark === "1" ? (
                    <div className="space-y-1">
                      <label className="font-medium text-gray-700 flex items-center gap-2">
                        <ListChecks size={18} /> Answer
                      </label>
                      <select
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Option --</option>
                        <option value={formData.option_a}>{formData.option_a}</option>
                        <option value={formData.option_b}>{formData.option_b}</option>
                        <option value={formData.option_c}>{formData.option_c}</option>
                        <option value={formData.option_d}>{formData.option_d}</option>
                      </select>
                    </div>
                    ) : (
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
                  )}
               

                {formData.mark === "1" && (
                  <>
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
                )}
                
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
                {file && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {file.name}
                  </p>
                )}
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