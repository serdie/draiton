
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebIAPage() {
  const { isPro } = useContext(AuthContext);

  return (
    <div className={cn("space-y-6")}>
      <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />
    </div>
  );
}
