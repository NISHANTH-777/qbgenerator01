import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Paper,
  TableContainer,
} from '@mui/material';

const FacultyTaskProgress = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [progressData, setProgressData] = useState([]);
  const [facultyId, setFacultyId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get faculty ID based on email
        const res = await axios.get("http://localhost:7000/faculty-id", {
          params: { email: user.email },
        });

        const id = res.data.faculty_id;
        setFacultyId(id);

        // 2. Now get task progress using faculty ID
        const progressRes = await axios.get(`http://localhost:7000/faculty-task-progress/${id}`);
        setProgressData(progressRes.data);
      } catch (error) {
        console.error("Error fetching faculty task progress:", error);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user]);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Faculty Task Progress (ID: {facultyId})
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Unit</TableCell>
              {[1, 2, 3, 4, 5, 6].map((mark) => (
                <React.Fragment key={mark}>
                  <TableCell align="center">M{mark} Req</TableCell>
                  <TableCell align="center">M{mark} Added</TableCell>
                  <TableCell align="center">M{mark} Pending</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {progressData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.unit}</TableCell>
                {[1, 2, 3, 4, 5, 6].map((mark) => (
                  <React.Fragment key={mark}>
                    <TableCell align="center">{row[`m${mark}_required`]}</TableCell>
                    <TableCell align="center">{row[`m${mark}_added`]}</TableCell>
                    <TableCell align="center">{row[`m${mark}_pending`]}</TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FacultyTaskProgress;
