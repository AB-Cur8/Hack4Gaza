// app/patient/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPatientById } from "@/lib/patientService"; // you must create this

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    getPatientById(patientId)
      .then((data) => setPatient(data))
      .catch((err) => console.error("❌ Failed to load patient", err))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!patient)
    return <div className="p-4 text-red-500">Patient not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Patient Record</h1>
      <p>
        <strong>ID:</strong> {patient.patient_id}
      </p>
      <p>
        <strong>Name:</strong> {patient.name}
      </p>
      <p>
        <strong>Age:</strong> {patient.age}
      </p>
      <p>
        <strong>Gender:</strong> {patient.gender}
      </p>
      <p>
        <strong>GCS:</strong> {patient.gcs}
      </p>
      <p>
        <strong>Heart Rate:</strong> {patient.heart_rate}
      </p>
      <p>
        <strong>BP:</strong> {patient.blood_pressure}
      </p>
      <p>
        <strong>RR:</strong> {patient.respiratory_rate}
      </p>
      <p>
        <strong>Outcome:</strong> {patient.outcome}
      </p>
      <p>
        <strong>Notes:</strong> {patient.outcome_notes}
      </p>
      <p className="text-sm text-gray-600 mt-4">
        Last updated: {new Date(patient.last_updated).toLocaleString()}
      </p>
    </div>
  );
}
