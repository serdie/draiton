
'use client';

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-4 w-4", props.className)}
      {...props}
    >
      <title>Google</title>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.73 1.9-3.41 0-6.18-2.8-6.18-6.18s2.77-6.18 6.18-6.18c1.93 0 3.25.78 4.23 1.7l2.06-2.06C18.12 2.66 15.61 1.53 12.48 1.53c-5.18 0-9.42 4.13-9.42 9.19s4.24 9.19 9.42 9.19c5.18 0 9.42-4.13 9.42-9.19 0-.82-.07-1.62-.2-2.38z"
        fill="#4285F4"
      />
    </svg>
  );
}
