// lib/patientService.ts
import { supabase } from "./supabase";

// 🔹 Save or update a patient
export async function savePatient(data: any) {
  const {
    patientId,
    name,
    age,
    gender,
    gcs,
    heartRate,
    bloodPressure,
    respiratoryRate,
    outcome,
    outcomeNotes,
    lastUpdatedBy,
    deviceId,
    version,
    assessment,
  } = data;

  const { error } = await supabase.from("patients").upsert([
    {
      patient_id: patientId,
      name,
      age,
      gender,
      gcs,
      heart_rate: heartRate,
      blood_pressure: bloodPressure,
      respiratory_rate: respiratoryRate,
      outcome,
      outcome_notes: outcomeNotes,
      last_updated_by: lastUpdatedBy,
      device_id: deviceId,
      version,
      assessment: JSON.stringify(assessment), // ✅ must be stringified
      last_updated: new Date(),
    },
  ]);

  if (error) throw error;
}

// 🔹 Get a patient by ID
export async function getPatientById(patientId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("patient_id", patientId)
    .single();

  if (error) throw error;
  return data;
}
