import React, { useState } from "react";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";
import AdminNavbar from "../../navbar/AdminNavbar";
import Profile from '../../images/profile.png';
import { useNavigate } from "react-router-dom";

const recentQuestions = [
  { id: "FAC001", course: "CS101", datetime: "2025-03-01 10:30 AM" },
  { id: "FAC002", course: "CS102", datetime: "2025-03-02 02:15 PM" },
  { id: "FAC003", course: "CS103", datetime: "2025-03-03 09:45 AM" },
  { id: "FAC004", course: "CS104", datetime: "2025-03-04 04:00 PM" },
  { id: "FAC005", course: "CS105", datetime: "2025-03-05 11:20 AM" },
];

const monthlyData = [
  { name: "1", value: 10 },
  { name: "2", value: 14 },
  { name: "3", value: 18 },
  { name: "4", value: 25 },
  { name: "5", value: 19 },
  { name: "6", value: 15 },
];

const weeklyData = [
  { name: "Mon", value: 4 },
  { name: "Tue", value: 6 },
  { name: "Wed", value: 7 },
  { name: "Thu", value: 10 },
  { name: "Fri", value: 5 },
];

const Admindashboard = () => {
  const [view, setView] = useState("Monthly");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
    };


  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-11 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">DASHBOARD</h2>
          <img
            src={Profile}
            alt="ADMIN"
            className="w-14 h-14 rounded-full cursor-pointer"
            onClick={() => setOpenProfileModal(true)}
          />
          {openProfileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-end">
              <div className="bg-white w-[360px] p-8 rounded-2xl relative shadow-xl text-center mr-10 animate-slide-in">
                <button
                  className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-black"
                  onClick={() => setOpenProfileModal(false)}
                >
                  ×
                </button>
                <img
                  src={Profile}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-6 border-2 border-gray-300"
                />
                <div className="text-left text-base font-medium text-gray-800 space-y-3 leading-relaxed">
                  <p><span className="font-semibold">Name:</span> Daniel M</p>
                  <p><span className="font-semibold">Faculty ID:</span> 12345</p>
                  <p><span className="font-semibold">Subject:</span> F.O.C</p>
                  <p><span className="font-semibold">Department:</span> C.S.E</p>
                  <p><span className="font-semibold">Email ID:</span> danielm7708@bitsathy.ac.in</p>
                  <p><span className="font-semibold">Phone No:</span> 0123456789</p>
                </div>
                <button
                  className="mt-8 w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition"
                  onClick={handlechangeclick}
                >
                  LOGOUT
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xl mb-5">
          <h3 className="text-lg font-semibold mb-4">Recently Added Questions</h3>
          <table className="min-w-full text-left text-sm border">
            <thead className="bg-white h-14">
              <tr>
                <th className="py-4 px-4">Faculty ID</th>
                <th className="py-4 px-4">Course Code</th>
                <th className="py-4 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {recentQuestions.map((q, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}
                >
                  <td className="py-4 px-4">{q.id}</td>
                  <td className="py-4 px-4">{q.course}</td>
                  <td className="py-4 px-4">{q.datetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-5 mb-5">
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                view === "Monthly"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setView("Monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium ${
                view === "Weekly"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setView("Weekly")}
            >
              Weekly
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={view === "Monthly" ? monthlyData : weeklyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;