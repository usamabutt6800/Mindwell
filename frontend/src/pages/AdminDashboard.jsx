import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  Tooltip,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  TablePagination,
  Tabs,
  Tab,
} from '@mui/material';

import {
  Psychology as PsychologyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  ListAlt as ListAltIcon,
  Visibility as VisibilityIcon,
  AccessTime as TimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  EditCalendar as EditCalendarIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  HourglassEmpty as HourglassEmptyIcon,
    Payment as PaymentIcon,
  CloudUpload as CloudUploadIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_DOMAIN } from '../config';

const API = API_DOMAIN;

// ================= ERROR BOUNDARY =================
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Dashboard failed to load
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Dashboard
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ================= MAIN COMPONENT =================
// Helper to get local YYYY-MM-DD string
const getLocalDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [allAppointmentsOpen, setAllAppointmentsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [emailStatus, setEmailStatus] = useState('Checking...');
  const [emailLogs, setEmailLogs] = useState([]);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    totalContacts: 0,
    unreadContacts: 0,
  });
  

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // NEW: Calendar Management States
  const [activeTab, setActiveTab] = useState(0);
  const [calendarSettings, setCalendarSettings] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [calendarForm, setCalendarForm] = useState({
    date: getLocalDateString(new Date()),
    isAvailable: true,
    reason: '',
    customHours: [],
    maxAppointments: 8
  });
  const [calendarPage, setCalendarPage] = useState(0);
  const [calendarRowsPerPage, setCalendarRowsPerPage] = useState(10);

  // NEW: Payment Management States
  const [payments, setPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentFilters, setPaymentFilters] = useState({
    status: 'all',
    method: 'all',
    startDate: '',
    endDate: ''
  });
  // ================= AUTH HELPER =================
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('adminToken'); // Changed to sessionStorage
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const fetchWithAuth = async (url, options = {}) => {
  try {
    const token = sessionStorage.getItem('adminToken'); // Changed to sessionStorage
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    // If unauthorized, redirect to login
    if (response.status === 401) {
      sessionStorage.removeItem('adminToken'); // Changed
      sessionStorage.removeItem('isAdmin'); // Changed
      navigate('/admin/login');
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    if (error.message === 'Unauthorized') {
      throw error;
    }
    console.error('Fetch error:', error);
    throw error;
  }
};
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0
  });

  // ================= USE EFFECT =================
useEffect(() => {
  const verifyAndLoad = async () => {
    const token = sessionStorage.getItem('adminToken'); // Changed
    const isAdmin = sessionStorage.getItem('isAdmin'); // Changed
    
    if (!token || !isAdmin) {
      navigate('/admin/login');
      return;
    }

    try {
      // Verify token with backend
      const verifyRes = await fetch(`${API}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!verifyRes.ok) {
        // Token invalid, redirect to login
        sessionStorage.removeItem('adminToken'); // Changed
        sessionStorage.removeItem('isAdmin'); // Changed
        navigate('/admin/login');
        return;
      }
      
      // Load dashboard data
      fetchAll();
      checkEmailStatus();
      fetchEmailLogs();
      
    } catch (error) {
      console.error('Auth verification failed:', error);
      sessionStorage.removeItem('adminToken'); // Changed
      sessionStorage.removeItem('isAdmin'); // Changed
      navigate('/admin/login');
    }
  };

  verifyAndLoad();
}, [navigate]);

  // ================= EMAIL STATUS =================
  const checkEmailStatus = async () => {
    try {
      const res = await fetch(`${API}/api/test/email-logger`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setEmailStatus(`✅ ${data.message.split('(')[0].trim()}`);
      } else {
        setEmailStatus('⚠️ Check failed');
      }
    } catch {
      setEmailStatus('❌ Connection failed');
    }
  };

 const fetchEmailLogs = async () => {
  try {
    const res = await fetchWithAuth(`${API}/api/admin/email-logs`);
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    }
  };

  // ================= FETCH DATA =================
  const fetchAll = async () => {
  try {
    setLoading(true);

    const [aRes, cRes] = await Promise.all([
      fetchWithAuth(`${API}/api/admin/appointments`),
      fetchWithAuth(`${API}/api/admin/contacts`)
    ]);

      const appointmentsData = await aRes.json();
      const contactsData = await cRes.json();

      const apps = appointmentsData.data || [];
      const conts = contactsData.data || [];

      setAppointments(apps);
      setContacts(conts);

      const today = new Date().toDateString();

      setStats({
        totalAppointments: apps.length,
        pendingAppointments: apps.filter(a => a.status === 'pending').length,
        todayAppointments: apps.filter(
          a => new Date(a.appointmentDate).toDateString() === today
        ).length,
        totalContacts: conts.length,
        unreadContacts: conts.filter(c => !c.isRead).length,
      });

    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ================= CALENDAR MANAGEMENT =================
  const fetchCalendarSettings = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch(`${API}/api/calendar/admin/settings?page=${calendarPage + 1}&limit=${calendarRowsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        setCalendarSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      toast.error('Failed to load calendar settings');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCalendarTabChange = (event, newValue) => {
  setActiveTab(newValue);  // ← CHANGE TO setActiveTab
  if (newValue === 1) {
    fetchCalendarSettings();
  }
};

  const handleOpenCalendarDialog = (date = null) => {
    if (date) {
      // Editing existing date
      setSelectedCalendarDate(date);
      setCalendarForm({
        date: date.date.split('T')[0],
        isAvailable: date.isAvailable,
        reason: date.reason || '',
        customHours: date.customHours || [],
        maxAppointments: date.maxAppointments || 8
      });
    } else {
      // Adding new date
      setSelectedCalendarDate(null);
      setCalendarForm({
        date: getLocalDateString(new Date()),
        isAvailable: true,
        reason: '',
        customHours: [],
        maxAppointments: 8
      });
    }
    setCalendarDialogOpen(true);
  };

  const handleSaveCalendarSetting = async () => {
    try {
      setCalendarLoading(true);
      
      const response = await fetch(`${API}/api/calendar/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendarForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Calendar setting saved successfully');
        setCalendarDialogOpen(false);
        fetchCalendarSettings();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setCalendarLoading(false);
    }
  };

  // ================= PAYMENT MANAGEMENT =================
const fetchPayments = async () => {
  try {
    setPaymentLoading(true);
    
    // Build query string from filters
    const params = new URLSearchParams();
    if (paymentFilters.status !== 'all') params.append('status', paymentFilters.status);
    if (paymentFilters.method !== 'all') params.append('method', paymentFilters.method);
    if (paymentFilters.startDate) params.append('startDate', paymentFilters.startDate);
    if (paymentFilters.endDate) params.append('endDate', paymentFilters.endDate);
    
    const response = await fetchWithAuth(`${API}/api/payments?${params.toString()}`);
    const data = await response.json();
    
    if (data.success) {
      setPayments(data.data);
      
      // Calculate payment stats
      let totalAmount = 0;
      let pending = 0;
      let verified = 0;
      let rejected = 0;
      
      data.data.forEach(payment => {
        totalAmount += payment.amount;
        if (payment.status === 'pending') pending++;
        if (payment.status === 'verified') verified++;
        if (payment.status === 'rejected') rejected++;
      });
      
      setPaymentStats({
        total: data.total || data.data.length,
        pending,
        verified,
        rejected,
        totalAmount
      });
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    toast.error('Failed to load payments');
  } finally {
    setPaymentLoading(false);
  }
};

const handleTabChange = (event, newValue) => {
  setActiveTab(newValue);
  if (newValue === 1) { // Calendar tab - now tab index 1
    fetchCalendarSettings();
  }
  if (newValue === 2) { // Payments tab - now tab index 2
    fetchPayments();
  }
};


const handleViewPayment = (payment) => {
  setSelectedPayment(payment);
  setPaymentDialogOpen(true);
};

const handleVerifyPayment = (payment) => {
  setSelectedPayment(payment);
  setVerificationNotes('');
  setVerificationDialogOpen(true);
};

const handleRejectPayment = (payment) => {
  setSelectedPayment(payment);
  setRejectionReason('');
  setRejectionDialogOpen(true);
};

const confirmVerifyPayment = async () => {
  try {
    setPaymentLoading(true);
    
    const response = await fetchWithAuth(`${API}/api/payments/${selectedPayment._id}/verify`, {
  method: 'PUT',
  body: JSON.stringify({ notes: verificationNotes })
});
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify payment');
    }
    
    if (data.success) {
      toast.success('Payment verified successfully');
      setVerificationDialogOpen(false);
      fetchPayments();
      fetchAll();
    } else {
      throw new Error(data.error || 'Verification failed');
    }
  } catch (error) {
    console.error('Verify error:', error);
    toast.error(`Failed to verify: ${error.message}`);
  } finally {
    setPaymentLoading(false);
  }
};

const confirmRejectPayment = async () => {
  try {
    setPaymentLoading(true);
    
    const response = await fetchWithAuth(`${API}/api/payments/${selectedPayment._id}/reject`, {
  method: 'PUT',
  body: JSON.stringify({ reason: rejectionReason })
});
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Payment rejected');
      setRejectionDialogOpen(false);
      fetchPayments();
      fetchAll(); // Refresh appointments
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    toast.error(`Failed to reject: ${error.message}`);
  } finally {
    setPaymentLoading(false);
  }
};

const handleFilterChange = (filterName, value) => {
  setPaymentFilters(prev => ({
    ...prev,
    [filterName]: value
  }));
};

const applyFilters = () => {
  fetchPayments();
};

const resetFilters = () => {
  setPaymentFilters({
    status: 'all',
    method: 'all',
    startDate: '',
    endDate: ''
  });
  fetchPayments();
};

const getStatusChipForPayment = (status) => {
  const config = {
    pending: { color: 'warning', icon: <HourglassEmptyIcon />, label: 'Pending' },
    verified: { color: 'success', icon: <VerifiedIcon />, label: 'Verified' },
    rejected: { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
    cancelled: { color: 'default', icon: <CancelIcon />, label: 'Cancelled' }
  };
  
  const cfg = config[status] || config.pending;
  
  return (
    <Chip
      icon={cfg.icon}
      label={cfg.label}
      color={cfg.color}
      size="small"
      variant="outlined"
    />
  );
};

const getMethodChip = (method) => {
  const methods = {
    easypaisa: { color: 'primary', label: 'EasyPaisa' },
    jazzcash: { color: 'secondary', label: 'JazzCash' },
    bank_transfer: { color: 'info', label: 'Bank Transfer' },
    cash: { color: 'default', label: 'Cash' }
  };
  
  const cfg = methods[method] || { color: 'default', label: method };
  
  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size="small"
      variant="outlined"
    />
  );
};

  // ================= LOGOUT =================
const handleLogout = () => {
  sessionStorage.removeItem('adminToken'); // Changed
  sessionStorage.removeItem('isAdmin'); // Changed
  navigate('/admin/login');
};
  // ================= UPDATE APPOINTMENT =================
const handleStatusUpdate = async () => {
  try {
    setUpdating(true);

    const res = await fetchWithAuth(
      `${API}/api/admin/appointments/${selectedAppointment._id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes }),
      }
    );

      if (!res.ok) throw new Error();

      toast.success('Appointment updated');
      setStatusDialogOpen(false);
      fetchAll();

    } catch {
      toast.error('Failed to update appointment');
    } finally {
      setUpdating(false);
    }
  };

  // ================= SEND REPLY =================
  const handleReplySubmit = async () => {
  try {
    setUpdating(true);

    const res = await fetchWithAuth(
      `${API}/api/admin/contacts/${selectedContact._id}/reply`,
      {
        method: 'POST',
        body: JSON.stringify({ replyMessage }),
      }
    );

      if (!res.ok) throw new Error();

      // Update local state: mark as replied AND read
      setContacts(prev => prev.map(c => 
        c._id === selectedContact._id ? { ...c, replied: true, isRead: true } : c
      ));

      // Update stats: decrement unread if it was unread
      if (!selectedContact.isRead) {
        setStats(prev => ({
          ...prev,
          unreadContacts: Math.max(0, prev.unreadContacts - 1)
        }));
      }

      toast.success('Reply sent');
      setReplyDialogOpen(false);
      setReplyMessage('');
      fetchAll();
      fetchEmailLogs();

    } catch {
      toast.error('Failed to send reply');
    } finally {
      setUpdating(false);
    }
  };

  // ================= MARK AS READ =================
const handleMarkAsRead = async (contactId) => {
  try {
    const res = await fetchWithAuth(`${API}/api/admin/contacts/${contactId}/read`, {
      method: 'PUT',
    });
      if (res.ok) {
        setContacts(prev => prev.map(c => 
          c._id === contactId ? { ...c, isRead: true } : c
        ));
        
        setStats(prev => ({
          ...prev,
          unreadContacts: Math.max(0, prev.unreadContacts - 1)
        }));
        
        toast.success('Marked as read');
      }
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  // ================= HELPER FUNCTIONS =================
  const getStatusChip = status => {
    const map = {
      pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      confirmed: { color: 'success', icon: <CheckCircleIcon />, label: 'Confirmed' },
      cancelled: { color: 'error', icon: <CancelIcon />, label: 'Cancelled' },
      completed: { color: 'info', icon: <CheckCircleIcon />, label: 'Completed' },
    };
    const cfg = map[status] || map.pending;

    return (
      <Chip
        icon={cfg.icon}
        label={cfg.label}
        color={cfg.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDate = d => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = d => {
    try {
      return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = d => {
    try {
      return new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  // ================= RENDER =================
  return (
    <>
      {/* HEADER */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 0,
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 3 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'white', width: 48, height: 48 }}>
                <PsychologyIcon sx={{ color: '#667eea' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  MindWell Psychology
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Admin Dashboard
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Email Status">
                <Chip
                  icon={<EmailIcon />}
                  label={emailStatus}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                  onClick={() => setLogsDialogOpen(true)}
                />
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<ListAltIcon />}
                onClick={() => setLogsDialogOpen(true)}
                sx={{ 
                  bgcolor: 'white',
                  color: '#667eea',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Email Logs ({emailLogs.length})
              </Button>

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* STATS CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: 'Total Appointments',
              value: stats.totalAppointments,
              icon: <CalendarIcon sx={{ fontSize: 30 }} />,
              color: '#4CAF50',
              description: 'All appointments'
            },
            {
              title: 'Pending',
              value: stats.pendingAppointments,
              icon: <PendingIcon sx={{ fontSize: 30 }} />,
              color: '#FF9800',
              description: 'Need review'
            },
            {
              title: "Today's",
              value: stats.todayAppointments,
              icon: <TimeIcon sx={{ fontSize: 30 }} />,
              color: '#2196F3',
              description: 'Appointments today'
            },
            {
              title: 'Messages',
              value: stats.totalContacts,
              icon: <EmailIcon sx={{ fontSize: 30 }} />,
              color: '#9C27B0',
              description: 'Contact messages'
            },
            {
              title: 'Unread',
              value: stats.unreadContacts,
              icon: <Badge badgeContent={stats.unreadContacts} color="error">
                <PeopleIcon sx={{ fontSize: 30 }} />
              </Badge>,
              color: '#F44336',
              description: 'Unread messages'
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      color: stat.color
                    }}>
                      {stat.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* MAIN CONTENT WITH TABS */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
  <Tabs value={activeTab} onChange={handleTabChange}>
    <Tab label="Appointments" icon={<CalendarIcon />} iconPosition="start" />
    <Tab label="Calendar" icon={<EditCalendarIcon />} iconPosition="start" />
    <Tab label="Payments" icon={<PaymentIcon />} iconPosition="start" />
    <Tab label="Messages" icon={<EmailIcon />} iconPosition="start" />
  </Tabs>
</Box>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* APPOINTMENTS PANEL */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3 
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Appointments
                    </Typography>
                    <Button 
                      size="small" 
                      startIcon={<RefreshIcon />}
                      onClick={fetchAll}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {appointments.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No appointments yet
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell><strong>Client</strong></TableCell>
                            <TableCell><strong>Contact</strong></TableCell>
                            <TableCell><strong>Date & Time</strong></TableCell>
                            <TableCell><strong>Service</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {appointments.slice(0, 8).map((app) => (
                            <TableRow 
                              key={app._id}
                              sx={{ 
                                '&:hover': { bgcolor: 'action.hover' },
                                bgcolor: app.status === 'pending' ? '#FFF8E1' : 'inherit'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {app.clientName}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{app.email}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {app.phone || 'No phone'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(app.appointmentDate)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {app.appointmentTime}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={app.serviceType} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              </TableCell>
                              <TableCell>
                                {getStatusChip(app.status)}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Update Status">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedAppointment(app);
                                        setStatus(app.status);
                                        setAdminNotes(app.adminNotes || '');
                                        setStatusDialogOpen(true);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setSelectedAppointment(app);
                                        setViewDialogOpen(true);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {appointments.length > 8 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => setAllAppointmentsOpen(true)}

                      >
                        View All ({appointments.length})
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* CONTACTS PANEL */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Recent Messages
                  </Typography>

                  {contacts.length === 0 ? (
                    <Alert severity="info">No messages yet</Alert>
                  ) : (
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {contacts.slice(0, 6).map((c) => (
                        <Paper 
                          key={c._id}
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: !c.isRead ? '#E3F2FD' : 'grey.50',
                            borderLeft: `4px solid ${c.replied ? '#4CAF50' : !c.isRead ? '#2196F3' : '#9E9E9E'}`
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {c.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(c.createdAt)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                            {c.subject}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.875rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {c.message}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedContact(c);
                                setReplyMessage('');
                                setReplyDialogOpen(true);
                              }}
                              disabled={c.replied}
                              sx={{ flex: 1 }}
                            >
                              {c.replied ? 'Replied' : 'Reply'}
                            </Button>
                            
                            {!c.isRead && !c.replied && (
                              <Button
                                size="small"
                                onClick={() => handleMarkAsRead(c._id)}
                                sx={{ minWidth: 'auto' }}
                              >
                                <MarkEmailReadIcon fontSize="small" />
                              </Button>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {contacts.length > 6 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                      >
                        View All ({contacts.length})
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Calendar Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchCalendarSettings}
                    disabled={calendarLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenCalendarDialog()}
                  >
                    Add Date Setting
                  </Button>
                </Box>
              </Box>

              {calendarLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : calendarSettings.length === 0 ? (
                <Alert severity="info">
                  No custom calendar settings found. Using default schedule (weekdays available, weekends unavailable).
                </Alert>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Availability</strong></TableCell>
                          <TableCell><strong>Reason</strong></TableCell>
                          <TableCell><strong>Custom Hours</strong></TableCell>
                          <TableCell><strong>Max Apps</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {calendarSettings.map((setting) => (
                          <TableRow key={setting._id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(setting.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={setting.isAvailable ? <EventAvailableIcon /> : <EventBusyIcon />}
                                label={setting.isAvailable ? 'Available' : 'Unavailable'}
                                color={setting.isAvailable ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {setting.reason || 'No reason specified'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {setting.customHours.length > 0 ? (
                                <Box>
                                  {setting.customHours.map((hour, idx) => (
                                    <Typography key={idx} variant="caption" display="block">
                                      {hour.start} - {hour.end}
                                    </Typography>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Default hours
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {setting.maxAppointments}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenCalendarDialog(setting)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      if (window.confirm('Delete this calendar setting?')) {
                                        // Add delete functionality here
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <TablePagination
                    component="div"
                    count={calendarSettings.length}
                    page={calendarPage}
                    onPageChange={(e, newPage) => setCalendarPage(newPage)}
                    rowsPerPage={calendarRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setCalendarRowsPerPage(parseInt(e.target.value, 10));
                      setCalendarPage(0);
                    }}
                  />
                </>
              )}
            </Paper>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* MESSAGES PANEL (Full width when selected from tabs) */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    All Messages ({contacts.length})
                  </Typography>

                  {contacts.length === 0 ? (
                    <Alert severity="info">No messages yet</Alert>
                  ) : (
                    <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                      {contacts.map((c) => (
                        <Paper 
                          key={c._id}
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: !c.isRead ? '#E3F2FD' : 'grey.50',
                            borderLeft: `4px solid ${c.replied ? '#4CAF50' : !c.isRead ? '#2196F3' : '#9E9E9E'}`
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {c.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(c.createdAt)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                            {c.subject}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.875rem',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {c.message}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedContact(c);
                                setReplyMessage('');
                                setReplyDialogOpen(true);
                              }}
                              disabled={c.replied}
                              sx={{ flex: 1 }}
                            >
                              {c.replied ? 'Replied' : 'Reply'}
                            </Button>
                            
                            {!c.isRead && !c.replied && (
                              <Button
                                size="small"
                                onClick={() => handleMarkAsRead(c._id)}
                                sx={{ minWidth: 'auto' }}
                              >
                                <MarkEmailReadIcon fontSize="small" />
                              </Button>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>

      {/* In your JSX, after the Calendar tab content, add:*/}

{activeTab === 2 && (
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    {/* PAYMENTS TAB CONTENT - This was in a comment */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Payment Verification ({paymentStats.total})
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
          disabled={paymentLoading}
        >
          Refresh
        </Button>
      </Box>
    </Box>

    {/* Payment Stats Cards */}
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ bgcolor: 'grey.50' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {paymentStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Payments
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ bgcolor: '#FFF8E1' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
              {paymentStats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ bgcolor: '#E8F5E9' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
              {paymentStats.verified}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ bgcolor: '#FFEBEE' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336' }}>
              {paymentStats.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejected
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card sx={{ bgcolor: '#E3F2FD' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3' }}>
              PKR {paymentStats.totalAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Filter Section */}
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={paymentFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Method</InputLabel>
            <Select
              value={paymentFilters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              label="Method"
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="easypaisa">EasyPaisa</MenuItem>
              <MenuItem value="jazzcash">JazzCash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            size="small"
            label="From Date"
            type="date"
            value={paymentFilters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            size="small"
            label="To Date"
            type="date"
            value={paymentFilters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={applyFilters}
              disabled={paymentLoading}
              sx={{ flex: 1 }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Payments Table */}
    {paymentLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    ) : payments.length === 0 ? (
      <Alert severity="info">
        No payments found. {paymentFilters.status !== 'all' || paymentFilters.method !== 'all' ? 'Try changing filters.' : 'Payments will appear here once clients submit them.'}
      </Alert>
    ) : (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Client</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow 
                  key={payment._id}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: payment.status === 'pending' ? '#FFF8E1' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {payment.clientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.clientEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      PKR {payment.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getMethodChip(payment.paymentMethod)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {payment.transactionId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChipForPayment(payment.status)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <RemoveRedEyeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {payment.status === 'pending' && (
                        <>
                          <Tooltip title="Verify Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleVerifyPayment(payment)}
                            >
                              <VerifiedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Payment">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectPayment(payment)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip title="View Receipt">
                        <IconButton
                          size="small"
                          onClick={() => window.open(payment.receiptImage, '_blank')}
                        >
                          <CloudUploadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )}
  </Paper>
)}

{activeTab === 3 && (
  <Grid container spacing={3}>
    {/* MESSAGES PANEL (Full width when selected from tabs) */}
    <Grid item xs={12}>
      <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          All Messages ({contacts.length})
        </Typography>

        {contacts.length === 0 ? (
          <Alert severity="info">No messages yet</Alert>
        ) : (
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {contacts.map((c) => (
              <Paper 
                key={c._id}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: !c.isRead ? '#E3F2FD' : 'grey.50',
                  borderLeft: `4px solid ${c.replied ? '#4CAF50' : !c.isRead ? '#2196F3' : '#9E9E9E'}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(c.createdAt)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                  {c.subject}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {c.message}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedContact(c);
                      setReplyMessage('');
                      setReplyDialogOpen(true);
                    }}
                    disabled={c.replied}
                    sx={{ flex: 1 }}
                  >
                    {c.replied ? 'Replied' : 'Reply'}
                  </Button>
                  
                  {!c.isRead && !c.replied && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(c._id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      <MarkEmailReadIcon fontSize="small" />
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Grid>
  </Grid>
)}

      {/* STATUS UPDATE DIALOG */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Appointment Status
          {selectedAppointment && (
            <Typography variant="body2" color="text.secondary">
              {selectedAppointment.clientName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Client:</strong> {selectedAppointment.clientName}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Service:</strong> {selectedAppointment.serviceType}
                </Typography>
              </Box>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes (Optional)"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes for client or internal reference..."
              />

              {(status === 'confirmed' || status === 'cancelled') && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Client will receive email notification with your notes.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* REPLY DIALOG */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reply to Message
          {selectedContact && (
            <Typography variant="body2" color="text.secondary">
              {selectedContact.name} ({selectedContact.email})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedContact && (
            <>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Original Message:
                </Typography>
                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedContact.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Received: {formatDateTime(selectedContact.createdAt)}
                </Typography>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Your Reply"
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                required
              />

              <Alert severity="info" sx={{ mt: 2 }}>
                This reply will be emailed to {selectedContact.email}
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReplySubmit} 
            variant="contained"
            disabled={updating || !replyMessage.trim()}
          >
            {updating ? 'Sending...' : 'Send Reply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DETAILS DIALOG */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                {[
                  { label: 'Client Name', value: selectedAppointment.clientName },
                  { label: 'Email', value: selectedAppointment.email },
                  { label: 'Phone', value: selectedAppointment.phone || 'Not provided' },
                  { label: 'Appointment Date', value: formatDate(selectedAppointment.appointmentDate) },
                  { label: 'Appointment Time', value: selectedAppointment.appointmentTime },
                  { label: 'Service Type', value: selectedAppointment.serviceType },
                  { label: 'Status', value: <>{getStatusChip(selectedAppointment.status)}</> },
                  { label: 'Created', value: formatDateTime(selectedAppointment.createdAt) },
                  ...(selectedAppointment.adminNotes ? [
                    { label: 'Admin Notes', value: selectedAppointment.adminNotes }
                  ] : [])
                ].map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Typography variant="body2">
                      <strong>{item.label}:</strong> {item.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setViewDialogOpen(false);
              setSelectedAppointment(selectedAppointment);
              setStatus(selectedAppointment.status);
              setAdminNotes(selectedAppointment.adminNotes || '');
              setStatusDialogOpen(true);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* EMAIL LOGS DIALOG */}
      <Dialog 
        open={logsDialogOpen} 
        onClose={() => setLogsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          Email Activity Logs ({emailLogs.length} entries)
          <Button 
            size="small" 
            onClick={fetchEmailLogs}
            sx={{ ml: 2 }}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Recipient</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Content Preview</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Alert severity="info">No email logs yet</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  emailLogs.map((log, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(log.time)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(log.time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.to}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.subject}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.type || 'Unknown'} 
                          size="small" 
                          variant="outlined"
                          color={
                            log.type?.includes('admin') ? 'primary' : 
                            log.type?.includes('client') ? 'success' : 
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.status} 
                          size="small"
                          color={log.status === 'sent' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: 'text.secondary'
                          }}
                        >
                          {log.html ? 
                            log.html.replace(/<[^>]*>/g, ' ').substring(0, 100) + '...' : 
                            'No content'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Export logs functionality can be added here
              window.open(`${API}/api/admin/email-logs/export`, "_blank");

            }}
          >
            Export Logs
          </Button>
        </DialogActions>
      </Dialog>

      {/* CALENDAR SETTINGS DIALOG - SIMPLIFIED WITHOUT DATEPICKER */}
      <Dialog 
        open={calendarDialogOpen} 
        onClose={() => setCalendarDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCalendarDate ? 'Edit Calendar Setting' : 'Add Calendar Setting'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={calendarForm.date}
              onChange={(e) => setCalendarForm({...calendarForm, date: e.target.value})}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={calendarForm.isAvailable}
                  onChange={(e) => setCalendarForm({...calendarForm, isAvailable: e.target.checked})}
                  color="primary"
                />
              }
              label={calendarForm.isAvailable ? 'Available for bookings' : 'Unavailable (blocked)'}
              sx={{ mt: 2, mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Reason (Optional)"
              value={calendarForm.reason}
              onChange={(e) => setCalendarForm({...calendarForm, reason: e.target.value})}
              margin="normal"
              placeholder="e.g., Holiday, Personal day, Special hours..."
              helperText="This reason will be shown to clients if date is unavailable"
            />
            
            <TextField
              fullWidth
              label="Maximum Appointments"
              type="number"
              value={calendarForm.maxAppointments}
              onChange={(e) => setCalendarForm({...calendarForm, maxAppointments: parseInt(e.target.value) || 8})}
              margin="normal"
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              helperText="Maximum number of appointments allowed on this day"
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Custom hours and bulk operations coming soon!
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveCalendarSetting} 
            variant="contained"
            disabled={calendarLoading}
          >
            {calendarLoading ? <CircularProgress size={24} /> : 'Save Setting'}
          </Button>
        </DialogActions>
      </Dialog>

      

{/* PAYMENT DETAILS DIALOG */}
<Dialog 
  open={paymentDialogOpen} 
  onClose={() => setPaymentDialogOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    Payment Details
    {selectedPayment && (
      <Typography variant="body2" color="text.secondary">
        {selectedPayment.clientName} • {formatDate(selectedPayment.createdAt)}
      </Typography>
    )}
  </DialogTitle>
  <DialogContent>
    {selectedPayment && (
      <Box sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Client Name:</strong> {selectedPayment.clientName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedPayment.clientEmail}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Phone:</strong> {selectedPayment.clientPhone}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Amount:</strong> PKR {selectedPayment.amount.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Payment Method:</strong> {getMethodChip(selectedPayment.paymentMethod)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Transaction ID:</strong> {selectedPayment.transactionId}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              <strong>Status:</strong> {getStatusChipForPayment(selectedPayment.status)}
            </Typography>
          </Grid>
          {selectedPayment.verifiedBy && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Verified By:</strong> {selectedPayment.verifiedBy}
              </Typography>
            </Grid>
          )}
          {selectedPayment.verifiedAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Verified At:</strong> {formatDateTime(selectedPayment.verifiedAt)}
              </Typography>
            </Grid>
          )}
          {selectedPayment.verificationNotes && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Verification Notes:</strong> {selectedPayment.verificationNotes}
              </Typography>
            </Grid>
          )}
          {selectedPayment.rejectedReason && (
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Rejection Reason:</strong> {selectedPayment.rejectedReason}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              <strong>Receipt:</strong>
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <img 
                src={selectedPayment.receiptImage} 
                alt="Payment Receipt"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ mt: 2 }}
                onClick={() => window.open(selectedPayment.receiptImage, '_blank')}
              >
                Open in New Tab
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setPaymentDialogOpen(false)}>Close</Button>
    {selectedPayment?.status === 'pending' && (
      <>
        <Button 
          color="error"
          onClick={() => {
            setPaymentDialogOpen(false);
            handleRejectPayment(selectedPayment);
          }}
        >
          Reject
        </Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={() => {
            setPaymentDialogOpen(false);
            handleVerifyPayment(selectedPayment);
          }}
        >
          Verify Payment
        </Button>
      </>
    )}
  </DialogActions>
</Dialog>

{/* VERIFICATION DIALOG */}
<Dialog 
  open={verificationDialogOpen} 
  onClose={() => setVerificationDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Verify Payment
    {selectedPayment && (
      <Typography variant="body2" color="text.secondary">
        {selectedPayment.clientName} • PKR {selectedPayment.amount.toLocaleString()}
      </Typography>
    )}
  </DialogTitle>
  <DialogContent>
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="body2">
        Verifying this payment will:
      </Typography>
      <Typography variant="body2" component="div">
        • Mark payment as <strong>Verified</strong>
      </Typography>
      <Typography variant="body2" component="div">
        • Confirm the appointment
      </Typography>
      <Typography variant="body2" component="div">
        • Send confirmation email to client
      </Typography>
    </Alert>
    
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Verification Notes (Optional)"
      value={verificationNotes}
      onChange={(e) => setVerificationNotes(e.target.value)}
      placeholder="Add any notes for internal reference..."
      helperText="These notes will be saved with the payment record"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setVerificationDialogOpen(false)}>Cancel</Button>
    <Button 
      onClick={confirmVerifyPayment} 
      variant="contained"
      color="success"
      disabled={paymentLoading}
    >
      {paymentLoading ? <CircularProgress size={24} /> : 'Verify Payment'}
    </Button>
  </DialogActions>
</Dialog>

{/* REJECTION DIALOG */}
<Dialog 
  open={rejectionDialogOpen} 
  onClose={() => setRejectionDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Reject Payment
    {selectedPayment && (
      <Typography variant="body2" color="text.secondary">
        {selectedPayment.clientName} • PKR {selectedPayment.amount.toLocaleString()}
      </Typography>
    )}
  </DialogTitle>
  <DialogContent>
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="body2">
        Rejecting this payment will:
      </Typography>
      <Typography variant="body2" component="div">
        • Mark payment as <strong>Rejected</strong>
      </Typography>
      <Typography variant="body2" component="div">
        • Keep appointment on hold
      </Typography>
      <Typography variant="body2" component="div">
        • Send rejection email to client with your reason
      </Typography>
    </Alert>
    
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Rejection Reason *"
      value={rejectionReason}
      onChange={(e) => setRejectionReason(e.target.value)}
      placeholder="Explain why this payment is being rejected..."
      helperText="This reason will be sent to the client"
      required
      error={!rejectionReason.trim() && rejectionDialogOpen}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
    <Button 
      onClick={confirmRejectPayment} 
      variant="contained"
      color="error"
      disabled={paymentLoading || !rejectionReason.trim()}
    >
      {paymentLoading ? <CircularProgress size={24} /> : 'Reject Payment'}
    </Button>
  </DialogActions>
</Dialog>
<Dialog
  open={allAppointmentsOpen}
  onClose={() => setAllAppointmentsOpen(false)}
  maxWidth="lg"
  fullWidth
>
  <DialogTitle>All Appointments</DialogTitle>
  <DialogContent>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell><strong>Client</strong></TableCell>
            <TableCell><strong>Contact</strong></TableCell>
            <TableCell><strong>Date & Time</strong></TableCell>
            <TableCell><strong>Service</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((app) => (
            <TableRow 
              key={app._id} 
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <TableCell>{app.clientName}</TableCell>
              <TableCell>{app.email || app.phone || 'N/A'}</TableCell>
              <TableCell>
                {formatDate(app.appointmentDate)} at {app.appointmentTime}
              </TableCell>
              <TableCell>{app.serviceType}</TableCell>
              <TableCell>{getStatusChip(app.status)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedAppointment(app);
                        setViewDialogOpen(true);
                      }}
                    >
                      <RemoveRedEyeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Update Status">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedAppointment(app);
                        setStatus(app.status);
                        setAdminNotes(app.adminNotes || '');
                        setStatusDialogOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAllAppointmentsOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

<ToastContainer position="top-right" />
    </>
  );
};
// ================= EXPORT WITH ERROR BOUNDARY =================
export default function AdminDashboardWithErrorBoundary() {
  return (
    <DashboardErrorBoundary>
      <AdminDashboard />
    </DashboardErrorBoundary>
  );
}