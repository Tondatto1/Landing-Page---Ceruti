import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface TrialLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

const STORAGE_KEY = 'agro_sales_trial_leads';
const ENCRYPTION_KEY = 'agro_sales_secure_key_132_p@ss';

/**
 * Encrypts clear text into an obfuscated XOR base64 format to hide lead data from inspection
 */
export function encryptData(data: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i);
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    const encryptedChar = charCode ^ keyChar;
    result += String.fromCharCode(encryptedChar);
  }
  return btoa(encodeURIComponent(result));
}

/**
 * Decrypts obfuscated XOR base64 ciphertext back to clear text
 */
export function decryptData(cipherText: string): string {
  try {
    if (!cipherText) return '';
    const trimmed = cipherText.trim();
    // Supporting raw plaintext JSON for legacy/backwards compatibility
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      return cipherText;
    }
    const rawData = decodeURIComponent(atob(trimmed));
    let result = '';
    for (let i = 0; i < rawData.length; i++) {
      const charCode = rawData.charCodeAt(i);
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const decryptedChar = charCode ^ keyChar;
      result += String.fromCharCode(decryptedChar);
    }
    return result;
  } catch (error) {
    console.warn('Fallback: local decryption failed, returned raw string');
    return cipherText;
  }
}

/**
 * Saves a trial lead to both local storage (for high availability/resilience)
 * and to Firestore (as the centralized cloud database).
 */
export async function saveLead(name: string, email: string, phone: string): Promise<TrialLead> {
  const newLead: TrialLead = {
    id: 'lead_' + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    createdAt: new Date().toISOString()
  };

  // 1. Write to localStorage immediately with secure encryption
  try {
    const existing = getLocalLeads();
    existing.unshift(newLead);
    localStorage.setItem(STORAGE_KEY, encryptData(JSON.stringify(existing)));
  } catch (error) {
    console.error('Error saving lead locally:', error);
  }

  // 2. Write to Firestore centralized collection
  const path = 'trial_signups';
  try {
    await setDoc(doc(db, path, newLead.id), {
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      createdAt: newLead.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${newLead.id}`);
  }

  return newLead;
}

/**
 * Returns leads from localStorage.
 */
export function getLocalLeads(): TrialLead[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const decrypted = decryptData(stored);
    return decrypted ? JSON.parse(decrypted) : [];
  } catch (error) {
    console.error('Error retrieving local leads:', error);
    return [];
  }
}

/**
 * Backwards compatibility alias for getLocalLeads.
 */
export function getLeads(): TrialLead[] {
  return getLocalLeads();
}

/**
 * Fetches all leads from the cloud Firestore database.
 * This runs securely client-side once authenticated as the bootstrapped admin.
 */
export async function fetchFirestoreLeads(): Promise<TrialLead[]> {
  const path = 'trial_signups';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const leads: TrialLead[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      leads.push({
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        createdAt: data.createdAt || ''
      });
    });
    return leads;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Deletes a lead records both locally and on the Firestore server.
 */
export async function deleteLeadWithFirestore(id: string): Promise<void> {
  // Local deletion
  try {
    const leads = getLocalLeads();
    const updated = leads.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, encryptData(JSON.stringify(updated)));
  } catch (err) {
    console.error('Error deleting lead locally:', err);
  }

  // Firestore deletion
  const path = `trial_signups/${id}`;
  try {
    await deleteDoc(doc(db, 'trial_signups', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Backwards compatibility alias for deletion.
 */
export function deleteLead(id: string): void {
  deleteLeadWithFirestore(id).catch(err => {
    console.error("Failed to delete lead from Firestore:", err);
  });
}

/**
 * Generates an Excel-friendly CSV export.
 */
export function downloadLeadsCSV(leads: TrialLead[]): void {
  if (!leads || leads.length === 0) {
    alert('Nenhum cadastro encontrado para exportar.');
    return;
  }

  const csvHeaders = ['ID', 'Nome Completo', 'E-mail', 'WhatsApp', 'Data de Cadastro'];
  
  const csvRows = leads.map(l => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    new Date(l.createdAt).toLocaleString('pt-BR')
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Add UTF-8 BOM representation for correct Excel encoding of Latin/special accents
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_teste_3_dias_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
