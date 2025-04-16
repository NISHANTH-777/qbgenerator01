import React from "react";
import { MdUpload } from "react-icons/md";
import FacultyNavbar from "../../navbar/FacultyNavbar";

const AddQuestionCard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <FacultyNavbar />
      </div>

      <div className="flex-1 pl-11 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-3xl font-bold text-gray-800">Add Question Bank</h2>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-xl mb-6 w-full max-w-xl mx-auto">
          <form className="space-y-8">
            {["Exam Name", "Unit", "Topic", "Question Type"].map((label, index) => (
              <div key={index} className="flex items-center space-x-6">
                <label className="w-40 font-semibold text-right">{label} :</label>
                <div className="flex-1 h-12 bg-gray-300 rounded-md" />
              </div>
            ))}

            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Questions :</label>
              <label className="flex-1 h-12 bg-gray-300 rounded-md px-6 flex items-center justify-between cursor-pointer">
                <span className="font-semibold">Upload a file</span>
                <MdUpload />
                <input type="file" hidden />
              </label>
            </div>
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 font-bold text-white px-12 py-3 rounded-xl"
              >
                ADD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionCard;
