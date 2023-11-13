import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

const photos = [
  { id: 1, url: 'https://loremflickr.com/640/360', name: 'Animals', desc: 'description 1' },
  { id: 2, url: 'https://loremflickr.com/640/360', name: 'Architecture', desc: 'description 2' },
  { id: 3, url: 'https://loremflickr.com/640/360', name: 'Nature', desc: 'description 3' },
  { id: 4, url: 'https://loremflickr.com/640/360', name: 'People', desc: 'description 4' },
  { id: 5, url: 'https://loremflickr.com/640/360', name: 'Tech', desc: 'description 5' }
]

const Dummy = () => {
  return (
    <Box>
      <Grid container spacing={2}>
        {
          photos.map(photo => {
            return (
              <Grid key={photo.id} item xs={3}>
                <Card>
                  <CardMedia
                    component="img"
                    height="240"
                    image={photo.url}
                    alt={photo.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {photo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {photo.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        }
      </Grid>
    </Box>
  );
}
export default Dummy;

