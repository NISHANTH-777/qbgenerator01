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
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";

const Admindashboard = () => {
  const [view, setView] = useState("Monthly");
  const [monthRange, setMonthRange] = useState("first");
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weekRangeStart, setWeekRangeStart] = useState(0);
  const token = localStorage.getItem('token');

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:7000/api/admin/recently-added", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }})
      .then((res) => setRecentQuestions(res.data))
      .catch((err) => console.error("Failed to fetch recent questions:", err));

    axios
      .get("http://localhost:7000/api/admin/generated-qb-stats", {
        headers: {
          'Authorization': `Bearer ${token}`,
        }})
      .then((res) => {
        const { monthly, weekly } = res.data;

        const monthsOrder = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const monthlyMap = {};
        monthsOrder.forEach((m) => {
          monthlyMap[m] = 0;
        });

        monthly.forEach((item) => {
          const [_, month] = item.month.split("-");
          const index = parseInt(month, 10) - 1;
          const monthName = new Date(2025, index).toLocaleString("default", {
            month: "short",
          });
          monthlyMap[monthName] += item.total_generated;
        });

        const monthlyFormatted = monthsOrder.map((name) => ({
          name,
          QB_Generated: monthlyMap[name],
        }));

        const weeklyMap = {};
        for (let i = 1; i <= 52; i++) {
          const weekName = `W${String(i).padStart(2, "0")}`;
          weeklyMap[weekName] = 0;
        }

        weekly.forEach((item) => {
          const weekNum = parseInt(String(item.week).slice(4)); // From 202516 -> 16
          const weekName = `W${String(weekNum).padStart(2, "0")}`;
          weeklyMap[weekName] += item.total_generated;
        });
        

        const weeklyFormatted = Object.entries(weeklyMap).map(
          ([name, QB_Generated]) => ({ name, QB_Generated })
        );

        setMonthlyData(monthlyFormatted);
        setWeeklyData(weeklyFormatted);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  const filteredMonthlyData =
    monthRange === "first" ? monthlyData.slice(0, 6) : monthlyData.slice(6);

  const filteredWeeklyData = weeklyData.slice(weekRangeStart, weekRangeStart + 7);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <div
        className={`fixed z-40 top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:block w-64`}
      >
        <AdminNavbar
          onNavigate={handleNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 bg-gray-50 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md rounded-md">
          <div className="flex items-center gap-4">
            <button
              className="block md:hidden text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              DASHBOARD
            </h2>
          </div>
          <Imagecomp />
        </div>

        <div className="bg-white my-4 p-4 rounded-lg shadow ">
          <h3 className="text-lg font-semibold mb-4">
            Recently Added Questions
          </h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border">
              <thead className="bg-white h-14">
                <tr>
                  <th className="py-4 px-4">Faculty ID</th>
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
                    <td className="py-4 px-4">{q.faculty_id}</td>
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
        </div>

        <div className="bg-white mb-6 p-4 rounded-xl shadow">
          <div className="flex flex-wrap gap-2 mb-5">
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
                  monthRange === "first"
                    ? "text-gray-300"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-semibold text-gray-700 text-sm sm:text-base">
                {monthRange === "first" ? "Jan - Jun" : "Jul - Dec"}
              </span>
              <button
                onClick={() => setMonthRange("second")}
                disabled={monthRange === "second"}
                className={`p-2 rounded-full transition ${
                  monthRange === "second"
                    ? "text-gray-300"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {view === "Weekly" && (
            <div className="flex justify-between items-center mb-4 px-2">
              <button
                onClick={() =>
                  setWeekRangeStart((prev) => Math.max(prev - 7, 0))
                }
                disabled={weekRangeStart === 0}
                className={`p-2 rounded-full transition ${
                  weekRangeStart === 0 ? "text-gray-300" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-semibold text-gray-700 text-sm sm:text-base">
                Weeks {weekRangeStart + 1} -{" "}
                {Math.min(weekRangeStart + 7, 52)}
              </span>
              <button
                onClick={() =>
                  setWeekRangeStart((prev) =>
                    Math.min(prev + 7, 45)
                  )
                }
                disabled={weekRangeStart + 7 >= 52}
                className={`p-2 rounded-full transition ${
                  weekRangeStart + 7 >= 52
                    ? "text-gray-300"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={view === "Monthly" ? filteredMonthlyData : filteredWeeklyData}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="QB_Generated"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
