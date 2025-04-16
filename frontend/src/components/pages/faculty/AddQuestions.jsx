import React from "react";
import { MdUpload } from "react-icons/md";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import { Imagecomp } from "../../images/Imagecomp";

const AddQuestion = () => {
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

        <div className="bg-white p-10 rounded-2xl shadow-xl mb-6 w-full max-w-xl mx-auto">
          <form className="space-y-8">
            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Exam Name :</label>
              <select className="flex-1 h-12 bg-gray-100 rounded-md px-3 border border-gray-300">
                <option>-- Select Exam --</option>
                <option>PT-1</option>
                <option>PT-2</option>
                <option>Semester</option>
              </select>
            </div>

            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Unit :</label>
              <select className="flex-1 h-12 bg-gray-100 rounded-md px-3 border border-gray-300">
                <option>-- Select Unit --</option>
                <option>Unit 1: Introduction to Programming</option>
                <option>Unit 2: Data Structures</option>
                <option>Unit 3: Algorithms</option>
                <option>Unit 4: Database Management</option>
                <option>Unit 5: Web Technologies</option>
              </select>
            </div>

            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Topic :</label>
              <select className="flex-1 h-12 bg-gray-100 rounded-md px-3 border border-gray-300">
                <option>-- Select Topic --</option>
                <option>Variables and Data Types</option>
                <option>Linked Lists</option>
                <option>Sorting Algorithms</option>
                <option>SQL Queries</option>
                <option>React Components</option>
              </select>
            </div>

            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Question Type :</label>
              <select className="flex-1 h-12 bg-gray-100 rounded-md px-3 border border-gray-300">
                <option>-- Select Question Type --</option>
                <option>Multiple Choice</option>
                <option>True/False</option>
                <option>Short Answer</option>
                <option>Long Answer</option>
                <option>Fill in the Blanks</option>
              </select>
            </div>

            <div className="flex items-center space-x-6">
              <label className="w-40 font-semibold text-right">Questions :</label>
              <label className="flex-1 h-12 bg-gray-100 rounded-md px-6 flex items-center justify-between cursor-pointer border border-gray-300">
                <span className="font-semibold">Upload a file</span>
                <MdUpload />
                <input
                  type="file"
                  accept=".csv,.pdf,.doc,.docx,.txt,.xlsx"
                  hidden
                />
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

export default AddQuestion;
