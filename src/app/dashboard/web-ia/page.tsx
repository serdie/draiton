
'use client';

import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';

export default function WebIAPage() {
  return <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />;
}
