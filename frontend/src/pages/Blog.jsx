import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Anxiety: Symptoms and Coping Strategies',
      excerpt: 'Learn about common anxiety symptoms and effective evidence-based coping strategies to manage daily stress.',
      category: 'Anxiety',
      readTime: '5 min read',
      date: 'December 15, 2024',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800',
    },
    {
      id: 2,
      title: 'The Importance of Self-Care for Mental Health',
      excerpt: 'Discover why self-care is essential for mental wellness and practical ways to incorporate it into your daily routine.',
      category: 'Self-Care',
      readTime: '4 min read',
      date: 'December 10, 2024',
      image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800',
    },
    {
      id: 3,
      title: 'Improving Communication in Relationships',
      excerpt: 'Effective communication techniques to strengthen your relationships and resolve conflicts constructively.',
      category: 'Relationships',
      readTime: '6 min read',
      date: 'December 5, 2024',
      image: 'https://images.unsplash.com/photo-1519508237983-4f2f36f1c3b4?auto=format&fit=crop&w=800',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Mental Health Blog | MindWell Psychology</title>
        <meta 
          name="description" 
          content="Articles and resources about mental health, therapy, anxiety, depression, relationships, and self-care." 
        />
      </Helmet>

      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <PsychologyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              Mental Health Blog
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              Evidence-based articles and resources to support your mental wellness journey
            </Typography>
          </Box>

          {/* Blog Posts Grid */}
          <Grid container spacing={4}>
            {blogPosts.map((post) => (
              <Grid item xs={12} md={6} lg={4} key={post.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={post.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {post.readTime}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {post.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {post.excerpt}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.date}
                      </Typography>
                      
                      <Button 
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        Read More →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Coming Soon Message */}
          <Box sx={{ textAlign: 'center', mt: 8, p: 4, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              More Articles Coming Soon!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're regularly adding new articles about mental health, therapy techniques, and wellness strategies.
              Check back often for updates!
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Blog;