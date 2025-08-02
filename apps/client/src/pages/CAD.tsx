import React from 'react';
import { InterfaceEmbed } from '@/components/InterfaceEmbed';
import { useLocation } from 'wouter';

export default function CAD() {
  const [, setLocation] = useLocation();

  const handleClose = () => {
    setLocation('/');
  };

  return <InterfaceEmbed type="cad" onClose={handleClose} />;
} 