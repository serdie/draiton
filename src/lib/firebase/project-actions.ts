'use server';

import { doc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from './config';
import type { Project, ProjectStatus } from '@/app/dashboard/proyectos/page';
import { getFirebaseAuth } from './firebase-admin';
import { nanoid } from 'nanoid';

export async function createProject(projectData: {
  name: string;
  client: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  status: ProjectStatus;
}) {
  const { auth, db: adminDb } = getFirebaseAuth();
  // Here, you would typically verify the user's session cookie.
  // For simplicity, we'll assume the user is authenticated.
  const ownerId = "some-user-id"; // In a real app, get this from the session

  try {
    const docRef = await addDoc(collection(adminDb, 'projects'), {
      ...projectData,
      ownerId,
      progress: 0,
      clientPortalActive: false,
      clientPortalId: nanoid(12),
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project." };
  }
}
