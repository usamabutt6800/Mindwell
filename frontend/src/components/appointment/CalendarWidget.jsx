import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CalendarWidget = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Generate next 14 days
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  const handleDateClick = (date) => {
    console.log('Calendar: Date clicked:', date); // Debug log
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date); // This should call the parent function
    } else {
      console.error('onDateSelect function is not provided!');
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Appointment Date
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Available dates in the next two weeks (excluding weekends):
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {dates.map((date, index) => {
          const isDateSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
          const weekend = isWeekend(date);
          
          return (
            <Paper
              key={index}
              elevation={isDateSelected ? 3 : 1}
              sx={{
                p: 2,
                minWidth: 120,
                textAlign: 'center',
                cursor: weekend ? 'not-allowed' : 'pointer',
                bgcolor: isDateSelected ? 'primary.main' : weekend ? 'grey.100' : 'background.paper',
                color: isDateSelected ? 'white' : weekend ? 'grey.500' : 'text.primary',
                opacity: weekend ? 0.5 : 1,
                '&:hover': {
                  bgcolor: weekend ? 'grey.100' : isDateSelected ? 'primary.main' : 'action.hover',
                }
              }}
              onClick={() => {
                console.log('Clicked date:', date, 'Weekend:', weekend); // Debug
                if (!weekend) {
                  handleDateClick(date);
                }
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {formatDate(date)}
              </Typography>
              <Typography variant="caption">
                {weekend ? 'Not Available' : 'Available'}
              </Typography>
            </Paper>
          );
        })}
      </Box>
      
      {selectedDate && (
        <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
          <Typography variant="body1">
            Selected: {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="body2">
            Please fill your details below to complete booking
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CalendarWidget;