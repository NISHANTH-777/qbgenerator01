import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';

const AddQuestionPage = () => {
  const [questionData, setQuestionData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    marks: '',
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newError = {};
    if (!questionData.question) newError.question = 'Question is required';
    if (!questionData.optionA || !questionData.optionB || !questionData.optionC || !questionData.optionD) {
      newError.options = 'All options are required';
    }
    if (!questionData.correctAnswer) newError.correctAnswer = 'Correct answer is required';
    if (!questionData.marks) newError.marks = 'Marks are required';
    if (isNaN(questionData.marks)) newError.marks = 'Marks should be a number';
    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:7000/add-question', questionData);
      alert('Question added successfully');
      setQuestionData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        marks: '',
      });
      setError({});
    } catch (error) {
      console.error('Error adding question:', error);
      alert('There was an error adding the question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Add Question</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
        
          <div>
            <TextField
              fullWidth
              label="Question"
              name="question"
              value={questionData.question}
              onChange={handleChange}
              error={!!error.question}
              helperText={error.question}
              required
            />
          </div>

          <div className="space-y-2">
            <TextField
              fullWidth
              label="Option A"
              name="optionA"
              value={questionData.optionA}
              onChange={handleChange}
              error={!!error.options}
              required
            />
            <TextField
              fullWidth
              label="Option B"
              name="optionB"
              value={questionData.optionB}
              onChange={handleChange}
              error={!!error.options}
              required
            />
            <TextField
              fullWidth
              label="Option C"
              name="optionC"
              value={questionData.optionC}
              onChange={handleChange}
              error={!!error.options}
              required
            />
            <TextField
              fullWidth
              label="Option D"
              name="optionD"
              value={questionData.optionD}
              onChange={handleChange}
              error={!!error.options}
              required
            />
          </div>

          <FormControl fullWidth error={!!error.correctAnswer}>
            <InputLabel>Correct Answer</InputLabel>
            <Select
              name="correctAnswer"
              value={questionData.correctAnswer}
              onChange={handleChange}
              required
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
            <FormHelperText>{error.correctAnswer}</FormHelperText>
          </FormControl>

          <div>
            <TextField
              fullWidth
              label="Marks"
              name="marks"
              value={questionData.marks}
              onChange={handleChange}
              error={!!error.marks}
              helperText={error.marks}
              type="number"
              required
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionPage;
