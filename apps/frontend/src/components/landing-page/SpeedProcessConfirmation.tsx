import Image from 'next/image';

export function SpeedProcessConfirmation() {
  const steps = [
    { 
      icon: '/clock48.png', 
      text: 'ONE minute registration',
      label: '60'
    },
    { 
      icon: '/1h64.png', 
      text: 'ONE hour confirmed',
      label: '1h'
    },
    { 
      icon: '/day1.png', 
      text: 'Covered in ONE day',
      label: 'Day1'
    },
  ];

  return null;
}
