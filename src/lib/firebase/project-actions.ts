
'use server';

import { doc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db, auth } from './config';
import type { Project, ProjectStatus } from '@/app/dashboard/proyectos/page';
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
  const currentUser = auth.currentUser;
  if (!currentUser) {
      return { success: false, error: "Usuario no autenticado." };
  }
  const ownerId = currentUser.uid;

  try {
    const docRef = await addDoc(collection(db, 'projects'), {
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
