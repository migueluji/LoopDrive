// FeaturesSection.js
import React from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, useTheme } from '@mui/material';
import intuitiveImage from '../images/intuitive.png';
import flexibleImage from '../images/flexible.png';
import powerfulImage from '../images/powerful.png';

const featuresData = [
  {
    title: 'Intuitive',
    description: 'An easy-to-use interface that allows you to quickly create games without complications.',
    imageUrl: intuitiveImage, // Make sure to replace this with the actual path of your image
  },
  {
    title: 'Flexible',
    description: 'Supports a wide variety of game types, allowing you to bring your ideas to life.',
    imageUrl: flexibleImage,
  },
  {
    title: 'Powerful',
    description: 'Capable of handling complex projects and delivering impressive results.',
    imageUrl: powerfulImage,
  },
];

const FeaturesSection = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, mt: 8, bgcolor: theme.palette.background.default }}>
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
        Key Features
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {featuresData.map((feature, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ maxWidth: 345, m: 'auto' }}>
              <CardMedia
                component="img"
                height="345"
                image={feature.imageUrl}
                alt={feature.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturesSection;
