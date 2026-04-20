import React from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  clientName: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  appointmentTime: Yup.string().required('Please select a time'),
  serviceType: Yup.string().required('Please select service type'),
  message: Yup.string().max(500, 'Message is too long'),
});

const BookingForm = ({ onSubmit, onBack, loading, availableSlots = [] }) => {
  const formik = useFormik({
    initialValues: {
      clientName: '',
      email: '',
      phone: '',
      appointmentTime: '',
      serviceType: '',
      message: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const serviceTypes = [
    { value: 'individual', label: 'Individual Therapy' },
    { value: 'couple', label: 'Couples Counseling' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'adolescent', label: 'Adolescent Therapy' },
    { value: 'assessment', label: 'Psychological Assessment' },
  ];

  // Fixed time slots
  const timeSlots = availableSlots.length > 0 ? availableSlots : [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="clientName"
            value={formik.values.clientName}
            onChange={formik.handleChange}
            error={formik.touched.clientName && Boolean(formik.errors.clientName)}
            helperText={formik.touched.clientName && formik.errors.clientName}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={formik.touched.appointmentTime && Boolean(formik.errors.appointmentTime)}>
            <InputLabel>Preferred Time</InputLabel>
            <Select
              name="appointmentTime"
              value={formik.values.appointmentTime}
              onChange={formik.handleChange}
              disabled={loading}
              label="Preferred Time"
            >
              <MenuItem value="">
                <em>Select time</em>
              </MenuItem>
              {timeSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.appointmentTime && formik.errors.appointmentTime && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                {formik.errors.appointmentTime}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={formik.touched.serviceType && Boolean(formik.errors.serviceType)}>
            <InputLabel>Service Type</InputLabel>
            <Select
              name="serviceType"
              value={formik.values.serviceType}
              onChange={formik.handleChange}
              disabled={loading}
              label="Service Type"
            >
              <MenuItem value="">
                <em>Select service</em>
              </MenuItem>
              {serviceTypes.map((service) => (
                <MenuItem key={service.value} value={service.value}>
                  {service.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.serviceType && formik.errors.serviceType && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                {formik.errors.serviceType}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Information (Optional)"
            name="message"
            multiline
            rows={4}
            value={formik.values.message}
            onChange={formik.handleChange}
            error={formik.touched.message && Boolean(formik.errors.message)}
            helperText={formik.touched.message && formik.errors.message}
            disabled={loading}
            placeholder="Please share any concerns or information that might help us prepare for your session"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default BookingForm;