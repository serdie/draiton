
import { session } from 'next-firebase-auth-edge/lib/auth';
import { authConfig } from '@/config/auth-config';

export const { GET, POST, DELETE } = session(authConfig);
