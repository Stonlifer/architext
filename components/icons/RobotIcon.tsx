
import React from 'react';

export const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M20 11v-2a2 2 0 0 0-2-2h-4"></path>
    <path d="M4 11v-2a2 2 0 0 1 2-2h4"></path>
    <line x1="8" y1="16" x2="8.01" y2="16"></line>
    <line x1="16" y1="16" x2="16.01" y2="16"></line>
  </svg>
);
