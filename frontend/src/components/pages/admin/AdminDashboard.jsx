import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminNavbar from "../../navbar/AdminNavbar";
import Profile from "../../images/profile.png";
import { useNavigate } from "react-router-dom";

const Admindashboard = () => {
  const [view, setView] = useState("Monthly");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user)

  const handlechangeclick = () => {
    setClicked(!clicked);
    navigate("/");
  };

  useEffect(() => {
    // Recently Added Questions
    axios
      .get("http://localhost:7000/recently-added")
      .then((res) => {
        setRecentQuestions(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch recent questions:", err);
      });

    // Question Stats (Weekly/Monthly)
    axios
      .get("http://localhost:7000/question-stats")
      .then((res) => {
        const { monthly, weekly } = res.data;

        const monthlyFormatted = monthly.map((item) => ({
          name: `ID ${item.faculty_id}`,
          value: item.total_papers,
        }));
        
        const weeklyFormatted = weekly.map((item) => ({
          name: `ID ${item.faculty_id} (W${item.week.toString().slice(-2)})`,
          value: item.total_papers,
        }));
        

        setMonthlyData(monthlyFormatted);
        setWeeklyData(weeklyFormatted);
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err);
      });
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-11 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">DASHBOARD</h2>
              {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{ width: 60, height: 60, borderRadius: '50%', cursor: 'pointer' }}
              onClick={() => setOpenProfileModal(true)}
            />
          ) : (
            <img
              src={Profile}
              alt="ADMIN"
              className="w-14 h-14 rounded-full cursor-pointer"
              onClick={() => setOpenProfileModal(true)}
            />
          )}

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

        {/* Recently Added Questions Table */}
        <div className="bg-white p-4 rounded-lg shadow-xl mb-5">
          <h3 className="text-lg font-semibold mb-4">Recently Added Questions</h3>
          <table className="min-w-full text-left text-sm border">
            <thead className="bg-white h-14">
              <tr>
                <th className="py-4 px-4">Course Code</th>
                <th className="py-4 px-4">Unit</th>
                <th className="py-4 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {recentQuestions.map((q, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}
                >
                  <td className="py-4 px-4">{q.course_code}</td>
                  <td className="py-4 px-4">{q.unit}</td>
                  <td className="py-4 px-4">
                    {new Date(q.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
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
          <BarChart data={view === "Monthly" ? monthlyData : weeklyData} >
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
