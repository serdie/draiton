
'use client';

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function OutlookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('h-6 w-6', props.className)}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7 11.5c0 .83-.67 1.5-1.5 1.5h-11C5.67 15 5 14.33 5 13.5v-3C5 9.67 5.67 9 6.5 9h11c.83 0 1.5.67 1.5 1.5v3z" fill="#0078D4"/>
      <path d="M10.5 14h-4c-.28 0-.5-.22-.5-.5v-3c0-.28.22-.5.5-.5h4c.28 0 .5.22.5.5v3c0 .28-.22.5-.5.5zm8-4.5c0-.83-.67-1.5-1.5-1.5H13v4h4.5c.83 0 1.5-.67 1.5-1.5v-1z" fill="#fff"/>
    </svg>
  );
}
