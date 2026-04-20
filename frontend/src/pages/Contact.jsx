import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../config';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
} from '@mui/icons-material';


const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess(false);

  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } else {
      throw new Error(data.error || 'Failed to send message');
    }
  } catch (err) {
    setError(err.message || 'Failed to send message. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Phone',
      details: ['(123) 456-7890', 'Available Mon-Fri, 9am-5pm'],
    },
    {
      icon: <EmailIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Email',
      details: ['contact@mindwellpsychology.com', 'admin@mindwellpsychology.com'],
    },
    {
      icon: <LocationIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Location',
      details: ['123 Therapy Street', 'Mental Health City, MH 12345'],
    },
    {
      icon: <TimeIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Hours',
      details: ['Monday - Friday: 9:00 AM - 5:00 PM', 'Saturday: By appointment only', 'Sunday: Closed'],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | MindWell Psychology</title>
        <meta 
          name="description" 
          content="Get in touch with MindWell Psychology. Schedule a consultation or ask questions about our services." 
        />
      </Helmet>

      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
            Reach out to schedule a consultation or learn more about our services. 
            We're here to support your mental health journey.
          </Typography>

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Get In Touch
                </Typography>
                
                <Grid container spacing={3}>
                  {contactInfo.map((info, index) => (
                    <Grid item xs={12} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {info.icon}
                            <Box>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                {info.title}
                              </Typography>
                              {info.details.map((detail, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary">
                                  {detail}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Emergency Information */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'warning.light' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'warning.dark' }}>
                  ⚠️ Emergency Contact
                </Typography>
                <Typography variant="body2" paragraph>
                  If you are experiencing a mental health emergency, please contact:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  National Suicide Prevention Lifeline: 988
                </Typography>
                <Typography variant="body2">
                  Available 24/7 • Free and confidential
                </Typography>
              </Paper>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Send Us a Message
                </Typography>

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you within 24-48 hours.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Please share your concerns or questions. The more information you provide, the better we can assist you."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        disabled={loading}
                        sx={{ py: 1.5, px: 4 }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>

                <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> This contact form is for general inquiries only. 
                    For appointment scheduling, please use the Book Appointment page. 
                    All communications are confidential.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* FAQ Section */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
              Frequently Asked Questions
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    How soon can I get an appointment?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We typically have availability within 1-2 weeks. Urgent appointments may be available sooner.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Do you accept insurance?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yes, we accept most major insurance plans. Please contact us with your insurance information for verification.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    What is your cancellation policy?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We require 24 hours notice for cancellations. Late cancellations may incur a fee.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Do you offer online sessions?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yes, we offer both in-person and telehealth sessions based on your preference and needs.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Contact;