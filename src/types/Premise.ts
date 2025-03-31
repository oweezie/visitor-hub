
/*
 * Unified Premise Type Definition
 * This interface defines the structure of a Premise used across the project.
 * Ensure that the `id` field is always treated as a string when passing to APIs.
 */

export interface Premise {
  id: string;
  name: string;
  address: string;
  qr_code?: string;
  qr_code_url?: string;
  current_visitors?: number;
  created_at?: string;
  updated_at?: string;
  capacity?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}
