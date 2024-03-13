// DiscordIcon.js
import React from 'react';
import { SvgIcon } from '@mui/material';
import { ReactComponent as DiscordSvg } from '../images/discord-mark-white.svg'; // Ajusta la ruta según sea necesario

const DiscordIcon = (props) => (
  <SvgIcon {...props}>
    <DiscordSvg />
  </SvgIcon>
);

export default DiscordIcon;
