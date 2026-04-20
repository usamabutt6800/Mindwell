import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  AccessTime as TimeIcon,
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { API_DOMAIN } from '../config';

const API = API_DOMAIN;

// Helper to get local YYYY-MM-DD string
const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const Appointment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [calendarSettings, setCalendarSettings] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    appointmentTime: '',
    serviceType: 'individual',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const toastId = useRef(null);

  // Clean up toast on unmount
  useEffect(() => {
    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  // Fetch available dates from calendar API
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  /**
   * Fetch available dates from calendar system
   * This replaces the hardcoded date generation
   */
  const fetchAvailableDates = async () => {
    try {
      setLoadingDates(true);
      
      // Get dates for next 30 days
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);
      
      const startStr = getLocalDateString(today);
      const endStr = getLocalDateString(endDate);
      
      const response = await fetch(
        `${API}/api/calendar/availability?startDate=${startStr}&endDate=${endStr}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Create map for quick lookup
        const settingsMap = {};
        data.data.forEach(item => {
          settingsMap[item.date] = item;
        });
        
        setCalendarSettings(settingsMap);
        
        // Filter to only available dates
        const available = data.data
          .filter(item => item.isAvailable)
          .map(item => {
            const parts = item.date.split('-');
            return new Date(parts[0], parts[1] - 1, parts[2]);
          });
        
        setAvailableDates(available);
        
        console.log(`📅 Found ${available.length} available dates out of ${data.data.length} total`);
      } else {
        throw new Error(data.error || 'Failed to fetch calendar');
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
      toast.error('Failed to load available dates. Using default schedule.');
      
      // Fallback: Generate default dates (weekdays only)
      const fallbackDates = generateFallbackDates();
      setAvailableDates(fallbackDates);
    } finally {
      setLoadingDates(false);
    }
  };

  /**
   * Fallback date generation (weekdays only)
   * Used if calendar API fails
   */
  const generateFallbackDates = () => {
    const dates = [];
    const today = new Date();
    let count = 0;
    
    while (dates.length < 14) {
      const date = new Date(today);
      date.setDate(today.getDate() + count);
      count++;
      
      // Skip weekends (default behavior)
      const day = date.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        dates.push(date);
      }
    }
    return dates;
  };

  // Time slots and service types (unchanged)
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const formatTime12Hour = (time24) => {
    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 becomes 12
    return `${hour}:${minStr} ${ampm}`;
  };
  const serviceTypes = [
    { value: 'individual', label: 'Individual Therapy' },
    { value: 'couple', label: 'Couple Therapy' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'assessment', label: 'Psychological Assessment' },
    { value: 'consultation', label: 'Initial Consultation' },
  ];

  /**
   * Handle date selection with calendar integration
   */
  const handleDateSelect = async (date) => {
    console.log('✅ Date selected:', date);
    setSelectedDate(date);
    
    // Check availability for this date (extra validation)
    const dateStr = getLocalDateString(date);
    const setting = calendarSettings[dateStr];
    
    if (setting && !setting.isAvailable) {
      toast.error(`❌ ${setting.reason || 'Date is not available'}`);
      return;
    }

    // Fetch booked slots for this date
    try {
      const response = await fetch(`${API}/api/appointments/booked?date=${dateStr}`);
      const data = await response.json();
      if (data.success) {
        setBookedSlots(data.booked || []);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
    
    setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  /**
   * Validate step 1: Date selection
   */
  const validateStep1 = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return false;
    }
    
    // Extra check with calendar settings
    const dateStr = getLocalDateString(selectedDate);
    const setting = calendarSettings[dateStr];
    
    if (setting && !setting.isAvailable) {
      toast.error(`❌ ${setting.reason || 'Selected date is no longer available'}`);
      return false;
    }
    
    return true;
  };

  /**
   * Validate step 2: Form details
   */
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle appointment submission with calendar validation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    if (loading) return;
    
    setLoading(true);
    
    // SAFE toast implementation
    toastId.current = toast.loading('Booking your appointment...', {
      autoClose: false
    });

    try {
      const appointmentData = {
        clientName: formData.clientName,
        email: formData.email,
        phone: formData.phone,
        appointmentDate: getLocalDateString(selectedDate),
        appointmentTime: formData.appointmentTime,
        serviceType: formData.serviceType,
        message: formData.message || ''
      };
      
      console.log('📤 Sending to backend:', appointmentData);
      
      const response = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // SAFE success toast - Updated for payment redirect
        toast.update(toastId.current, {
          render: 'Appointment booked successfully! Redirecting to payment...',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        
        // Store appointment ID for payment page
        const appointmentId = data.data._id;
        
        // Reset form
        setFormData({
          clientName: '',
          email: '',
          phone: '',
          appointmentTime: '',
          serviceType: 'individual',
          message: ''
        });
        setSelectedDate(null);
        setErrors({});
        
        // Refresh available dates (one slot is now booked)
        fetchAvailableDates();
        
        // Redirect to payment page after 2 seconds
        setTimeout(() => {
          navigate('/payment', { 
            state: { 
              appointmentId: appointmentId,
              clientName: appointmentData.clientName,
              appointmentDate: appointmentData.appointmentDate,
              appointmentTime: appointmentData.appointmentTime
            } 
          });
        }, 2000);
        
      } else {
        // SAFE error toast
        toast.update(toastId.current, {
          render: data.error || 'Failed to book appointment. Please try again.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      
      // SAFE fallback toast
      if (toastId.current) {
        toast.update(toastId.current, {
          render: 'Network error. Please check your connection.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.error('Network error. Please check your connection.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Get date status from calendar settings
   */
  const getDateStatus = (date) => {
    const dateStr = getLocalDateString(date);
    const setting = calendarSettings[dateStr];
    
    if (setting) {
      return {
        isAvailable: setting.isAvailable,
        reason: setting.reason,
        hasCustomHours: setting.customHours && setting.customHours.length > 0,
        isCustomSetting: setting.hasCustomSettings
      };
    }
    
    // Default: weekends unavailable
    const day = date.getDay();
    return {
      isAvailable: day !== 0 && day !== 6,
      reason: day === 0 || day === 6 ? 'Weekend' : 'Available',
      hasCustomHours: false,
      isCustomSetting: false
    };
  };

  const steps = ['Select Date', 'Your Details', 'Confirmation'];

  return (
    <>
      <Helmet>
        <title>Book Appointment | MindWell Psychology</title>
        <meta name="description" content="Schedule an appointment with our licensed clinical psychologist. Online and in-person sessions available." />
      </Helmet>

      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Book Your Appointment
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Take the first step towards better mental health
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {activeStep === 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Select Appointment Date
                      </Typography>
                      <Button 
                        size="small" 
                        startIcon={<CalendarIcon />}
                        onClick={fetchAvailableDates}
                        disabled={loadingDates}
                      >
                        Refresh Dates
                      </Button>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Available dates from our calendar system:
                      </Typography>
                      
                      {loadingDates ? (
                        // Loading skeleton
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <Skeleton 
                              key={i} 
                              variant="rounded" 
                              width={120} 
                              height={80} 
                              sx={{ borderRadius: 2 }}
                            />
                          ))}
                        </Box>
                      ) : availableDates.length === 0 ? (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            No available dates found in the next 30 days.
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Please check back later or contact us for special scheduling.
                          </Typography>
                        </Alert>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                            {availableDates.slice(0, 14).map((date, index) => {
                              const isSelected = selectedDate && 
                                selectedDate.toDateString() === date.toDateString();
                              const status = getDateStatus(date);
                              
                              return (
                                <Paper
                                  key={index}
                                  elevation={isSelected ? 3 : 1}
                                  sx={{
                                    p: 2,
                                    minWidth: 120,
                                    textAlign: 'center',
                                    cursor: status.isAvailable ? 'pointer' : 'not-allowed',
                                    bgcolor: isSelected ? 'primary.main' : 
                                             status.isAvailable ? 'background.paper' : 'grey.100',
                                    color: isSelected ? 'white' : 
                                           status.isAvailable ? 'text.primary' : 'grey.500',
                                    opacity: status.isAvailable ? 1 : 0.6,
                                    '&:hover': {
                                      bgcolor: status.isAvailable ? 
                                        (isSelected ? 'primary.main' : 'action.hover') : 'grey.100',
                                    },
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                  }}
                                  onClick={() => {
                                    if (status.isAvailable) {
                                      handleDateSelect(date);
                                    }
                                  }}
                                >
                                  {status.isCustomSetting && (
                                    <Chip
                                      size="small"
                                      label="Custom"
                                      color="info"
                                      sx={{ 
                                        position: 'absolute', 
                                        top: -8, 
                                        right: -8,
                                        fontSize: '0.6rem',
                                        height: 20
                                      }}
                                    />
                                  )}
                                  
                                  <Typography variant="body2" fontWeight="medium">
                                    {date.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                  <Typography variant="caption">
                                    {date.toLocaleDateString('en-US', { year: 'numeric' })}
                                  </Typography>
                                  
                                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                    {status.isAvailable ? (
                                      <EventAvailableIcon fontSize="small" color="success" />
                                    ) : (
                                      <EventBusyIcon fontSize="small" color="disabled" />
                                    )}
                                    <Typography variant="caption" fontSize="0.7rem">
                                      {status.isAvailable ? 'Available' : status.reason}
                                    </Typography>
                                  </Box>
                                </Paper>
                              );
                            })}
                          </Box>
                          
                          {availableDates.length > 14 && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                Showing 14 of {availableDates.length} available dates. 
                                More dates are available beyond two weeks.
                              </Typography>
                            </Alert>
                          )}
                        </>
                      )}
                    </Box>
                    
                    {selectedDate && (
                      <Alert 
                        severity="info" 
                        icon={<InfoIcon />}
                        sx={{ mt: 3 }}
                      >
                        <Typography variant="body2">
                          <strong>Selected:</strong> {formatDateDisplay(selectedDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Next: Enter your details and choose a time slot.
                        </Typography>
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (validateStep1()) {
                            setActiveStep(1);
                          }
                        }}
                        disabled={!selectedDate}
                        size="large"
                        startIcon={<TimeIcon />}
                      >
                        Next: Enter Details
                      </Button>
                    </Box>
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Your Information
                    </Typography>
                    
                    {selectedDate && (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                          <strong>Selected Date:</strong> {formatDateDisplay(selectedDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Available Time Slots:</strong> 9:00 AM, 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM, 4:00 PM
                        </Typography>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Full Name *"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            error={!!errors.clientName}
                            helperText={errors.clientName}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email Address *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone Number *"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!errors.appointmentTime} required>
                            <InputLabel>Appointment Time *</InputLabel>
                            <Select
                              name="appointmentTime"
                              value={formData.appointmentTime}
                              onChange={handleInputChange}
                              label="Appointment Time *"
                            >
                              <MenuItem value=""><em>Select a time</em></MenuItem>
                              {timeSlots.map((time) => (
                                <MenuItem 
                                  key={time} 
                                  value={time}
                                  disabled={bookedSlots.includes(time)}
                                >
                                  {formatTime12Hour(time)} {bookedSlots.includes(time) ? '(Already Booked)' : ''}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.appointmentTime && (
                              <Typography variant="caption" color="error">
                                {errors.appointmentTime}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Service Type</InputLabel>
                            <Select
                              name="serviceType"
                              value={formData.serviceType}
                              onChange={handleInputChange}
                              label="Service Type"
                            >
                              {serviceTypes.map((service) => (
                                <MenuItem key={service.value} value={service.value}>
                                  {service.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Additional Notes (Optional)"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="Please share any specific concerns or questions you'd like us to know about..."
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                          onClick={handleBack}
                          variant="outlined"
                          startIcon={<CalendarIcon />}
                        >
                          Change Date
                        </Button>
                        
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{ minWidth: 150 }}
                          startIcon={loading ? null : <EventAvailableIcon />}
                        >
                          {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                          ) : (
                            'Book Appointment'
                          )}
                        </Button>
                      </Box>
                    </form>
                  </>
                )}

                {activeStep === 2 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                      🎉 Appointment Booked Successfully!
                    </Typography>
                    <Typography variant="h6" paragraph sx={{ mb: 3 }}>
                      Redirecting to payment page...
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Please complete your payment to confirm the appointment.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <CircularProgress />
                    </Box>
                    
                    <Alert severity="info" sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}>
                      <Typography variant="body2">
                        You will be redirected to the payment page in a moment.
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        If not redirected automatically,{' '}
                        <Button 
                          color="primary" 
                          size="small" 
                          onClick={() => navigate('/payment')}
                          sx={{ minWidth: 'auto', p: 0 }}
                        >
                          click here
                        </Button>
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => window.location.href = '/'}
                      >
                        Back to Home
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Calendar System Information
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    📅 Real-Time Availability
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Dates are updated in real-time based on therapist's schedule<br/>
                    • Admin can mark holidays or busy days as unavailable<br/>
                    • Weekends can be enabled for special sessions<br/>
                    • Custom time slots available for specific dates
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ⚡ Instant Confirmation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Bookings are confirmed immediately if slot is available<br/>
                    • Automatic email confirmation sent within seconds<br/>
                    • Duplicate bookings are prevented automatically<br/>
                    • Real-time calendar sync prevents double-booking
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    🔄 Flexible Rescheduling
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • Need to reschedule? Contact us anytime<br/>
                    • 24-hour cancellation policy<br/>
                    • Easy date changes through our admin team<br/>
                    • Multiple rescheduling options available
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    📞 Need Help?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Having trouble finding a suitable time?<br/>
                    Contact us for special scheduling requests.
                  </Typography>
                </Box>

                <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Calendar Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventAvailableIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      <strong>Available:</strong> {availableDates.length} dates in next 30 days
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventBusyIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> Just now
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Appointment;