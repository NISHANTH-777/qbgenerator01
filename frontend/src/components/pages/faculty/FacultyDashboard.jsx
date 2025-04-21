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
import FacultyNavbar from "../../navbar/FacultyNavbar"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp"; 
import { useNavigate } from "react-router-dom";

const Facultydashboard = () => {
  const [view, setView] = useState("Monthly");
  const [monthRange, setMonthRange] = useState("first");
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get("http://localhost:7000/faculty-recent-assignments")
      .then((res) => setRecentAssignments(res.data))
      .catch((err) => console.error("Failed to fetch recent assignments:", err));

    axios
      .get("http://localhost:7000/faculty-stats")
      .then((res) => {
        const { monthly, weekly } = res.data;

        const monthlyFormatted = monthly.map((item) => ({
          name: item.month,
          assignmentsSubmitted: item.assignments_submitted,
        }));

        const weeklyFormatted = weekly.map((item) => ({
          name: `W${item.week}`,
          assignmentsSubmitted: item.assignments_submitted,
        }));

        setMonthlyData(monthlyFormatted);
        setWeeklyData(weeklyFormatted);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  const filteredMonthlyData =
    monthRange === "first" ? monthlyData.slice(0, 6) : monthlyData.slice(6);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false); 
  };

  return (
    <div className="flex h-screen bg-gray-50">
    
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <FacultyNavbar onNavigate={handleNavigate} onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
   
        <div className="flex justify-between items-center px-4 py-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h2>
          </div>
          <Imagecomp />
        </div>

        <div className="bg-white mx-4 my-4 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Assignments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border">
              <thead className="bg-white h-14">
                <tr>
                  <th className="py-4 px-4">Course Code</th>
                  <th className="py-4 px-4">Assignment Title</th>
                  <th className="py-4 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map((assignment, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-[#F7F6FE]" : "bg-white"}
                  >
                    <td className="py-4 px-4">{assignment.course_code}</td>
                    <td className="py-4 px-4">{assignment.title}</td>
                    <td className="py-4 px-4">
                      {new Date(assignment.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white mx-4 mb-6 p-4 rounded-xl shadow">
          <div className="flex items-center gap-4 mb-5 flex-wrap">
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
                onClick={() => setMonthRange("first")}
                disabled={monthRange === "first"}
                className={`p-2 rounded-full transition ${
                  monthRange === "first" ? "text-gray-300" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-semibold text-gray-700">
                {monthRange === "first" ? "Jan - Jun" : "Jul - Dec"}
              </span>
              <button
                onClick={() => setMonthRange("second")}
                disabled={monthRange === "second"}
                className={`p-2 rounded-full transition ${
                  monthRange === "second" ? "text-gray-300" : "hover:bg-gray-100"
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
              <Bar dataKey="assignmentsSubmitted" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Facultydashboard;
