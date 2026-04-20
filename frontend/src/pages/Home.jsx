import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Home | MindWell Psychology</title>
      </Helmet>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', color: '#1976d2', marginBottom: '1rem' }}>
            Welcome to MindWell Psychology
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            Professional clinical psychology services for individuals, couples, and families. 
            Evidence-based therapy in a supportive, confidential environment.
          </p>
          <Link to="/appointment" style={{
            display: 'inline-block',
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            marginTop: '2rem',
            fontWeight: 'bold'
          }}>
            Schedule Your First Session
          </Link>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1976d2' }}>Individual Therapy</h3>
            <p>One-on-one sessions tailored to your personal needs and goals.</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1976d2' }}>Couples Counseling</h3>
            <p>Improve communication and strengthen your relationship.</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#1976d2' }}>Family Therapy</h3>
            <p>Support for families facing challenges and transitions.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;