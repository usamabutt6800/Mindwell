import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Upload as UploadIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MobileIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { API_DOMAIN } from '../config';

const API = API_DOMAIN;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const [formData, setFormData] = useState({
    appointmentId: '',
    transactionId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    amount: 3000,
    receipt: null
  });
  
  const [errors, setErrors] = useState({});
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Get appointment ID from location state or URL
  useEffect(() => {
    const appointmentId = location.state?.appointmentId || 
                         new URLSearchParams(location.search).get('appointmentId');
    
    if (!appointmentId) {
      toast.error('No appointment found. Please book an appointment first.');
      navigate('/appointment');
      return;
    }

    setFormData(prev => ({ ...prev, appointmentId }));
    fetchPaymentMethods();
    fetchAppointmentDetails(appointmentId);
  }, [location, navigate]);

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const response = await fetch(`${API}/api/admin/appointments`);
      const data = await response.json();
      
      if (data.success) {
        const appointment = data.data.find(app => app._id === appointmentId);
        if (appointment) {
          setAppointmentDetails(appointment);
          setFormData(prev => ({ ...prev, amount: appointment.amount || 3000 }));
        }
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${API}/api/payments/methods`);
      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.data.methods);
        // Auto-select first method
        if (data.data.methods.length > 0) {
          setSelectedMethod(data.data.methods[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  };

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and PDF are allowed.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      receipt: file
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedMethod) {
      newErrors.method = 'Please select a payment method';
    }
    
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }
    
    if (!formData.receipt) {
      newErrors.receipt = 'Receipt image is required';
    }
    
    if (!formData.amount || formData.amount < 1) {
      newErrors.amount = 'Valid amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('appointmentId', formData.appointmentId);
    formDataToSend.append('paymentMethod', selectedMethod);
    formDataToSend.append('transactionId', formData.transactionId);
    formDataToSend.append('transactionDate', formData.transactionDate);
    formDataToSend.append('amount', formData.amount);
    formDataToSend.append('receipt', formData.receipt);

    try {
      const response = await fetch(`${API}/api/payments`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment submitted successfully! We will verify it shortly.');
        setActiveStep(2);
      } else {
        throw new Error(data.error || 'Payment submission failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setUploading(false);
    }
  };

  const getSelectedMethodDetails = () => {
    return paymentMethods.find(method => method.id === selectedMethod);
  };

  const steps = ['Select Method', 'Upload Receipt', 'Confirmation'];

  const methodDetails = getSelectedMethodDetails();

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Complete Your Payment
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Secure payment for your appointment
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
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Select Payment Method
                  </Typography>
                  
                  {appointmentDetails && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>Appointment:</strong> {new Date(appointmentDetails.appointmentDate).toDateString()} at {appointmentDetails.appointmentTime}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>Service:</strong> {appointmentDetails.serviceType}
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Available Payment Methods
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {paymentMethods.map((method) => (
                        <Grid item xs={12} sm={6} key={method.id}>
                          <Card
                            sx={{
                              border: selectedMethod === method.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#1976d2',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                              }
                            }}
                            onClick={() => handleMethodSelect(method.id)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                {method.id === 'easypaisa' || method.id === 'jazzcash' ? (
                                  <MobileIcon color="primary" />
                                ) : method.id === 'bank_transfer' ? (
                                  <BankIcon color="primary" />
                                ) : (
                                  <CreditCardIcon color="primary" />
                                )}
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {method.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {method.instructions}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {errors.method && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                        {errors.method}
                      </Typography>
                    )}
                  </Box>

                  {methodDetails && (
                    <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {methodDetails.name} Details
                      </Typography>
                      
                      {methodDetails.id === 'bank_transfer' ? (
                        <>
                          <Typography variant="body2">
                            <strong>Bank:</strong> {methodDetails.details.bankName}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Account Title:</strong> {methodDetails.details.accountTitle}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Account Number:</strong> {methodDetails.details.accountNumber}
                          </Typography>
                          <Typography variant="body2">
                            <strong>IBAN:</strong> {methodDetails.details.iban}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Branch:</strong> {methodDetails.details.branch}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2">
                            <strong>Account Number:</strong> {methodDetails.details.accountNumber}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Account Name:</strong> {methodDetails.details.accountName}
                          </Typography>
                        </>
                      )}
                      
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Note:</strong> {methodDetails.details.note}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Amount: <strong>PKR {formData.amount}</strong>
                        </Typography>
                      </Alert>
                    </Paper>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate('/appointment')}
                    >
                      Back to Appointment
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      disabled={!selectedMethod}
                    >
                      Next: Upload Receipt
                    </Button>
                  </Box>
                </>
              )}

              {activeStep === 1 && (
                <>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Upload Payment Receipt
                  </Typography>

                  <form onSubmit={handleSubmitPayment}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Transaction ID *"
                          name="transactionId"
                          value={formData.transactionId}
                          onChange={handleInputChange}
                          error={!!errors.transactionId}
                          helperText={errors.transactionId}
                          required
                          placeholder="Enter transaction ID from your payment"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Transaction Date"
                          name="transactionDate"
                          type="date"
                          value={formData.transactionDate}
                          onChange={handleInputChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Amount (PKR) *"
                          name="amount"
                          type="number"
                          value={formData.amount}
                          onChange={handleInputChange}
                          error={!!errors.amount}
                          helperText={errors.amount || 'Default: PKR 3000'}
                          required
                          InputProps={{ inputProps: { min: 1 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Payment Method</InputLabel>
                          <Select
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            label="Payment Method"
                          >
                            {paymentMethods.map((method) => (
                              <MenuItem key={method.id} value={method.id}>
                                {method.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                            Upload Receipt *
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Upload screenshot or photo of your payment receipt (JPG, PNG, PDF, max 5MB)
                          </Typography>
                          
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                            sx={{ mb: 2 }}
                          >
                            Choose Receipt File
                            <input
                              type="file"
                              hidden
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={handleFileChange}
                            />
                          </Button>
                          
                          {formData.receipt && (
                            <Box sx={{ mt: 2 }}>
                              <Chip
                                icon={<ReceiptIcon />}
                                label={formData.receipt.name}
                                onDelete={() => setFormData(prev => ({ ...prev, receipt: null }))}
                                sx={{ mr: 2 }}
                              />
                              <Button
                                size="small"
                                onClick={() => setPreviewDialogOpen(true)}
                                disabled={!formData.receipt.type.startsWith('image/')}
                              >
                                Preview
                              </Button>
                            </Box>
                          )}
                          
                          {errors.receipt && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                              {errors.receipt}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                      >
                        Back to Methods
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={uploading}
                        startIcon={uploading ? null : <CheckCircleIcon />}
                      >
                        {uploading ? (
                          <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                          'Submit Payment'
                        )}
                      </Button>
                    </Box>
                  </form>
                </>
              )}

              {activeStep === 2 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                    Payment Submitted Successfully!
                  </Typography>
                  <Typography variant="h6" paragraph sx={{ mb: 3 }}>
                    Thank you for your payment.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    We have received your payment receipt and will verify it shortly.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Once verified, your appointment will be confirmed and you'll receive an email.
                  </Typography>
                  
                  <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Next Steps:</strong>
                    </Typography>
                    <Typography variant="body2">
                      1. We'll verify your payment within 24 hours
                    </Typography>
                    <Typography variant="body2">
                      2. You'll receive appointment confirmation email
                    </Typography>
                    <Typography variant="body2">
                      3. Check your email for any updates
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/')}
                    >
                      Return to Home
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/contact')}
                    >
                      Contact Support
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Payment Information
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  💰 Payment Instructions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. Complete payment using selected method
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Save screenshot or photo of payment confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  3. Upload the receipt on this page
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  4. We'll verify and confirm your appointment
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  🔒 Secure Process
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • All payments are securely processed
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Receipts are encrypted and stored safely
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Manual verification ensures accuracy
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Email notifications at every step
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ⏰ Processing Time
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Payment verification: Within 24 hours
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Appointment confirmation: After verification
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Session reminder: 24 hours before appointment
                </Typography>
              </Box>

              <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Need Help?
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📞 Call: +92-312-3456789
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✉️ Email: payments@mindwell.com
                </Typography>
                <Typography variant="body2">
                  🕒 Support: Mon-Sat, 9AM-6PM
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Receipt Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img 
              src={previewImage} 
              alt="Receipt Preview" 
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentPage;