import tikTokImage from '../images/tic-toc.png';
import React from 'react';
import { Box, Grid, Link, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import DiscordIcon from './DiscordIcon'; // Asegúrate de ajustar la ruta de importación según sea necesario

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        ...theme.customStyles.footer,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        py: 2,
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" gutterBottom>
            Social
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="YouTube">
              <IconButton color="inherit" component="a" href="https://youtube.com">
                <YouTubeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Discord">
              <IconButton color="inherit" component="a" href="https://discord.com">
                <DiscordIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Instagram">
              <IconButton color="inherit" component="a" href="https://instagram.com">
                <InstagramIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="TikTok">
              <IconButton color="inherit" component="a" href="https://tiktok.com">
                <img src={tikTokImage} alt="TikTok" style={{ width: 21, height: 21 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Facebook">
              <IconButton color="inherit" component="a" href="https://facebook.com">
                <FacebookIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="subtitle1" gutterBottom>
            Copyright © {currentYear} Loop Game Engine
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', gap: 1 }}>
            <Link href="#" color="inherit" sx={{ textDecoration: 'none' }}>Legal</Link>
            |
            <Link href="#" color="inherit" sx={{ textDecoration: 'none' }}>Privacy Policy</Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;






