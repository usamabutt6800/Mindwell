import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  ArrowBack, 
  Email as EmailIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle,
  Cancel,
  AccessTime,
  FilterList,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_DOMAIN } from '../config';

const AdminEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, failed
  const navigate = useNavigate();
  const toastId = useRef(null);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    const token = sessionStorage.getItem('adminToken');
    if (!isAdmin || !token) {
      navigate('/admin/login');
      return;
    }
    
    fetchLogs();
    
    // Clean up toast on unmount
    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, []);

  // Filter logs based on search and filter
  useEffect(() => {
    let result = logs;
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(log => log.status === filter);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(log => 
        (log.to && log.to.toLowerCase().includes(searchLower)) ||
        (log.subject && log.subject.toLowerCase().includes(searchLower)) ||
        (log.type && log.type.toLowerCase().includes(searchLower)) ||
        (log.html && log.html.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredLogs(result);
  }, [logs, search, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      toastId.current = toast.loading('Loading email logs...', { autoClose: false });
      
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`${API_DOMAIN}/api/admin/email-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const sortedLogs = (data.logs || []).sort((a, b) => 
          new Date(b.time || b.timestamp) - new Date(a.time || a.timestamp)
        );
        
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
        
        toast.update(toastId.current, {
          render: `Loaded ${sortedLogs.length} email logs`,
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        throw new Error(data.error || 'Failed to load logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message);
      setLogs([]);
      setFilteredLogs([]);
      
      toast.update(toastId.current, {
        render: `Error: ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (type) => {
    if (!type) return 'default';
    
    switch(type.toLowerCase()) {
      case 'appointment_client': 
      case 'appointment_booking': 
        return 'primary';
      case 'appointment_status': 
      case 'status_update': 
      case 'appointment_admin':
        return 'success';
      case 'contact_reply': 
      case 'contact_form': 
      case 'contact_client':
      case 'contact_admin':
        return 'info';
      case 'test': 
        return 'warning';
      default: 
        return 'default';
    }
  };

  const formatType = (type) => {
    if (!type) return 'Unknown';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Client', ' (Client)')
      .replace('Admin', ' (Admin)');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getContentPreview = (html) => {
    if (!html) return 'No content';
    
    // Remove HTML tags and limit length
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  };

  const handleExportLogs = () => {
    try {
      const csvContent = [
        ['Time', 'Recipient', 'Subject', 'Type', 'Status', 'Content Preview'],
        ...filteredLogs.map(log => [
          formatDateTime(log.time || log.timestamp),
          log.to || 'N/A',
          log.subject || 'No subject',
          formatType(log.type),
          log.status || 'unknown',
          getContentPreview(log.html || log.content)
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export logs');
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/dashboard')} size="large">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Email Activity Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track all email communications and delivery status
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            disabled={loading}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportLogs}
            disabled={filteredLogs.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 200, borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">Total Emails</Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>{logs.length}</Typography>
        </Paper>
        
        <Paper sx={{ p: 3, flex: 1, minWidth: 200, borderRadius: 3, bgcolor: '#E8F5E9' }}>
          <Typography variant="h6" color="text.secondary">Sent Successfully</Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#2E7D32' }}>
            {logs.filter(log => log.status === 'sent').length}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 3, flex: 1, minWidth: 200, borderRadius: 3, bgcolor: '#FFEBEE' }}>
          <Typography variant="h6" color="text.secondary">Failed</Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#D32F2F' }}>
            {logs.filter(log => log.status === 'failed').length}
          </Typography>
        </Paper>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search emails by recipient, subject, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FilterList color="action" />
            <Chip
              label="All"
              onClick={() => setFilter('all')}
              color={filter === 'all' ? 'primary' : 'default'}
              variant={filter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Sent"
              onClick={() => setFilter('sent')}
              color={filter === 'sent' ? 'success' : 'default'}
              variant={filter === 'sent' ? 'filled' : 'outlined'}
              icon={<CheckCircle fontSize="small" />}
            />
            <Chip
              label="Failed"
              onClick={() => setFilter('failed')}
              color={filter === 'failed' ? 'error' : 'default'}
              variant={filter === 'failed' ? 'filled' : 'outlined'}
              icon={<Cancel fontSize="small" />}
            />
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            size="small" 
            onClick={fetchLogs}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Logs Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Showing {filteredLogs.length} of {logs.length} email logs
            {search && ` for "${search}"`}
            {filter !== 'all' && ` (${filter} only)`}
          </Typography>
        </Box>

        {filteredLogs.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No email logs found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {search || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Try booking an appointment or sending a contact form to generate logs'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Recipient</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Content Preview</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDateTime(log.time || log.timestamp)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime fontSize="inherit" />
                          {formatTime(log.time || log.timestamp)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {log.to || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.subject || 'No subject'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatType(log.type)}
                        color={getStatusColor(log.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={log.status === 'sent' ? <CheckCircle /> : <Cancel />}
                        label={log.status || 'unknown'}
                        color={log.status === 'sent' ? 'success' : 'error'}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem'
                        }}
                        title={getContentPreview(log.html || log.content)}
                      >
                        {getContentPreview(log.html || log.content)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Footer Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Email logs track all outgoing communications. 
          Logs are stored in the database and persist until deleted.
          Successful deliveries show "sent", while failed attempts show "failed" with error details.
        </Typography>
      </Alert>
    </Container>
  );
};

export default AdminEmailLogs;