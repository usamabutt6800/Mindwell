import React from 'react';
import { Helmet } from 'react-helmet';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | MindWell Psychology</title>
      </Helmet>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#1976d2', marginBottom: '1rem' }}>About Our Practice</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          Welcome to MindWell Psychology, where we provide professional clinical psychology 
          services with compassion and evidence-based care.
        </p>
        
        <h2 style={{ color: '#1976d2', marginTop: '2rem' }}>Our Approach</h2>
        <p style={{ lineHeight: '1.6' }}>
          We believe in creating a safe, non-judgmental space where clients can explore 
          their thoughts, feelings, and behaviors. Our therapeutic approach is tailored 
          to each individual's unique needs and goals.
        </p>
        
        <h2 style={{ color: '#1976d2', marginTop: '2rem' }}>Qualifications</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>Master's Degree in Clinical Psychology</li>
          <li>Licensed Clinical Psychologist</li>
          <li>5+ Years of Clinical Experience</li>
          <li>Specialized Training in Evidence-Based Therapies</li>
        </ul>
      </div>
    </>
  );
};

export default About;