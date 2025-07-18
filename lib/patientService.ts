// lib/patientService.ts
import { supabase } from "./supabase";

// 🔹 Save or update a patient
export async function savePatient(data: any) {
  const { data: inserted, error } = await supabase
    .from("patients")
    .upsert([{ ...data, last_updated: new Date() }]);

  if (error) throw error;
  return inserted;
}

// 🔹 Get patient by ID
export async function getPatientById(patientId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  if (error) throw error;
  return data;
}
