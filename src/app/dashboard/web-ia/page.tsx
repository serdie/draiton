
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';

export default function WebIAPage() {
  return (
    <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />
  );
}
