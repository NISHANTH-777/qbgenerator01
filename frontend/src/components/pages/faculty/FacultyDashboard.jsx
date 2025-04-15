import React, { useState } from "react";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";
import FacultyNavbar from "../../navbar/FacultyNavbar";
import Profile from "../../images/profile.png";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProfileFunction from '../ProfileFunction';

const recentQuestions = [
  { code: "CS101", unit: "1.1", datetime: "10-02-89 10:35AM" },
  { code: "CS102", unit: "1.2", datetime: "10-02-89 10:35AM" },
  { code: "CS103", unit: "1.3", datetime: "10-02-89 10:35AM" },
  { code: "CS104", unit: "1.4", datetime: "10-02-89 10:35AM" },
  { code: "CS105", unit: "1.5", datetime: "10-02-89 10:35AM" },
];

const fullMonthlyData = [
  { name: "Jan", QB_Added: 10 },
  { name: "Feb", QB_Added: 14 },
  { name: "Mar", QB_Added: 18 },
  { name: "Apr", QB_Added: 25 },
  { name: "May", QB_Added: 19 },
  { name: "Jun", QB_Added: 15 },
  { name: "Jul", QB_Added: 12 },
  { name: "Aug", QB_Added: 17 },
  { name: "Sep", QB_Added: 22 },
  { name: "Oct", QB_Added: 28 },
  { name: "Nov", QB_Added: 24 },
  { name: "Dec", QB_Added: 30 },
];

const weeklyData = [
  { name: "Mon", QB_Added: 4 },
  { name: "Tue", QB_Added: 6 },
  { name: "Wed", QB_Added: 7 },
  { name: "Thu", QB_Added: 10 },
  { name: "Fri", QB_Added: 5 },
  { name: "Sat", QB_Added: 3 },
  { name: "Sun", QB_Added: 2 },
];

const Facultydashboard = () => {
  const [view, setView] = useState("Monthly");
  const [monthlyPeriod, setMonthlyPeriod] = useState("first");
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setClicked(!clicked);
    navigate("/");
  };

  const filteredMonthlyData =
    monthlyPeriod === "first"
      ? fullMonthlyData.slice(0, 6)
      : fullMonthlyData.slice(6);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <FacultyNavbar />
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
        </div>

        <ProfileFunction
          isOpen={openProfileModal}
          onClose={() => setOpenProfileModal(false)}
          onLogout={handleLogout}
        />

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
                  <td className="py-4 px-4">{q.code}</td>
                  <td className="py-4 px-4">{q.unit}</td>
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
          {view === "Monthly" && (
            <div className="flex justify-between items-center mb-4 px-2">
              <button
                onClick={() => setMonthlyPeriod("first")}
                disabled={monthlyPeriod === "first"}
                className={`p-2 rounded-full transition ${
                  monthlyPeriod === "first" ? "text-gray-300" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-semibold text-gray-700">
                {monthlyPeriod === "first" ? "Jan - Jun" : "Jul - Dec"}
              </span>
              <button
                onClick={() => setMonthlyPeriod("second")}
                disabled={monthlyPeriod === "second"}
                className={`p-2 rounded-full transition ${
                  monthlyPeriod === "second" ? "text-gray-300" : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={view === "Monthly" ? filteredMonthlyData : weeklyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="QB_Added" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Facultydashboard;
