import React, { useState, useEffect } from "react";
import axios from "axios";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,} from "recharts";
import AdminNavbar from "../../navbar/AdminNavbar";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Imagecomp } from "../../images/Imagecomp";

const Admindashboard = () => {
  const [view, setView] = useState("Monthly");
  const [monthRange, setMonthRange] = useState("first");
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get("http://localhost:7000/recently-added")
      .then((res) =>{ setRecentQuestions(res.data)
      console.log(res.data)
      })
      .catch((err) =>
        console.error("Failed to fetch recent questions:", err)
      );

    axios
      .get("http://localhost:7000/question-stats")
      .then((res) => {
        const { monthly, weekly } = res.data;

        const monthlyFormatted = monthly.map((item, index) => ({
          name: new Date(2025, index).toLocaleString("default", {
            month: "short",
          }),
          QB_Generated: item.total_papers,
        }));

        const weeklyFormatted = weekly.map((item) => ({
          name: `W${item.week}`,
          QB_Generated: item.total_papers,
        }));

        setMonthlyData(monthlyFormatted);
        setWeeklyData(weeklyFormatted);
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);  

  const filteredMonthlyData =
    monthRange === "first"
      ? monthlyData.slice(0, 6)
      : monthlyData.slice(6);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-56 bg-white shadow-md">
        <AdminNavbar />
      </div>

      <div className="flex-1 pl-11 pr-4 bg-gray-50 overflow-y-auto ml-5 mt-5">
        <div className="flex justify-between items-center mb-5 p-4 sticky top-0 z-10 bg-white shadow-md">
          <h2 className="text-2xl font-bold text-gray-800">DASHBOARD</h2>
          <Imagecomp />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-xl mb-5">
          <h3 className="text-lg font-semibold mb-4">
            Recently Added Questions
          </h3>
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
              <span className="font-semibold text-gray-700">
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

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={view === "Monthly" ? filteredMonthlyData : weeklyData}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="QB_Generated" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
