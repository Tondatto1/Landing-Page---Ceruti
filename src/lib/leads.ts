export interface TrialLead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  agentSelected?: string;
  createdAt: string;
}

const STORAGE_KEY = 'agro_sales_trial_leads';
const ENCRYPTION_KEY = 'agro_sales_secure_key_132_p@ss';
export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1mekI4F0gUVoWxsPkGasck14KmW-SKnRE0iLibr4DeCU/edit?gid=0#gid=0';
export const GOOGLE_APPS_SCRIPT_WEBHOOK = 
  (import.meta as any).env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbwM5DQYjIMAft7TGdzmr80Uo6yXqIGARWVXZBRCia9tW2gKcIs2uSjbrRa3HGYDaXtKgQ/exec';

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
 * Saves a trial lead to local storage (for offline access/export)
 * and dispatches it to the Google Sheets webhook via /api/save-lead.
 */
export async function saveLead(
  name: string,
  company: string,
  email: string,
  phone: string,
  agentSelected: string = 'Ceruti Campo'
): Promise<TrialLead> {
  const newLead: TrialLead = {
    id: 'lead_' + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    company: (company || '').trim(),
    email: (email || '').trim().toLowerCase(),
    phone: phone.trim(),
    agentSelected: (agentSelected || 'Ceruti Campo').trim(),
    createdAt: new Date().toISOString()
  };

  // 1. Write to localStorage immediately with secure encryption
  try {
    const existing = getLocalLeads();
    // Avoid duplicate insertions if called multiple times rapidly
    const isDuplicate = existing.some(
      l => l.phone === newLead.phone && (Date.now() - new Date(l.createdAt).getTime()) < 60000
    );
    if (!isDuplicate) {
      existing.unshift(newLead);
      localStorage.setItem(STORAGE_KEY, encryptData(JSON.stringify(existing)));
    }
  } catch (error) {
    console.error('Error saving lead locally:', error);
  }

  const payload = {
    dataHora: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    nome: newLead.name,
    empresa: newLead.company,
    email: newLead.email,
    whatsapp: newLead.phone,
    agente: newLead.agentSelected,
    origem: 'Trial 7 Dias - WhatsApp LP',
    timestamp: newLead.createdAt
  };

  // 2. Direct client-side POST to Google Apps Script Web App (Works 100% on GitHub Pages, Vercel, Netlify)
  try {
    fetch(GOOGLE_APPS_SCRIPT_WEBHOOK, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn('[Leads] Client direct webhook sync warning:', err);
    });
  } catch (err) {
    console.warn('[Leads] Direct fetch error:', err);
  }

  // 3. Fallback / Parallel sync via Node.js server route (if running in full-stack dev/Cloud Run)
  try {
    fetch('/api/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newLead.name,
        company: newLead.company,
        email: newLead.email,
        phone: newLead.phone,
        agentSelected: newLead.agentSelected,
        origin: 'Trial 7 Dias - WhatsApp LP'
      }),
    }).catch(() => {
      // Expected to fail silently on static GitHub Pages hosting
    });
  } catch {
    // ignore
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
 * Backwards compatible alias for fetching leads.
 */
export async function fetchFirestoreLeads(): Promise<TrialLead[]> {
  return getLocalLeads();
}

/**
 * Deletes a lead record locally.
 */
export async function deleteLeadWithFirestore(id: string): Promise<void> {
  deleteLead(id);
}

/**
 * Deletes a lead from local storage.
 */
export function deleteLead(id: string): void {
  try {
    const leads = getLocalLeads();
    const updated = leads.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, encryptData(JSON.stringify(updated)));
  } catch (err) {
    console.error('Error deleting lead locally:', err);
  }
}

/**
 * Generates an Excel-friendly CSV export.
 */
export function downloadLeadsCSV(leads: TrialLead[]): void {
  if (!leads || leads.length === 0) {
    alert('Nenhum cadastro encontrado para exportar.');
    return;
  }

  const csvHeaders = ['ID', 'Nome Completo', 'Empresa', 'E-mail', 'WhatsApp', 'Agente Selecionado', 'Data de Cadastro'];
  
  const csvRows = leads.map(l => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${(l.agentSelected || '').replace(/"/g, '""')}"`,
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
  link.setAttribute('download', `leads_teste_7_dias_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

