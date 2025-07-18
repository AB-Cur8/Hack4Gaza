// lib/patientService.ts
import { supabase } from "./supabase";

export async function savePatient(patient: any) {
  const { error } = await supabase.from("patients").upsert([
    {
      patientId: patient.patientId,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      summary: patient.summary || "",
      deviceId: patient.deviceId || "unknown",
      language: patient.language || "en",
      lastUpdated: new Date().toISOString(),
      distributedVersion: patient.distributedVersion || 1,
      timestamp: patient.timestamp || new Date().toISOString(),
      changeLog: JSON.stringify(patient.changeLog || []),
      assessment: JSON.stringify(patient.assessment),
    },
  ]);

  if (error) {
    console.error("❌ Error saving to Supabase:", error.message);
  }
}

export async function getPatientById(patientId: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("patientId", patientId)
    .single(); // ensures only one result

  if (error) {
    console.error("❌ Error fetching patient by ID:", error.message);
    return null;
  }

  return {
    ...data,
    changeLog: JSON.parse(data.changeLog || "[]"),
    assessment: JSON.parse(data.assessment || "{}"),
  };
}

export async function fetchPatients() {
  const { data, error } = await supabase.from("patients").select("*");
  if (error) {
    console.error("❌ Error loading patients:", error.message);
    return [];
  }

  return data.map((p) => ({
    ...p,
    changeLog: JSON.parse(p.changeLog || "[]"),
    assessment: JSON.parse(p.assessment || "{}"),
  }));
}
