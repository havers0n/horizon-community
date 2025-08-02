import React from 'react';
import { InterfaceEmbed } from '@/components/InterfaceEmbed';
import { useLocation } from 'wouter';

export default function MDT() {
  const [, setLocation] = useLocation();

  const handleClose = () => {
    setLocation('/');
  };

  return <InterfaceEmbed type="mdt" onClose={handleClose} />;
} 