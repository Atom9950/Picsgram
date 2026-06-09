import React from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

// Mapping from app icon names → Feather icon names
const iconMap = {
  home: 'home',
  mail: 'mail',
  lock: 'lock',
  user: 'user',
  plus: 'plus',
  search: 'search',
  location: 'map-pin',
  call: 'phone',
  camera: 'camera',
  edit: 'edit-2',
  arrowLeft: 'arrow-left',
  threeDotsCircle: 'more-horizontal',
  threeDotsHorizontal: 'more-horizontal',
  comment: 'message-circle',
  share: 'share-2',
  send: 'send',
  delete: 'trash-2',
  logout: 'log-out',
  image: 'image',
  video: 'video',
  eye: 'eye',
  eyeOff: 'eye-off',
};

const Icon = ({ name, size = 22, color, fill, strokeWidth, ...props }) => {
  const resolvedColor = color || theme.colors.textLight;

  // Heart icon: Ionicons has reliable heart / heart-outline
  if (name === 'heart') {
    const isFilled = fill && fill !== 'transparent';
    return (
      <Ionicons
        name={isFilled ? 'heart' : 'heart-outline'}
        size={size}
        color={isFilled ? (color || theme.colors.heart) : resolvedColor}
        {...props}
      />
    );
  }

  const iconName = iconMap[name] || name;
  return (
    <Feather
      name={iconName}
      size={size}
      color={resolvedColor}
      {...props}
    />
  );
};

export default Icon;