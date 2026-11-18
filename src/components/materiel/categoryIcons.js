import React from 'react';
import { createSvgIcon } from '@material-ui/core/utils';
import VideocamIcon from '@material-ui/icons/Videocam';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import MicIcon from '@material-ui/icons/Mic';
import TvIcon from '@material-ui/icons/Tv';
import CategoryIcon from '@material-ui/icons/Category';
import { normalize } from './materielUtils';

// Custom icons drawn on the same 24×24 grid as Material icons (MUI has no tripod or grip/crane icon).

/** Tripod: head plate, centre column, three legs and a spreader. */
export const TripodIcon = createSvgIcon(
  <path d="M7.5 2h9v3h-9zM10.8 5h2.4v4h-2.4zM10.1 9h2.2L6.4 22H4zM11.7 9h2.2L20 22h-2.4zM11 9h2v13h-2zM6.6 15h10.8v2H6.6z" />,
  'Tripod'
);

/** Camera crane (jib): feet, column, arm with a camera at the tip and a counterweight. */
export const CraneIcon = createSvgIcon(
  <path d="M2.5 20h8v2h-8zM5.4 10.5h2.2V20H5.4zM1.8 10.9 20.2 4.6l.7 2L2.5 12.9zM17.2 6.6h5v4.4h-5zM.8 11.2h3.6V15H.8z" />,
  'Crane'
);

const ICONS = {
  Image: VideocamIcon,
  Lumiere: WbIncandescentIcon,
  Son: MicIcon,
  Moniteur: TvIcon,
  Trepieds: TripodIcon,
  Machinerie: CraneIcon,
  Autres: CategoryIcon,
};

/** Icon component for a category value ("Image", "lumiere"…), case/accent-insensitive. */
export const iconForCategory = (categorie) => {
  const key = Object.keys(ICONS).find((k) => normalize(k) === normalize(categorie));
  return ICONS[key] || CategoryIcon;
};
