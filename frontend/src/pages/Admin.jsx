import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Admin = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`);
      setAppointments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | Appointments</title>
      </Helmet>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1976d2', marginBottom: '2rem' }}>Appointments Admin</h1>
        
        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div>
            <p>Total appointments: {appointments.length}</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                marginTop: '1rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '12px' }}>{appointment.name}</td>
                      <td style={{ padding: '12px' }}>{appointment.email}</td>
                      <td style={{ padding: '12px' }}>{appointment.phone}</td>
                      <td style={{ padding: '12px' }}>{appointment.date}</td>
                      <td style={{ padding: '12px' }}>{appointment.time}</td>
                      <td style={{ padding: '12px' }}>{appointment.service}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: appointment.status === 'pending' ? '#ff9800' : '#4caf50',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Show raw JSON data */}
            <details style={{ marginTop: '2rem' }}>
              <summary>View Raw Data (for debugging)</summary>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '1rem', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(appointments, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;