import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  Groups as GroupsIcon,
  FamilyRestroom as FamilyIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const Services = () => {
  const services = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Individual Therapy',
      description: 'One-on-one sessions tailored to your personal needs',
      details: [
        'Anxiety and stress management',
        'Depression and mood disorders',
        'Trauma and PTSD',
        'Self-esteem and personal growth',
        'Life transitions and adjustment',
      ],
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Couples Counseling',
      description: 'Strengthen your relationship and improve communication',
      details: [
        'Communication skills building',
        'Conflict resolution',
        'Trust and intimacy issues',
        'Pre-marital counseling',
        'Separation and divorce support',
      ],
    },
    {
      icon: <FamilyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Family Therapy',
      description: 'Support for families facing challenges together',
      details: [
        'Parent-child relationship issues',
        'Blended family adjustments',
        'Family conflict resolution',
        'Grief and loss support',
        'Family transition support',
      ],
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'Adolescent Therapy',
      description: 'Specialized support for teenagers and young adults',
      details: [
        'Academic stress and pressure',
        'Social anxiety and peer relationships',
        'Identity and self-discovery',
        'Behavioral issues',
        'College transition support',
      ],
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Group Therapy',
      description: 'Share and learn in a supportive group environment',
      details: [
        'Anxiety support groups',
        'Stress management workshops',
        'Mindfulness and meditation groups',
        'Social skills development',
        'Support for specific populations',
      ],
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Psychological Assessment',
      description: 'Comprehensive evaluation and diagnosis',
      details: [
        'Diagnostic assessments',
        'Learning disability evaluations',
        'ADHD and attention assessments',
        'Personality assessments',
        'Career and vocational testing',
      ],
    },
  ];

  const approaches = [
    'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)',
    'Acceptance and Commitment Therapy (ACT)',
    'Mindfulness-Based Therapy',
    'Solution-Focused Therapy',
    'Trauma-Informed Care',
    'Person-Centered Therapy',
  ];

  return (
    <>
      <Helmet>
        <title>Our Services | MindWell Psychology</title>
        <meta 
          name="description" 
          content="Professional therapy services including individual, couples, family, and adolescent therapy. Evidence-based approaches for mental wellness." 
        />
      </Helmet>

      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Our Services
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              Comprehensive mental health services tailored to meet your unique needs
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
              We offer evidence-based therapeutic approaches in a compassionate, confidential environment. 
              Each treatment plan is customized to help you achieve your personal goals.
            </Typography>
          </Box>

          {/* Services Grid */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {services.map((service, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      {service.icon}
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>
                        {service.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                      {service.description}
                    </Typography>
                    
                    <List dense>
                      {service.details.map((detail, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText primary={detail} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Therapeutic Approaches */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 4 }}>
              Our Therapeutic Approaches
            </Typography>
            
            <Grid container spacing={3}>
              {approaches.map((approach, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                  }}>
                    <CheckIcon sx={{ color: 'primary.main', mr: 2 }} />
                    <Typography variant="body1">{approach}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Process Section */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Our Process
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                    1. Initial Consultation
                  </Typography>
                  <Typography variant="body1">
                    We begin with a comprehensive assessment to understand your concerns, 
                    history, and goals for therapy.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                    2. Personalized Plan
                  </Typography>
                  <Typography variant="body1">
                    Based on your assessment, we develop a customized treatment plan 
                    using evidence-based approaches.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>
                    3. Ongoing Support
                  </Typography>
                  <Typography variant="body1">
                    Regular sessions with progress monitoring and adjustments 
                    to ensure you're meeting your goals.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Services;