"use client";

import type React from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import QRScanner from "../components/qr-scanner"; // adjust path if needed

const [showScanner, setShowScanner] = useState(false);

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  Camera,
  MapPin,
  Share2,
  Copy,
  FileText,
  Languages,
  QrCode,
  ScanLine,
  X,
  Check,
  Clock,
  AlertCircle,
  BarChart3,
  History,
  User,
  RefreshCw,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChangeLogEntry {
  timestamp: string;
  updatedBy: string;
  deviceId: string;
  changes: string[];
}

interface AssessmentData {
  // Patient Info
  patientId: string;
  name: string;
  age: string;
  gender: string;

  // Airway
  airwayPatent: boolean;
  airwayObstruction: string;
  airwayInterventions: string[];

  // Breathing
  respiratoryRate: string;
  spO2: string;
  oxygenSupport: string;
  breathSounds: string;
  breathingConcerns: string[];

  // Circulation
  heartRate: string;
  bloodPressure: string;
  capillaryRefill: string;
  pulseQuality: string;
  bleeding: boolean;
  bleedingLocation: string;

  // Disability
  gcs: string;
  pupils: string;
  motorResponse: string;
  neurologicalConcerns: string[];

  // Exposure
  temperature: string;
  skinCondition: string;
  injuries: string[];
  exposureConcerns: string;

  // Additional
  photos: File[];
  location: string;
  additionalNotes: string;

  // Outcome tracking
  outcome: "pending" | "survived" | "deceased" | "discharged" | "transferred";
  outcomeTimestamp?: string;
  timeOfDeath?: string;
  outcomeNotes: string;

  // Distributed update tracking
  lastUpdated: string;
  lastUpdatedBy: string;
  deviceId: string;
  version: number;
  changeLog: ChangeLogEntry[];
}

interface QRData {
  version: string;
  timestamp: string;
  language: string;
  patientId: string;
  assessment: Omit<AssessmentData, "photos">;
  summary: string;
  distributedVersion: number;
  lastUpdated: string;
  lastUpdatedBy: string;
  deviceId: string;
  changeLog: ChangeLogEntry[];
}

const translations = {
  en: {
    // Header
    emergencyAssessment: "Emergency Assessment",
    primarySurvey: "A-E Primary Survey",

    // Navigation
    info: "Info",
    airway: "Airway",
    breathing: "Breathing",
    circulation: "Circulation",
    disability: "Disability",
    exposure: "Exposure",

    // Patient Info
    patientInformation: "Patient Information",
    age: "Age",
    years: "Years",
    gender: "Gender",
    male: "Male",
    female: "Female",
    nonBinary: "Non-binary",
    getLocation: "Get Location",
    addPhotos: "Add Photos",
    location: "Location",
    photosSelected: "photo(s) selected",
    patientId: "Patient ID",
    generateNewId: "Generate New ID",
    customId: "Custom ID",
    enterCustomId: "Enter custom patient ID",
    idGenerated: "New patient ID generated",
    patientName: "Patient Name",
    enterPatientName: "Enter patient name",

    // Airway
    airwayPatent: "Airway Patent",
    obstructionDetails: "Obstruction Details",
    describeObstruction: "Describe obstruction",
    interventions: "Interventions",
    suction: "Suction",
    opa: "OPA",
    npa: "NPA",
    intubation: "Intubation",

    // Breathing
    respiratoryRate: "Respiratory Rate",
    bpm: "bpm",
    oxygenSupport: "Oxygen Support",
    roomAir: "Room Air",
    nasalCannula: "Nasal Cannula",
    faceMask: "Face Mask",
    nonRebreather: "Non-rebreather",
    bvm: "BVM",
    breathSounds: "Breath Sounds",
    normalVesicular: "Normal vesicular",
    diminished: "Diminished",
    absent: "Absent",
    wheeze: "Wheeze",
    crackles: "Crackles",
    concerns: "Concerns",
    dyspnea: "Dyspnea",
    cyanosis: "Cyanosis",
    accessoryMuscles: "Accessory muscles",
    paradoxical: "Paradoxical",

    // Circulation
    heartRate: "Heart Rate",
    bloodPressure: "Blood Pressure",
    capillaryRefill: "Capillary Refill",
    pulseQuality: "Pulse Quality",
    strong: "Strong",
    weak: "Weak",
    thready: "Thready",
    externalBleeding: "External Bleeding",
    bleedingLocation: "Bleeding Location",
    describeBleedingLocation: "Describe location and severity",

    // Disability
    gcsScore: "GCS Score",
    pupils: "Pupils",
    pearl: "PEARL",
    unequal: "Unequal",
    fixedDilated: "Fixed dilated",
    pinpoint: "Pinpoint",
    motorResponse: "Motor Response",
    normal: "Normal",
    weakness: "Weakness",
    paralysis: "Paralysis",
    posturing: "Posturing",
    neurologicalConcerns: "Neurological Concerns",
    alteredLoc: "Altered LOC",
    confusion: "Confusion",
    seizure: "Seizure",
    focalDeficit: "Focal deficit",

    // Exposure
    temperature: "Temperature",
    skinCondition: "Skin Condition",
    pale: "Pale",
    flushed: "Flushed",
    cyanotic: "Cyanotic",
    diaphoretic: "Diaphoretic",
    visibleInjuries: "Visible Injuries",
    lacerations: "Lacerations",
    contusions: "Contusions",
    burns: "Burns",
    fractures: "Fractures",
    deformity: "Deformity",
    swelling: "Swelling",
    additionalConcerns: "Additional Concerns",
    describeFindings: "Describe any additional findings or concerns",
    additionalNotes: "Additional Notes",
    clinicalNotes: "Any additional clinical notes or observations",

    // Summary
    assessmentSummary: "Assessment Summary",
    triageNote: "Triage Note:",
    generateSummary: "Generate Summary",
    completeAssessment: "Complete assessment and generate handover summary",
    share: "Share",
    copy: "Copy",
    backToAssessment: "Back to Assessment",

    // QR Code features
    generateQrCode: "Generate QR Code",
    scanQrCode: "Scan QR Code",
    qrCodeGenerated: "QR Code Generated",
    scanToImport:
      "Scan this QR code with another device to import the assessment",
    scanningQrCode: "Scanning QR Code",
    pointCameraAtQr: "Point your camera at a QR code to import assessment data",
    importedAssessment: "Imported Assessment",
    confirmImport: "Confirm Import",
    cancelImport: "Cancel Import",
    importSuccess: "Assessment imported successfully",
    importError: "Failed to import assessment",
    invalidQrCode: "Invalid QR code format",
    cameraPermissionDenied: "Camera permission denied",
    enableCamera: "Please enable camera access to scan QR codes",
    closeQrCode: "Close QR Code",
    stopScanning: "Stop Scanning",

    // Toast messages
    locationCaptured: "Location captured",
    gpsAdded: "GPS coordinates added to assessment",
    locationUnavailable: "Location unavailable",
    unableToGetGps: "Unable to get GPS coordinates",
    copied: "Copied!",
    summaryCopied: "Assessment summary copied to clipboard",
    copyFailed: "Copy failed",
    unableToCopy: "Unable to copy to clipboard",
    photosAttached: "photo(s) attached",

    // Medical terms for summary
    patient: "Patient",
    airwayPatentSummary: "airway patent",
    breathSoundsSummary: "breath sounds",
    noObviousBleeding: "no obvious external bleeding",
    additional: "Additional",

    // Language
    language: "Language",
    patientList: "Patient List",
    searchPatients: "Search patients...",
    noPatients: "No patients found",
    viewDetails: "View Details",
    backToList: "Back to List",
    newAssessment: "New Assessment",
    triagePriority: "Triage Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    lastUpdated: "Last Updated",

    // Outcome tracking
    outcome: "Disposition",
    pending: "Pending",
    survived: "Survived",
    deceased: "Deceased",
    discharged: "Discharged",
    transferred: "Transferred",
    outcomeNotes: "Disposition Notes",
    enterOutcomeNotes: "Enter disposition notes",
    timeOfDeath: "Time of Death",
    confirmTimeOfDeath: "Confirm Time of Death",
    outcomeUpdated: "Disposition updated",
    confirmDeceased: "Confirm Deceased Status",
    confirmDeceasedMessage:
      "Are you sure you want to mark this patient as deceased? This action requires careful consideration.",
    confirmDeceasedButton: "Confirm Deceased",
    cancel: "Cancel",
    followUpNeeded: "Follow-up Needed",
    redPatientNoOutcome: "Red priority patient with no disposition recorded",

    // Dashboard
    dashboard: "Dashboard",
    summaryStatistics: "Summary Statistics",
    totalPatients: "Total Patients",
    totalDeaths: "Total Deaths",
    mortalityRate: "Mortality Rate",
    outcomeBreakdown: "Outcome Breakdown",
    triageBreakdown: "Triage Breakdown",
    redPriority: "Red Priority",
    yellowPriority: "Yellow Priority",
    greenPriority: "Green Priority",
    pendingOutcomes: "Pending Outcomes",
    needsFollowUp: "Needs Follow-up",

    // Distributed updates
    lastUpdatedBy: "Last Updated By",
    deviceId: "Device ID",
    version: "Version",
    changeHistory: "Change History",
    recordUpdated: "Record Updated",
    recordUpToDate: "Record Up to Date",
    newerVersionAvailable: "Newer version available",
    olderVersionIgnored:
      "You already have the most up-to-date version of this patient",
    recordSynchronized: "Record synchronized successfully",
    conflictResolution: "Version Conflict",
    acceptIncoming: "Accept Incoming",
    keepCurrent: "Keep Current",
    viewChanges: "View Changes",
    changedFields: "Changed Fields",
    noChanges: "No changes detected",
    syncStatus: "Sync Status",
    upToDate: "Up to date",
    hasUpdates: "Has updates",
    conflicted: "Conflicted",
    userName: "User Name",
    enterUserName: "Enter your name",
    setUserName: "Set User Name",
  },
  ar: {
    // Header
    emergencyAssessment: "تقييم الطوارئ",
    primarySurvey: "المسح الأولي أ-ب-ج-د-هـ",

    // Navigation
    info: "معلومات",
    airway: "أ",
    breathing: "ب",
    circulation: "ج",
    disability: "د",
    exposure: "هـ",

    // Patient Info
    patientInformation: "معلومات المريض",
    age: "العمر",
    years: "سنة",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    nonBinary: "غير محدد",
    getLocation: "تحديد الموقع",
    addPhotos: "إضافة صور",
    location: "الموقع",
    photosSelected: "صورة محددة",
    patientId: "رقم المريض",
    generateNewId: "إنشاء رقم جديد",
    customId: "رقم مخصص",
    enterCustomId: "أدخل رقم المريض المخصص",
    idGenerated: "تم إنشاء رقم مريض جديد",
    patientName: "اسم المريض",
    enterPatientName: "أدخل اسم المريض",

    // Airway
    airwayPatent: "المجرى الهوائي مفتوح",
    obstructionDetails: "تفاصيل الانسداد",
    describeObstruction: "وصف الانسداد",
    interventions: "التدخلات",
    suction: "شفط",
    opa: "أنبوب فموي بلعومي",
    npa: "أنبوب أنفي بلعومي",
    intubation: "التنبيب",

    // Breathing
    respiratoryRate: "معدل التنفس",
    bpm: "نفس/دقيقة",
    oxygenSupport: "دعم الأكسجين",
    roomAir: "هواء الغرفة",
    nasalCannula: "أنبوب أنفي",
    faceMask: "قناع وجه",
    nonRebreather: "قناع غير معيد التنفس",
    bvm: "كيس وقناع",
    breathSounds: "أصوات التنفس",
    normalVesicular: "حويصلية طبيعية",
    diminished: "منخفضة",
    absent: "غائبة",
    wheeze: "أزيز",
    crackles: "طقطقة",
    concerns: "مخاوف",
    dyspnea: "ضيق تنفس",
    cyanosis: "زرقة",
    accessoryMuscles: "عضلات مساعدة",
    paradoxical: "متناقض",

    // Circulation
    heartRate: "معدل ضربات القلب",
    bloodPressure: "ضغط الدم",
    capillaryRefill: "امتلاء الشعيرات الدموية",
    pulseQuality: "جودة النبض",
    strong: "قوي",
    weak: "ضعيف",
    thready: "خيطي",
    externalBleeding: "نزيف خارجي",
    bleedingLocation: "موقع النزيف",
    describeBleedingLocation: "وصف الموقع والشدة",

    // Disability
    gcsScore: "درجة غلاسكو للغيبوبة",
    pupils: "الحدقتان",
    pearl: "متساويتان ومتفاعلتان مع الضوء",
    unequal: "غير متساويتان",
    fixedDilated: "ثابتتان ومتوسعتان",
    pinpoint: "نقطيتان",
    motorResponse: "الاستجابة الحركية",
    normal: "طبيعية",
    weakness: "ضعف",
    paralysis: "شلل",
    posturing: "وضعية غير طبيعية",
    neurologicalConcerns: "مخاوف عصبية",
    alteredLoc: "تغير مستوى الوعي",
    confusion: "تشوش",
    seizure: "نوبة صرع",
    focalDeficit: "عجز بؤري",

    // Exposure
    temperature: "درجة الحرارة",
    skinCondition: "حالة الجلد",
    pale: "شاحب",
    flushed: "محمر",
    cyanotic: "مزرق",
    diaphoretic: "متعرق",
    visibleInjuries: "إصابات مرئية",
    lacerations: "جروح قطعية",
    contusions: "كدمات",
    burns: "حروق",
    fractures: "كسور",
    deformity: "تشوه",
    swelling: "تورم",
    additionalConcerns: "مخاوف إضافية",
    describeFindings: "وصف أي نتائج أو مخاوف إضافية",
    additionalNotes: "ملاحظات إضافية",
    clinicalNotes: "أي ملاحظات أو مشاهدات سريرية إضافية",

    // Summary
    assessmentSummary: "ملخص التقييم",
    triageNote: "ملاحظة الفرز:",
    generateSummary: "إنشاء ملخص",
    completeAssessment: "إكمال التقييم وإنشاء ملخص التسليم",
    share: "مشاركة",
    copy: "نسخ",
    backToAssessment: "العودة للتقييم",

    // QR Code features
    generateQrCode: "إنشاء رمز QR",
    scanQrCode: "مسح رمز QR",
    qrCodeGenerated: "تم إنشاء رمز QR",
    scanToImport: "امسح رمز QR هذا بجهاز آخر لاستيراد التقييم",
    scanningQrCode: "مسح رمز QR",
    pointCameraAtQr: "وجه الكاميرا نحو رمز QR لاستيراد بيانات التقييم",
    importedAssessment: "التقييم المستورد",
    confirmImport: "تأكيد الاستيراد",
    cancelImport: "إلغاء الاستيراد",
    importSuccess: "تم استيراد التقييم بنجاح",
    importError: "فشل في استيراد التقييم",
    invalidQrCode: "تنسيق رمز QR غير صالح",
    cameraPermissionDenied: "تم رفض إذن الكاميرا",
    enableCamera: "يرجى تمكين الوصول للكاميرا لمسح رموز QR",
    closeQrCode: "إغلاق رمز QR",
    stopScanning: "إيقاف المسح",

    // Toast messages
    locationCaptured: "تم تحديد الموقع",
    gpsAdded: "تم إضافة إحداثيات GPS للتقييم",
    locationUnavailable: "الموقع غير متاح",
    unableToGetGps: "غير قادر على الحصول على إحداثيات GPS",
    copied: "تم النسخ!",
    summaryCopied: "تم نسخ ملخص التقييم إلى الحافظة",
    copyFailed: "فشل النسخ",
    unableToCopy: "غير قادر على النسخ إلى الحافظة",
    photosAttached: "صورة مرفقة",

    // Medical terms for summary
    patient: "المريض",
    airwayPatentSummary: "المجرى الهوائي مفتوح",
    breathSoundsSummary: "أصوات التنفس",
    noObviousBleeding: "لا يوجد نزيف خارجي واضح",
    additional: "إضافي",

    // Language
    language: "اللغة",
    patientList: "قائمة المرضى",
    searchPatients: "البحث عن المرضى...",
    noPatients: "لم يتم العثور على مرضى",
    viewDetails: "عرض التفاصيل",
    backToList: "العودة للقائمة",
    newAssessment: "تقييم جديد",
    triagePriority: "أولوية الفرز",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    lastUpdated: "آخر تحديث",

    // Outcome tracking
    outcome: "النتيجة",
    pending: "معلق",
    survived: "نجا",
    deceased: "متوفى",
    discharged: "خرج",
    transferred: "نُقل",
    outcomeNotes: "ملاحظات النتيجة",
    enterOutcomeNotes: "أدخل ملاحظات النتيجة",
    timeOfDeath: "وقت الوفاة",
    confirmTimeOfDeath: "تأكيد وقت الوفاة",
    outcomeUpdated: "تم تحديث النتيجة",
    confirmDeceased: "تأكيد حالة الوفاة",
    confirmDeceasedMessage:
      "هل أنت متأكد من أنك تريد تسجيل هذا المريض كمتوفى؟ هذا الإجراء يتطلب اعتبارًا دقيقًا.",
    confirmDeceasedButton: "تأكيد الوفاة",
    cancel: "إلغاء",
    followUpNeeded: "يحتاج متابعة",
    redPatientNoOutcome: "مريض أولوية حمراء بدون نتيجة مسجلة",

    // Dashboard
    dashboard: "لوحة المعلومات",
    summaryStatistics: "إحصائيات موجزة",
    totalPatients: "إجمالي المرضى",
    totalDeaths: "إجمالي الوفيات",
    mortalityRate: "معدل الوفيات",
    outcomeBreakdown: "تفصيل النتائج",
    triageBreakdown: "تفصيل الفرز",
    redPriority: "أولوية حمراء",
    yellowPriority: "أولوية صفراء",
    greenPriority: "أولوية خضراء",
    pendingOutcomes: "نتائج معلقة",
    needsFollowUp: "يحتاج متابعة",

    // Distributed updates
    lastUpdatedBy: "آخر تحديث بواسطة",
    deviceId: "معرف الجهاز",
    version: "الإصدار",
    changeHistory: "تاريخ التغييرات",
    recordUpdated: "تم تحديث السجل",
    recordUpToDate: "السجل محدث",
    newerVersionAvailable: "إصدار أحدث متاح",
    olderVersionIgnored: "لديك بالفعل أحدث إصدار من هذا المريض",
    recordSynchronized: "تم مزامنة السجل بنجاح",
    conflictResolution: "تعارض الإصدار",
    acceptIncoming: "قبول الوارد",
    keepCurrent: "الاحتفاظ بالحالي",
    viewChanges: "عرض التغييرات",
    changedFields: "الحقول المتغيرة",
    noChanges: "لم يتم اكتشاف تغييرات",
    syncStatus: "حالة المزامنة",
    upToDate: "محدث",
    hasUpdates: "يحتوي على تحديثات",
    conflicted: "متعارض",
    userName: "اسم المستخدم",
    enterUserName: "أدخل اسمك",
    setUserName: "تعيين اسم المستخدم",
  },
};

const generatePatientId = (): string => {
  // Use characters that are easy to read and write, avoiding I, O, 1, 0
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateDeviceId = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export default function EmergencyAssessment() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patient");
  const [showSummary, setShowSummary] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importedData, setImportedData] = useState<QRData | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = translations[language];
  const isRTL = language === "ar";

  const [showCustomIdInput, setShowCustomIdInput] = useState(false);
  const [customIdValue, setCustomIdValue] = useState("");

  const [currentView, setCurrentView] = useState<
    | "assessment"
    | "patientList"
    | "patientDetail"
    | "dashboard"
    | "changeHistory"
  >("assessment");
  const [patientList, setPatientList] = useState<QRData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<QRData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeceasedConfirm, setShowDeceasedConfirm] = useState(false);
  const [patientToUpdate, setPatientToUpdate] = useState<string | null>(null);
  const [showVersionConflict, setShowVersionConflict] = useState(false);
  const [conflictData, setConflictData] = useState<{
    incoming: QRData;
    current: QRData;
    changes: string[];
  } | null>(null);

  // User and device identification
  const [userName, setUserName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [showUserSetup, setShowUserSetup] = useState(false);

  // Editable data for patient detail view - moved outside conditional rendering
  const [editableData, setEditableData] = useState<AssessmentData>({
    patientId: "",
    name: "",
    age: "",
    gender: "",
    airwayPatent: true,
    airwayObstruction: "",
    airwayInterventions: [],
    respiratoryRate: "",
    spO2: "",
    oxygenSupport: "Room Air",
    breathSounds: "Normal vesicular",
    breathingConcerns: [],
    heartRate: "",
    bloodPressure: "",
    capillaryRefill: "<2s",
    pulseQuality: "Strong",
    bleeding: false,
    bleedingLocation: "",
    gcs: "15",
    pupils: "PEARL",
    motorResponse: "Normal",
    neurologicalConcerns: [],
    temperature: "",
    skinCondition: "Normal",
    injuries: [],
    exposureConcerns: "",
    photos: [],
    location: "",
    additionalNotes: "",
    outcome: "pending",
    outcomeNotes: "",
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: "",
    deviceId: "",
    version: 1,
    changeLog: [],
  });

  // Initialize device ID and check for user name
  useEffect(() => {
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = generateDeviceId();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setShowUserSetup(true);
    }
  }, []);

  const [data, setData] = useState<AssessmentData>({
    patientId: generatePatientId(),
    name: "",
    age: "",
    gender: "",
    airwayPatent: true,
    airwayObstruction: "",
    airwayInterventions: [],
    respiratoryRate: "",
    spO2: "",
    oxygenSupport: "Room Air",
    breathSounds: "Normal vesicular",
    breathingConcerns: [],
    heartRate: "",
    bloodPressure: "",
    capillaryRefill: "<2s",
    pulseQuality: "Strong",
    bleeding: false,
    bleedingLocation: "",
    gcs: "15",
    pupils: "PEARL",
    motorResponse: "Normal",
    neurologicalConcerns: [],
    temperature: "",
    skinCondition: "Normal",
    injuries: [],
    exposureConcerns: "",
    photos: [],
    location: "",
    additionalNotes: "",
    outcome: "pending",
    outcomeNotes: "",
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: userName,
    deviceId: deviceId,
    version: 1,
    changeLog: [],
  });

  // Update editableData when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      setEditableData(selectedPatient.assessment);
    }
  }, [selectedPatient]);

  // Load patients from localStorage on component mount
  useEffect(() => {
    const savedPatients = localStorage.getItem("emergencyPatients");
    if (savedPatients) {
      try {
        const patients = JSON.parse(savedPatients);
        // Migrate old data to include distributed update fields
        const migratedPatients = patients.map((patient: any) => ({
          ...patient,
          distributedVersion: patient.distributedVersion || 1,
          lastUpdated: patient.lastUpdated || patient.timestamp,
          lastUpdatedBy: patient.lastUpdatedBy || "Unknown",
          deviceId: patient.deviceId || "Unknown",
          changeLog: patient.changeLog || [],
          assessment: {
            ...patient.assessment,
            outcome: patient.assessment.outcome || "pending",
            outcomeNotes: patient.assessment.outcomeNotes || "",
            lastUpdated: patient.assessment.lastUpdated || patient.timestamp,
            lastUpdatedBy: patient.assessment.lastUpdatedBy || "Unknown",
            deviceId: patient.assessment.deviceId || "Unknown",
            version: patient.assessment.version || 1,
            changeLog: patient.assessment.changeLog || [],
          },
        }));
        setPatientList(
          migratedPatients.sort(
            (a: QRData, b: QRData) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
      } catch (error) {
        console.error("Error loading patients:", error);
      }
    }
  }, []);

  // Save patients to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem("emergencyPatients", JSON.stringify(patientList));
  }, [patientList]);

  // Update data when user name or device ID changes
  useEffect(() => {
    if (userName && deviceId) {
      setData((prev) => ({
        ...prev,
        lastUpdatedBy: userName,
        deviceId: deviceId,
      }));
    }
  }, [userName, deviceId]);

  const detectChanges = (
    oldData: Omit<AssessmentData, "photos">,
    newData: Omit<AssessmentData, "photos">
  ): string[] => {
    const changes: string[] = [];
    const fieldsToCheck = [
      "name",
      "age",
      "gender",
      "airwayPatent",
      "airwayObstruction",
      "respiratoryRate",
      "spO2",
      "oxygenSupport",
      "breathSounds",
      "heartRate",
      "bloodPressure",
      "capillaryRefill",
      "pulseQuality",
      "bleeding",
      "bleedingLocation",
      "gcs",
      "pupils",
      "motorResponse",
      "temperature",
      "skinCondition",
      "exposureConcerns",
      "additionalNotes",
      "outcome",
      "outcomeNotes",
    ];

    fieldsToCheck.forEach((field) => {
      if (
        JSON.stringify(oldData[field as keyof typeof oldData]) !==
        JSON.stringify(newData[field as keyof typeof newData])
      ) {
        changes.push(field);
      }
    });

    // Check array fields
    const arrayFields = [
      "airwayInterventions",
      "breathingConcerns",
      "neurologicalConcerns",
      "injuries",
    ];
    arrayFields.forEach((field) => {
      const oldArray = oldData[field as keyof typeof oldData] as string[];
      const newArray = newData[field as keyof typeof newData] as string[];
      if (JSON.stringify(oldArray.sort()) !== JSON.stringify(newArray.sort())) {
        changes.push(field);
      }
    });

    return changes;
  };

  const addChangeLogEntry = (changes: string[]): ChangeLogEntry => {
    return {
      timestamp: new Date().toISOString(),
      updatedBy: userName,
      deviceId: deviceId,
      changes: changes,
    };
  };

  const saveCurrentAssessment = (changedFields?: string[]) => {
    const now = new Date().toISOString();
    const changes = changedFields || [];

    // Create change log entry if there are changes
    const newChangeLog = [...data.changeLog];
    if (changes.length > 0) {
      newChangeLog.unshift(addChangeLogEntry(changes));
      // Keep only last 3 entries
      if (newChangeLog.length > 3) {
        newChangeLog.splice(3);
      }
    }

    const currentAssessment: QRData = {
      version: "2.0", // Updated version for distributed updates
      timestamp: now,
      language: language,
      patientId: data.patientId,
      assessment: {
        ...data,
        photos: [], // Exclude photos for storage
        lastUpdated: now,
        lastUpdatedBy: userName,
        deviceId: deviceId,
        version: data.version + (changes.length > 0 ? 1 : 0),
        changeLog: newChangeLog,
      },
      summary: generateSummary(),
      distributedVersion: data.version + (changes.length > 0 ? 1 : 0),
      lastUpdated: now,
      lastUpdatedBy: userName,
      deviceId: deviceId,
      changeLog: newChangeLog,
    };

    // Check if patient already exists (update) or is new (add)
    const existingIndex = patientList.findIndex(
      (p) => p.patientId === data.patientId
    );
    if (existingIndex >= 0) {
      const updatedList = [...patientList];
      updatedList[existingIndex] = currentAssessment;
      setPatientList(
        updatedList.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    } else {
      setPatientList((prev) => [currentAssessment, ...prev]);
    }

    // Update current data with new version info
    setData((prev) => ({
      ...prev,
      lastUpdated: now,
      lastUpdatedBy: userName,
      deviceId: deviceId,
      version: prev.version + (changes.length > 0 ? 1 : 0),
      changeLog: newChangeLog,
    }));
  };

  const updatePatientOutcome = (
    patientId: string,
    outcome: AssessmentData["outcome"],
    notes: string,
    timeOfDeath?: string
  ) => {
    const updatedList = patientList.map((patient) => {
      if (patient.patientId === patientId) {
        const now = new Date().toISOString();
        const changes = ["outcome"];
        if (notes !== patient.assessment.outcomeNotes)
          changes.push("outcomeNotes");
        if (timeOfDeath) changes.push("timeOfDeath");

        const newChangeLog = [...patient.changeLog];
        newChangeLog.unshift(addChangeLogEntry(changes));
        if (newChangeLog.length > 3) {
          newChangeLog.splice(3);
        }

        return {
          ...patient,
          lastUpdated: now,
          lastUpdatedBy: userName,
          deviceId: deviceId,
          distributedVersion: patient.distributedVersion + 1,
          changeLog: newChangeLog,
          assessment: {
            ...patient.assessment,
            outcome,
            outcomeNotes: notes,
            outcomeTimestamp: now,
            timeOfDeath: outcome === "deceased" ? timeOfDeath : undefined,
            lastUpdated: now,
            lastUpdatedBy: userName,
            deviceId: deviceId,
            version: patient.assessment.version + 1,
            changeLog: newChangeLog,
          },
        };
      }
      return patient;
    });
    setPatientList(updatedList);
    toast({
      title: t.outcomeUpdated,
      description: `Patient ${patientId} outcome updated to ${outcome}`,
    });
  };

  const handleVersionConflict = (incoming: QRData, current: QRData) => {
    const changes = detectChanges(current.assessment, incoming.assessment);
    setConflictData({ incoming, current, changes });
    setShowVersionConflict(true);
  };

  const resolveVersionConflict = (acceptIncoming: boolean) => {
    if (!conflictData) return;

    if (acceptIncoming) {
      // Accept incoming version
      const updatedList = patientList.map((patient) =>
        patient.patientId === conflictData.incoming.patientId
          ? conflictData.incoming
          : patient
      );
      setPatientList(updatedList);
      toast({
        title: t.recordUpdated,
        description: t.recordSynchronized,
      });
    } else {
      // Keep current version
      toast({
        title: t.recordUpToDate,
        description: t.olderVersionIgnored,
      });
    }

    setShowVersionConflict(false);
    setConflictData(null);
    setShowImportConfirm(false);
    setImportedData(null);
  };

  const getTriagePriority = (assessment: Omit<AssessmentData, "photos">) => {
    const gcs = Number.parseInt(assessment.gcs) || 15;
    const hasBreathing = assessment.breathingConcerns.length > 0;
    const hasBleeding = assessment.bleeding;
    const hasNeurological = assessment.neurologicalConcerns.length > 0;

    if (gcs < 9 || hasBleeding || hasNeurological) return "red";
    if (gcs < 13 || hasBreathing) return "yellow";
    return "green";
  };

  const getTriageColor = (priority: string) => {
    switch (priority) {
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getOutcomeColor = (outcome: AssessmentData["outcome"]) => {
    switch (outcome) {
      case "survived":
        return "bg-green-100 text-green-800";
      case "deceased":
        return "bg-red-100 text-red-800";
      case "discharged":
        return "bg-blue-100 text-blue-800";
      case "transferred":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const needsFollowUp = (patient: QRData) => {
    const priority = getTriagePriority(patient.assessment);
    const hoursSinceAssessment =
      (Date.now() - new Date(patient.timestamp).getTime()) / (1000 * 60 * 60);
    return (
      priority === "red" &&
      patient.assessment.outcome === "pending" &&
      hoursSinceAssessment > 2
    );
  };

  const getStatistics = () => {
    const total = patientList.length;
    const deceased = patientList.filter(
      (p) => p.assessment.outcome === "deceased"
    ).length;
    const survived = patientList.filter(
      (p) => p.assessment.outcome === "survived"
    ).length;
    const discharged = patientList.filter(
      (p) => p.assessment.outcome === "discharged"
    ).length;
    const transferred = patientList.filter(
      (p) => p.assessment.outcome === "transferred"
    ).length;
    const pending = patientList.filter(
      (p) => p.assessment.outcome === "pending"
    ).length;

    const redPatients = patientList.filter(
      (p) => getTriagePriority(p.assessment) === "red"
    );
    const yellowPatients = patientList.filter(
      (p) => getTriagePriority(p.assessment) === "yellow"
    );
    const greenPatients = patientList.filter(
      (p) => getTriagePriority(p.assessment) === "green"
    );

    const redDeceased = redPatients.filter(
      (p) => p.assessment.outcome === "deceased"
    ).length;
    const yellowDeceased = yellowPatients.filter(
      (p) => p.assessment.outcome === "deceased"
    ).length;
    const greenDeceased = greenPatients.filter(
      (p) => p.assessment.outcome === "deceased"
    ).length;

    const followUpNeeded = patientList.filter(needsFollowUp).length;

    return {
      total,
      deceased,
      survived,
      discharged,
      transferred,
      pending,
      mortalityRate: total > 0 ? ((deceased / total) * 100).toFixed(1) : "0",
      triage: {
        red: { total: redPatients.length, deceased: redDeceased },
        yellow: { total: yellowPatients.length, deceased: yellowDeceased },
        green: { total: greenPatients.length, deceased: greenDeceased },
      },
      followUpNeeded,
    };
  };

  const filteredPatients = patientList.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.patientId.toLowerCase().includes(query) ||
      patient.assessment.name.toLowerCase().includes(query) ||
      patient.summary.toLowerCase().includes(query) ||
      `gcs ${patient.assessment.gcs}`.includes(query) ||
      (patient.assessment.bleeding && "bleeding".includes(query)) ||
      patient.assessment.outcome.toLowerCase().includes(query)
    );
  });

  const updateData = (field: keyof AssessmentData, value: any) => {
    const oldValue = data[field];
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
      setData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleArrayItem = (field: keyof AssessmentData, item: string) => {
    const currentArray = data[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateData(field, newArray);
  };

  const updateEditableData = (field: keyof AssessmentData, value: any) => {
    setEditableData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditableArrayItem = (
    field: keyof AssessmentData,
    item: string
  ) => {
    const currentArray = editableData[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateEditableData(field, newArray);
  };

  const savePatientChanges = () => {
    if (!selectedPatient) return;

    const now = new Date().toISOString();
    const changes = detectChanges(selectedPatient.assessment, editableData);

    if (changes.length > 0) {
      const newChangeLog = [...selectedPatient.changeLog];
      newChangeLog.unshift(addChangeLogEntry(changes));
      if (newChangeLog.length > 3) {
        newChangeLog.splice(3);
      }

      const updatedPatient: QRData = {
        ...selectedPatient,
        lastUpdated: now,
        lastUpdatedBy: userName,
        deviceId: deviceId,
        distributedVersion: selectedPatient.distributedVersion + 1,
        changeLog: newChangeLog,
        assessment: {
          ...editableData,
          lastUpdated: now,
          lastUpdatedBy: userName,
          deviceId: deviceId,
          version: selectedPatient.assessment.version + 1,
          changeLog: newChangeLog,
        },
        summary: generateSummaryFromData(editableData),
      };

      // Update patient in list
      const updatedList = patientList.map((patient) =>
        patient.patientId === selectedPatient.patientId
          ? updatedPatient
          : patient
      );
      setPatientList(
        updatedList.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );

      toast({
        title: t.recordUpdated,
        description: `${changes.length} fields updated`,
      });
    }

    setCurrentView("patientList");
  };

  const generateSummary = () => {
    const {
      patientId,
      name,
      age,
      gender,
      gcs,
      respiratoryRate,
      spO2,
      oxygenSupport,
      bloodPressure,
      heartRate,
    } = data;

    let summary = `${t.patientId}: ${patientId}`;
    if (name) summary += ` | ${t.patientName}: ${name}`;
    summary += ` | ${gender || t.patient}`;
    if (age) summary += `، ${age}${language === "ar" ? " سنة" : "yo"}`;
    if (gcs) summary += `، ${language === "ar" ? "غلاسكو" : "GCS"} ${gcs}`;
    if (respiratoryRate)
      summary += `، ${
        language === "ar" ? "معدل التنفس" : "RR"
      } ${respiratoryRate}`;
    if (spO2)
      summary += `، ${language === "ar" ? "تشبع الأكسجين" : "SpO₂"} ${spO2}%`;
    if (oxygenSupport && oxygenSupport !== "Room Air")
      summary += ` ${language === "ar" ? "على" : "on"} ${oxygenSupport}`;
    else if (spO2) summary += ` ${language === "ar" ? "هواء الغرفة" : "RA"}`;
    if (bloodPressure)
      summary += `، ${language === "ar" ? "ضغط الدم" : "BP"} ${bloodPressure}`;
    if (heartRate)
      summary += `، ${language === "ar" ? "معدل القلب" : "HR"} ${heartRate}`;

    // Add qualitative findings
    const findings = [];
    if (data.airwayPatent) findings.push(t.airwayPatentSummary);
    if (data.breathSounds && data.breathSounds !== "Normal vesicular")
      findings.push(`${t.breathSoundsSummary}: ${data.breathSounds}`);
    if (data.capillaryRefill)
      findings.push(
        `${language === "ar" ? "امتلاء الشعيرات" : "CRT"} ${
          data.capillaryRefill
        }`
      );
    if (data.pupils && data.pupils !== "PEARL")
      findings.push(`${t.pupils}: ${data.pupils}`);
    if (!data.bleeding) findings.push(t.noObviousBleeding);

    if (findings.length > 0) {
      summary += `، ${findings.join("، ")}`;
    }

    if (data.additionalNotes) {
      summary += `。 ${t.additional}: ${data.additionalNotes}`;
    }

    return summary;
  };

  const generateSummaryFromData = (assessmentData: AssessmentData) => {
    const {
      patientId,
      name,
      age,
      gender,
      gcs,
      respiratoryRate,
      spO2,
      oxygenSupport,
      bloodPressure,
      heartRate,
    } = assessmentData;

    let summary = `${t.patientId}: ${patientId}`;
    if (name) summary += ` | ${t.patientName}: ${name}`;
    summary += ` | ${gender || t.patient}`;
    if (age) summary += `، ${age}${language === "ar" ? " سنة" : "yo"}`;
    if (gcs) summary += `، ${language === "ar" ? "غلاسكو" : "GCS"} ${gcs}`;
    if (respiratoryRate)
      summary += `، ${
        language === "ar" ? "معدل التنفس" : "RR"
      } ${respiratoryRate}`;
    if (spO2)
      summary += `، ${language === "ar" ? "تشبع الأكسجين" : "SpO₂"} ${spO2}%`;
    if (oxygenSupport && oxygenSupport !== "Room Air")
      summary += ` ${language === "ar" ? "على" : "on"} ${oxygenSupport}`;
    else if (spO2) summary += ` ${language === "ar" ? "هواء الغرفة" : "RA"}`;
    if (bloodPressure)
      summary += `، ${language === "ar" ? "ضغط الدم" : "BP"} ${bloodPressure}`;
    if (heartRate)
      summary += `، ${language === "ar" ? "معدل القلب" : "HR"} ${heartRate}`;

    // Add qualitative findings
    const findings = [];
    if (assessmentData.airwayPatent) findings.push(t.airwayPatentSummary);
    if (
      assessmentData.breathSounds &&
      assessmentData.breathSounds !== "Normal vesicular"
    )
      findings.push(`${t.breathSoundsSummary}: ${assessmentData.breathSounds}`);
    if (assessmentData.capillaryRefill)
      findings.push(
        `${language === "ar" ? "امتلاء الشعيرات" : "CRT"} ${
          assessmentData.capillaryRefill
        }`
      );
    if (assessmentData.pupils && assessmentData.pupils !== "PEARL")
      findings.push(`${t.pupils}: ${assessmentData.pupils}`);
    if (!assessmentData.bleeding) findings.push(t.noObviousBleeding);

    if (findings.length > 0) {
      summary += `، ${findings.join("، ")}`;
    }

    if (assessmentData.additionalNotes) {
      summary += `。 ${t.additional}: ${assessmentData.additionalNotes}`;
    }

    return summary;
  };

  function handleQRScanned(data: string) {
    console.log("QR Code Scanned:", data);
    // Do something with `data`, like load a patient by ID
    toast({ title: "QR Code Scanned", description: data });
  }

  // QR Code Generation (replace your current generateQRCode function)
  const generateQRCode = async () => {
    try {
      // Create a copy of data without photos
      const { photos, ...assessmentWithoutPhotos } = data;

      const qrData: QRData = {
        version: "2.0",
        timestamp: new Date().toISOString(),
        language: language,
        patientId: data.patientId,
        assessment: assessmentWithoutPhotos, // No photos included
        summary: generateSummary(),
        distributedVersion: data.version,
        lastUpdated: data.lastUpdated,
        lastUpdatedBy: data.lastUpdatedBy,
        deviceId: data.deviceId,
        changeLog: data.changeLog,
      };

      // Rest of your function...

      // Save current assessment before generating QR
      saveCurrentAssessment();

      const qrText = JSON.stringify(qrData);

      // Generate QR code using qrcode library
      const qrCodeDataURL = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataURL(qrCodeDataURL);
      setShowQRCode(true);

      toast({
        title: "QR Code Generated",
        description: "QR code contains complete patient assessment data",
      });
    } catch (error) {
      console.error("QR Generation Error:", error);
      toast({
        title: t.copyFailed,
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  // Improved QR Code Scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("video.play() failed:", err);
        }
      }
      setShowScanner(true);
      scanQRCode();
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: t.cameraPermissionDenied,
        description: t.enableCamera,
        variant: "destructive",
      });
    }
  };

  // Proper QR Code Scanning with jsQR
  const scanQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Use jsQR to detect QR codes
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          try {
            const qrData: QRData = JSON.parse(code.data);
            setImportedData(qrData);
            setShowImportConfirm(true);
            stopScanning();

            toast({
              title: "QR Code Scanned",
              description: "Patient data found in QR code",
            });
            return;
          } catch (error) {
            console.error("Invalid QR code data:", error);
            toast({
              title: "Invalid QR Code",
              description: "QR code does not contain valid patient data",
              variant: "destructive",
            });
          }
        }
      }

      if (showScanner) {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  // Simulate QR code scanning result for demo
  const simulateQRScan = () => {
    const mockQRData: QRData = {
      version: "2.0",
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      language: "en",
      patientId: "H8K3M7",
      assessment: {
        patientId: "H8K3M7",
        name: "John Smith",
        age: "45",
        gender: "M",
        airwayPatent: true,
        airwayObstruction: "",
        airwayInterventions: ["Suction"],
        respiratoryRate: "22",
        spO2: "95",
        oxygenSupport: "Nasal Cannula",
        breathSounds: "Normal vesicular",
        breathingConcerns: ["Dyspnea"],
        heartRate: "88",
        bloodPressure: "110/70",
        capillaryRefill: "<2s",
        pulseQuality: "Strong",
        bleeding: false,
        bleedingLocation: "",
        gcs: "14",
        pupils: "PEARL",
        motorResponse: "Normal",
        neurologicalConcerns: [],
        temperature: "36.5",
        skinCondition: "Pale",
        injuries: ["Contusions"],
        exposureConcerns: "Minor abrasions on left arm",
        location: "40.7128, -74.0060",
        additionalNotes:
          "Patient alert and cooperative, complaining of chest pain",
        outcome: "pending",
        outcomeNotes: "",
        lastUpdated: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        lastUpdatedBy: "Dr. Sarah Wilson",
        deviceId: "DEV456XY",
        version: 3,
        changeLog: [
          {
            timestamp: new Date(Date.now() - 60000).toISOString(),
            updatedBy: "Dr. Sarah Wilson",
            deviceId: "DEV456XY",
            changes: ["respiratoryRate", "spO2", "oxygenSupport"],
          },
          {
            timestamp: new Date(Date.now() - 180000).toISOString(),
            updatedBy: "Nurse Johnson",
            deviceId: "DEV123AB",
            changes: ["gcs", "breathingConcerns"],
          },
        ],
      },
      summary:
        "Patient ID: H8K3M7 | Patient Name: John Smith | M, 45yo, GCS 14, RR 22, SpO₂ 95% on Nasal Cannula, BP 110/70, HR 88, airway patent, CRT <2s, no obvious external bleeding",
      distributedVersion: 3,
      lastUpdated: new Date(Date.now() - 60000).toISOString(),
      lastUpdatedBy: "Dr. Sarah Wilson",
      deviceId: "DEV456XY",
      changeLog: [
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          updatedBy: "Dr. Sarah Wilson",
          deviceId: "DEV456XY",
          changes: ["respiratoryRate", "spO2", "oxygenSupport"],
        },
        {
          timestamp: new Date(Date.now() - 180000).toISOString(),
          updatedBy: "Nurse Johnson",
          deviceId: "DEV123AB",
          changes: ["gcs", "breathingConcerns"],
        },
      ],
    };

    setImportedData(mockQRData);
    setShowImportConfirm(true);
    stopScanning();
  };

  const confirmImport = () => {
    if (importedData) {
      // Check if patient already exists locally
      const existingPatient = patientList.find(
        (p) => p.patientId === importedData.patientId
      );

      if (existingPatient) {
        // Compare timestamps - if local version is newer, keep it
        const incomingTime = new Date(importedData.lastUpdated).getTime();
        const existingTime = new Date(existingPatient.lastUpdated).getTime();

        if (incomingTime > existingTime) {
          // Incoming is newer - update local version
          const updatedList = patientList.map((patient) =>
            patient.patientId === importedData.patientId
              ? importedData
              : patient
          );
          setPatientList(
            updatedList.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
          );

          toast({
            title: t.recordUpdated,
            description: t.newerVersionAvailable,
          });
        } else {
          // Local version is newer or same - keep local version
          toast({
            title: t.recordUpToDate,
            description: t.olderVersionIgnored,
          });
        }
      } else {
        // New patient - add to list
        setPatientList((prev) => [importedData, ...prev]);
        toast({
          title: t.importSuccess,
          description: "New patient record imported",
        });
      }

      setShowImportConfirm(false);
      setImportedData(null);
      setCurrentView("patientList");
    }
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setImportedData(null);
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };
  // Alternative: File-based QR scanning for devices without camera
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            const qrData: QRData = JSON.parse(code.data);
            setImportedData(qrData);
            setShowImportConfirm(true);

            toast({
              title: "QR Code Scanned",
              description: "Patient data found in uploaded image",
            });
          } catch (error) {
            toast({
              title: "Invalid QR Code",
              description: "Image does not contain valid patient data",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "No QR Code Found",
            description: "Could not find QR code in uploaded image",
            variant: "destructive",
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateData("photos", [...data.photos, ...Array.from(e.target.files)]);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateData(
            "location",
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          );
          toast({ title: t.locationCaptured, description: t.gpsAdded });
        },
        () => {
          toast({
            title: t.locationUnavailable,
            description: t.unableToGetGps,
            variant: "destructive",
          });
        }
      );
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t.copied, description: t.summaryCopied });
    } catch (err) {
      toast({
        title: t.copyFailed,
        description: t.unableToCopy,
        variant: "destructive",
      });
    }
  };

  const shareAssessment = async () => {
    const summary = generateSummary();
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.emergencyAssessment,
          text: summary,
        });
      } catch (err) {
        copyToClipboard(summary);
      }
    } else {
      copyToClipboard(summary);
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const generateQRFromPatient = async (patient: QRData) => {
    try {
      const qrText = JSON.stringify(patient);
      const qrCodeDataURL = await QRCode.toDataURL(qrText, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataURL(qrCodeDataURL);
      setShowQRCode(true);

      toast({
        title: "QR Code Generated",
        description: `QR code for patient ${patient.patientId} generated`,
      });
    } catch (error) {
      toast({
        title: t.copyFailed,
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  // User Setup Modal
  if (showUserSetup) {
    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-md mx-auto mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t.setUserName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-name">{t.userName}</Label>
              <Input
                id="user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t.enterUserName}
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => {
                if (userName.trim()) {
                  localStorage.setItem("userName", userName.trim());
                  setShowUserSetup(false);
                }
              }}
              className="w-full"
              disabled={!userName.trim()}
            >
              {t.setUserName}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Version Conflict Resolution Modal
  if (showVersionConflict && conflictData) {
    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              {t.conflictResolution}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              A newer version of this patient record has been detected. Choose
              which version to keep:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-600">
                    Incoming Version
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <div>
                    <strong>{t.lastUpdatedBy}:</strong>{" "}
                    {conflictData.incoming.lastUpdatedBy}
                  </div>
                  <div>
                    <strong>{t.deviceId}:</strong>{" "}
                    {conflictData.incoming.deviceId}
                  </div>
                  <div>
                    <strong>{t.lastUpdated}:</strong>{" "}
                    {new Date(
                      conflictData.incoming.lastUpdated
                    ).toLocaleString()}
                  </div>
                  <div>
                    <strong>{t.version}:</strong>{" "}
                    {conflictData.incoming.distributedVersion}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-600">
                    Current Version
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                  <div>
                    <strong>{t.lastUpdatedBy}:</strong>{" "}
                    {conflictData.current.lastUpdatedBy}
                  </div>
                  <div>
                    <strong>{t.deviceId}:</strong>{" "}
                    {conflictData.current.deviceId}
                  </div>
                  <div>
                    <strong>{t.lastUpdated}:</strong>{" "}
                    {new Date(
                      conflictData.current.lastUpdated
                    ).toLocaleString()}
                  </div>
                  <div>
                    <strong>{t.version}:</strong>{" "}
                    {conflictData.current.distributedVersion}
                  </div>
                </CardContent>
              </Card>
            </div>

            {conflictData.changes.length > 0 && (
              <Card className="bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.changedFields}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {conflictData.changes.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => resolveVersionConflict(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {t.acceptIncoming}
              </Button>
              <Button
                onClick={() => resolveVersionConflict(false)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {t.keepCurrent}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR Code Display Modal
  if (showQRCode) {
    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t.qrCodeGenerated}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRCode(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <img
                src={qrCodeDataURL || "/placeholder.svg"}
                alt="QR Code"
                className="mx-auto"
              />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <strong>{t.version}:</strong> {data.version}
              </div>
              <div>
                <strong>{t.lastUpdatedBy}:</strong> {data.lastUpdatedBy}
              </div>
              <div>
                <strong>{t.lastUpdated}:</strong>{" "}
                {new Date(data.lastUpdated).toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-gray-600">{t.scanToImport}</p>
            <Button onClick={() => setShowQRCode(false)} className="w-full">
              {t.closeQrCode}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // QR Scanner Modal
  if (showScanner) {
    return (
      <div
        className={`min-h-screen bg-black p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-md mx-auto bg-black border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between text-white">
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                {t.scanningQrCode}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopScanning}
                className="text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                autoPlay
                playsInline
                muted
                style={{ maxHeight: "300px" }}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-500"></div>
              </div>
            </div>
            <p className="text-sm text-gray-300 text-center">
              {t.pointCameraAtQr}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={simulateQRScan}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Simulate Scan (Demo)
              </Button>
              <Button
                variant="outline"
                onClick={stopScanning}
                className="flex-1 bg-transparent"
              >
                {t.stopScanning}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Import Confirmation Modal
  if (showImportConfirm && importedData) {
    const existingPatient = patientList.find(
      (p) => p.patientId === importedData.patientId
    );
    const isNewer = existingPatient
      ? new Date(importedData.lastUpdated).getTime() >
        new Date(existingPatient.lastUpdated).getTime()
      : true;
    const versionDiff = existingPatient
      ? importedData.distributedVersion - existingPatient.distributedVersion
      : 0;

    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.importedAssessment}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t.triageNote}</h3>
              <p className="text-sm leading-relaxed">{importedData.summary}</p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-1">{t.patientId}</div>
                <div className="text-2xl font-bold text-green-800 tracking-wider">
                  {importedData.patientId}
                </div>
              </div>
            </div>

            {/* Version Information */}
            <Card
              className={`${
                isNewer
                  ? "border-green-200 bg-green-50"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t.syncStatus}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>{t.lastUpdatedBy}:</strong>{" "}
                    {importedData.lastUpdatedBy}
                  </div>
                  <div>
                    <strong>{t.deviceId}:</strong> {importedData.deviceId}
                  </div>
                  <div>
                    <strong>{t.version}:</strong>{" "}
                    {importedData.distributedVersion}
                  </div>
                  <div>
                    <strong>{t.lastUpdated}:</strong>{" "}
                    {new Date(importedData.lastUpdated).toLocaleString()}
                  </div>
                </div>
                {existingPatient && (
                  <div
                    className={`mt-2 p-2 rounded ${
                      isNewer ? "bg-green-100" : "bg-orange-100"
                    }`}
                  >
                    {isNewer ? (
                      <div className="text-green-700 text-xs">
                        ✓ {t.newerVersionAvailable} (+{versionDiff} versions)
                      </div>
                    ) : (
                      <div className="text-orange-700 text-xs">
                        ⚠ {t.olderVersionIgnored}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Log */}
            {importedData.changeLog && importedData.changeLog.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {t.changeHistory}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {importedData.changeLog.slice(0, 3).map((entry, index) => (
                      <div
                        key={index}
                        className="text-xs bg-gray-50 p-2 rounded"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{entry.updatedBy}</span>
                          <span className="text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.changes.map((change) => (
                            <Badge
                              key={change}
                              variant="outline"
                              className="text-xs"
                            >
                              {change}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <strong>Name:</strong> {importedData.assessment.name || "N/A"}
              </div>
              <div>
                <strong>Age:</strong> {importedData.assessment.age || "N/A"}
              </div>
              <div>
                <strong>Gender:</strong>{" "}
                {importedData.assessment.gender || "N/A"}
              </div>
              <div>
                <strong>GCS:</strong> {importedData.assessment.gcs}
              </div>
              <div>
                <strong>HR:</strong>{" "}
                {importedData.assessment.heartRate || "N/A"}
              </div>
              <div>
                <strong>BP:</strong>{" "}
                {importedData.assessment.bloodPressure || "N/A"}
              </div>
              <div>
                <strong>RR:</strong>{" "}
                {importedData.assessment.respiratoryRate || "N/A"}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p>
                Imported: {new Date(importedData.timestamp).toLocaleString()}
              </p>
              <p>Language: {importedData.language}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={confirmImport}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {t.confirmImport}
              </Button>
              <Button
                variant="outline"
                onClick={cancelImport}
                className="flex-1 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                {t.cancelImport}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Deceased Confirmation Modal
  if (showDeceasedConfirm && patientToUpdate) {
    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              {t.confirmDeceased}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">{t.confirmDeceasedMessage}</p>

            <div>
              <Label htmlFor="time-of-death">{t.timeOfDeath}</Label>
              <Input
                id="time-of-death"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deceased-notes">{t.outcomeNotes}</Label>
              <Textarea
                id="deceased-notes"
                placeholder={t.enterOutcomeNotes}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  const timeInput = document.getElementById(
                    "time-of-death"
                  ) as HTMLInputElement;
                  const notesInput = document.getElementById(
                    "deceased-notes"
                  ) as HTMLTextAreaElement;
                  updatePatientOutcome(
                    patientToUpdate,
                    "deceased",
                    notesInput.value,
                    timeInput.value
                  );
                  setShowDeceasedConfirm(false);
                  setPatientToUpdate(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {t.confirmDeceasedButton}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeceasedConfirm(false);
                  setPatientToUpdate(null);
                }}
                className="flex-1"
              >
                {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Change History View
  if (currentView === "changeHistory" && selectedPatient) {
    return (
      <div
        className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <h1 className="text-lg font-bold">{t.changeHistory}</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("patientDetail")}
              className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              {t.backToList}
            </Button>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">{t.patientId}</div>
              <div className="text-3xl font-bold tracking-wider">
                {selectedPatient.patientId}
              </div>
              {selectedPatient.assessment.name && (
                <div className="text-lg mt-1">
                  {selectedPatient.assessment.name}
                </div>
              )}
            </div>
          </div>

          {selectedPatient.changeLog && selectedPatient.changeLog.length > 0 ? (
            <div className="space-y-3">
              {selectedPatient.changeLog.map((entry, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">
                          {entry.updatedBy}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {entry.deviceId}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        {t.changedFields}:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.changes.map((change) => (
                          <Badge
                            key={change}
                            variant="outline"
                            className="text-xs"
                          >
                            {change}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">{t.noChanges}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (showSummary) {
    // Use editableData if we're editing a patient, otherwise use data for new assessments
    const summaryData = selectedPatient ? editableData : data;
    const summary = selectedPatient
      ? generateSummaryFromData(summaryData)
      : generateSummary();

    return (
      <div
        className={`min-h-screen bg-gray-50 p-4 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.assessmentSummary}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                <Languages className="h-4 w-4 mr-2" />
                {language === "en" ? "العربية" : "English"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-1">{t.patientId}</div>
                <div className="text-3xl font-bold tracking-wider">
                  {summaryData.patientId}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{t.triageNote}</h3>
              <p className="text-sm leading-relaxed">{summary}</p>
            </div>

            {/* Version Information */}
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Record Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>
                  <strong>{t.lastUpdatedBy}:</strong>{" "}
                  {summaryData.lastUpdatedBy}
                </div>
                <div>
                  <strong>{t.deviceId}:</strong> {summaryData.deviceId}
                </div>
                <div>
                  <strong>{t.version}:</strong> {summaryData.version}
                </div>
                <div>
                  <strong>{t.lastUpdated}:</strong>{" "}
                  {new Date(summaryData.lastUpdated).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Outcome Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.outcome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={summaryData.outcome}
                  onValueChange={(value: AssessmentData["outcome"]) => {
                    if (value === "deceased") {
                      setPatientToUpdate(summaryData.patientId);
                      setShowDeceasedConfirm(true);
                    } else {
                      if (selectedPatient) {
                        updateEditableData("outcome", value);
                      } else {
                        const oldData = { ...data };
                        updateData("outcome", value);
                        // Save with detected changes
                        setTimeout(() => {
                          const changes = detectChanges(oldData, {
                            ...data,
                            outcome: value,
                          });
                          saveCurrentAssessment(changes);
                        }, 100);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t.pending}</SelectItem>
                    <SelectItem value="survived">{t.survived}</SelectItem>
                    <SelectItem value="deceased">{t.deceased}</SelectItem>
                    <SelectItem value="discharged">{t.discharged}</SelectItem>
                    <SelectItem value="transferred">{t.transferred}</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <Label htmlFor="outcome-notes">{t.outcomeNotes}</Label>
                  <Textarea
                    id="outcome-notes"
                    value={summaryData.outcomeNotes}
                    onChange={(e) => {
                      if (selectedPatient) {
                        updateEditableData("outcomeNotes", e.target.value);
                      } else {
                        updateData("outcomeNotes", e.target.value);
                      }
                    }}
                    placeholder={t.enterOutcomeNotes}
                    rows={2}
                  />
                </div>

                <div
                  className={`px-3 py-2 rounded-lg text-sm ${getOutcomeColor(
                    summaryData.outcome
                  )}`}
                >
                  {t.outcome}: {t[summaryData.outcome]}
                </div>
              </CardContent>
            </Card>

            {summaryData.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {t.location}: {summaryData.location}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-4">
              <Button onClick={() => shareAssessment()} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                {t.share}
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(summary)}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t.copy}
              </Button>
              <Button
                onClick={() => {
                  if (selectedPatient) {
                    generateQRFromPatient(selectedPatient);
                  } else {
                    generateQRCode();
                  }
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {t.generateQrCode}
              </Button>
              <Button
                onClick={() => setShowScanner(true)}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                {t.scanQrCode}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setShowSummary(false);
                // Return to appropriate view
                if (selectedPatient) {
                  setCurrentView("patientDetail");
                }
              }}
              className="w-full"
            >
              {selectedPatient ? "Back to Edit Patient" : t.backToAssessment}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard View
  if (currentView === "dashboard") {
    const stats = getStatistics();
    return (
      <div
        className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h1 className="text-lg font-bold">{t.dashboard}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("patientList")}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                <FileText className="h-4 w-4 mr-1" />
                {t.patientList}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === "en" ? "العربية" : "English"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.summaryStatistics}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">{t.totalPatients}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.deceased}
                  </div>
                  <div className="text-sm text-gray-600">{t.totalDeaths}</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.mortalityRate}%
                  </div>
                  <div className="text-sm text-gray-600">{t.mortalityRate}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.followUpNeeded}
                  </div>
                  <div className="text-sm text-gray-600">{t.needsFollowUp}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.outcomeBreakdown}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    {t.pending}
                  </span>
                  <span className="font-semibold">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    {t.survived}
                  </span>
                  <span className="font-semibold">{stats.survived}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    {t.deceased}
                  </span>
                  <span className="font-semibold">{stats.deceased}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    {t.discharged}
                  </span>
                  <span className="font-semibold">{stats.discharged}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    {t.transferred}
                  </span>
                  <span className="font-semibold">{stats.transferred}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.triageBreakdown}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      {t.redPriority}
                    </span>
                    <span className="font-semibold">
                      {stats.triage.red.total} ({stats.triage.red.deceased}{" "}
                      {t.deceased.toLowerCase()})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      {t.yellowPriority}
                    </span>
                    <span className="font-semibold">
                      {stats.triage.yellow.total} (
                      {stats.triage.yellow.deceased} {t.deceased.toLowerCase()})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      {t.greenPriority}
                    </span>
                    <span className="font-semibold">
                      {stats.triage.green.total} ({stats.triage.green.deceased}{" "}
                      {t.deceased.toLowerCase()})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {stats.followUpNeeded > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  {t.followUpNeeded}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  {stats.followUpNeeded} {t.redPatientNoOutcome}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Patient List View
  if (currentView === "patientList") {
    return (
      <div
        className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-lg font-bold">{t.patientList}</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                {t.dashboard}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("assessment")}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                {t.newAssessment}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Languages className="h-4 w-4 mr-2" />
                {language === "en" ? "العربية" : "English"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <div className="mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPatients}
              className="w-full"
            />
          </div>

          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">{t.noPatients}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => {
                const priority = getTriagePriority(patient.assessment);
                const priorityText =
                  priority === "red"
                    ? t.high
                    : priority === "yellow"
                    ? t.medium
                    : t.low;
                const needsFollowUpFlag = needsFollowUp(patient);

                return (
                  <Card
                    key={patient.patientId}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      needsFollowUpFlag ? "border-orange-300 bg-orange-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setCurrentView("patientDetail");
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full ${getTriageColor(
                              priority
                            )}`}
                          ></div>
                          <div className="font-bold text-lg">
                            {patient.patientId}
                          </div>
                          {patient.assessment.name && (
                            <div className="text-gray-600">
                              ({patient.assessment.name})
                            </div>
                          )}
                          {needsFollowUpFlag && (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-300"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {t.followUpNeeded}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateQRFromPatient(patient);
                            }}
                            className="p-1"
                          >
                            <QrCode className="h-3 w-3" />
                          </Button>
                          <div className="text-xs text-gray-500">
                            <div>v{patient.distributedVersion}</div>
                            <div>
                              {new Date(
                                patient.lastUpdated
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 mb-2">
                        {patient.summary.length > 100
                          ? `${patient.summary.substring(0, 100)}...`
                          : patient.summary}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-4">
                          <span>GCS: {patient.assessment.gcs}</span>
                          {patient.assessment.heartRate && (
                            <span>HR: {patient.assessment.heartRate}</span>
                          )}
                          {patient.assessment.bloodPressure && (
                            <span>BP: {patient.assessment.bloodPressure}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <div
                            className={`px-2 py-1 rounded text-white ${getTriageColor(
                              priority
                            )}`}
                          >
                            {priorityText}
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${getOutcomeColor(
                              patient.assessment.outcome
                            )}`}
                          >
                            {t[patient.assessment.outcome]}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {t.lastUpdatedBy}: {patient.lastUpdatedBy} (
                        {patient.deviceId})
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Patient Detail View - Make it editable
  if (currentView === "patientDetail" && selectedPatient) {
    return (
      <div
        className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-lg font-bold">Edit Patient</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={savePatientChanges}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  // Generate summary for the selected patient and show it
                  setShowSummary(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="h-4 w-4 mr-1" />
                {t.generateSummary}
              </Button>
              <Button
                onClick={() => generateQRFromPatient(selectedPatient)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <QrCode className="h-4 w-4 mr-1" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("patientList")}
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto">
          <Tabs defaultValue="patient">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="patient" className="text-xs">
                Info
              </TabsTrigger>
              <TabsTrigger value="airway" className="text-xs">
                {language === "ar" ? "أ" : "A"}
              </TabsTrigger>
              <TabsTrigger value="breathing" className="text-xs">
                {language === "ar" ? "ب" : "B"}
              </TabsTrigger>
              <TabsTrigger value="circulation" className="text-xs">
                {language === "ar" ? "ج" : "C"}
              </TabsTrigger>
              <TabsTrigger value="disability" className="text-xs">
                {language === "ar" ? "د" : "D"}
              </TabsTrigger>
              <TabsTrigger value="exposure" className="text-xs">
                {language === "ar" ? "هـ" : "E"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <Card>
                <CardHeader>
                  <CardTitle>{t.patientInformation}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 mb-4">
                    <div className="text-2xl font-bold text-center text-blue-800 tracking-wider">
                      {editableData.patientId}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="edit-patient-name">{t.patientName}</Label>
                      <Input
                        id="edit-patient-name"
                        value={editableData.name}
                        onChange={(e) =>
                          updateEditableData("name", e.target.value)
                        }
                        placeholder={t.enterPatientName}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-age">{t.age}</Label>
                      <Input
                        id="edit-age"
                        value={editableData.age}
                        onChange={(e) =>
                          updateEditableData("age", e.target.value)
                        }
                        placeholder={t.years}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">{t.gender}</Label>
                      <Select
                        value={editableData.gender}
                        onValueChange={(value) =>
                          updateEditableData("gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">{t.male}</SelectItem>
                          <SelectItem value="F">{t.female}</SelectItem>
                          <SelectItem value="NB">{t.nonBinary}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Outcome Section */}
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t.outcome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select
                        value={editableData.outcome}
                        onValueChange={(value: AssessmentData["outcome"]) => {
                          if (value === "deceased") {
                            setPatientToUpdate(editableData.patientId);
                            setShowDeceasedConfirm(true);
                          } else {
                            updateEditableData("outcome", value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t.pending}</SelectItem>
                          <SelectItem value="survived">{t.survived}</SelectItem>
                          <SelectItem value="deceased">{t.deceased}</SelectItem>
                          <SelectItem value="discharged">
                            {t.discharged}
                          </SelectItem>
                          <SelectItem value="transferred">
                            {t.transferred}
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div>
                        <Label htmlFor="edit-outcome-notes">
                          {t.outcomeNotes}
                        </Label>
                        <Textarea
                          id="edit-outcome-notes"
                          value={editableData.outcomeNotes}
                          onChange={(e) =>
                            updateEditableData("outcomeNotes", e.target.value)
                          }
                          placeholder={t.enterOutcomeNotes}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="airway">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {language === "ar" ? "أ" : "A"}
                    </Badge>
                    {t.airway}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editableData.airwayPatent}
                      onCheckedChange={(checked) =>
                        updateEditableData("airwayPatent", checked)
                      }
                    />
                    <Label>{t.airwayPatent}</Label>
                  </div>

                  {!editableData.airwayPatent && (
                    <div>
                      <Label>{t.obstructionDetails}</Label>
                      <Input
                        value={editableData.airwayObstruction}
                        onChange={(e) =>
                          updateEditableData(
                            "airwayObstruction",
                            e.target.value
                          )
                        }
                        placeholder={t.describeObstruction}
                      />
                    </div>
                  )}

                  <div>
                    <Label>{t.interventions}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { en: "Suction", ar: "شفط" },
                        { en: "OPA", ar: "أنبوب فموي بلعومي" },
                        { en: "NPA", ar: "أنبوب أنفي بلعومي" },
                        { en: "Intubation", ar: "التنبيب" },
                      ].map((intervention) => (
                        <div
                          key={intervention.en}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={editableData.airwayInterventions.includes(
                              intervention.en
                            )}
                            onCheckedChange={() =>
                              toggleEditableArrayItem(
                                "airwayInterventions",
                                intervention.en
                              )
                            }
                          />
                          <Label className="text-sm">
                            {language === "ar"
                              ? intervention.ar
                              : intervention.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breathing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {language === "ar" ? "ب" : "B"}
                    </Badge>
                    {t.breathing}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.respiratoryRate}</Label>
                      <Input
                        value={editableData.respiratoryRate}
                        onChange={(e) =>
                          updateEditableData("respiratoryRate", e.target.value)
                        }
                        placeholder={t.bpm}
                        type="number"
                      />
                    </div>
                    <div>
                      <Label>SpO₂</Label>
                      <Input
                        value={editableData.spO2}
                        onChange={(e) =>
                          updateEditableData("spO2", e.target.value)
                        }
                        placeholder="%"
                        type="number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t.oxygenSupport}</Label>
                    <Select
                      value={editableData.oxygenSupport}
                      onValueChange={(value) =>
                        updateEditableData("oxygenSupport", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Room Air">{t.roomAir}</SelectItem>
                        <SelectItem value="Nasal Cannula">
                          {t.nasalCannula}
                        </SelectItem>
                        <SelectItem value="Face Mask">{t.faceMask}</SelectItem>
                        <SelectItem value="Non-rebreather">
                          {t.nonRebreather}
                        </SelectItem>
                        <SelectItem value="BVM">{t.bvm}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.breathSounds}</Label>
                    <Select
                      value={editableData.breathSounds}
                      onValueChange={(value) =>
                        updateEditableData("breathSounds", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal vesicular">
                          {t.normalVesicular}
                        </SelectItem>
                        <SelectItem value="Diminished">
                          {t.diminished}
                        </SelectItem>
                        <SelectItem value="Absent">{t.absent}</SelectItem>
                        <SelectItem value="Wheeze">{t.wheeze}</SelectItem>
                        <SelectItem value="Crackles">{t.crackles}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.concerns}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { en: "Dyspnea", ar: "ضيق تنفس" },
                        { en: "Cyanosis", ar: "زرقة" },
                        { en: "Accessory muscles", ar: "عضلات مساعدة" },
                        { en: "Paradoxical", ar: "متناقض" },
                      ].map((concern) => (
                        <div
                          key={concern.en}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={editableData.breathingConcerns.includes(
                              concern.en
                            )}
                            onCheckedChange={() =>
                              toggleEditableArrayItem(
                                "breathingConcerns",
                                concern.en
                              )
                            }
                          />
                          <Label className="text-sm">
                            {language === "ar" ? concern.ar : concern.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="circulation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {language === "ar" ? "ج" : "C"}
                    </Badge>
                    {t.circulation}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.heartRate}</Label>
                      <Input
                        value={editableData.heartRate}
                        onChange={(e) =>
                          updateEditableData("heartRate", e.target.value)
                        }
                        placeholder={t.bpm}
                        type="number"
                      />
                    </div>
                    <div>
                      <Label>{t.bloodPressure}</Label>
                      <Input
                        value={editableData.bloodPressure}
                        onChange={(e) =>
                          updateEditableData("bloodPressure", e.target.value)
                        }
                        placeholder="120/80"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.capillaryRefill}</Label>
                      <Select
                        value={editableData.capillaryRefill}
                        onValueChange={(value) =>
                          updateEditableData("capillaryRefill", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<2s">{"<2s"}</SelectItem>
                          <SelectItem value="2-3s">2-3s</SelectItem>
                          <SelectItem value=">3s">{">3s"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.pulseQuality}</Label>
                      <Select
                        value={editableData.pulseQuality}
                        onValueChange={(value) =>
                          updateEditableData("pulseQuality", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Strong">{t.strong}</SelectItem>
                          <SelectItem value="Weak">{t.weak}</SelectItem>
                          <SelectItem value="Thready">{t.thready}</SelectItem>
                          <SelectItem value="Absent">{t.absent}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editableData.bleeding}
                      onCheckedChange={(checked) =>
                        updateEditableData("bleeding", checked)
                      }
                    />
                    <Label>{t.externalBleeding}</Label>
                  </div>

                  {editableData.bleeding && (
                    <div>
                      <Label>{t.bleedingLocation}</Label>
                      <Input
                        value={editableData.bleedingLocation}
                        onChange={(e) =>
                          updateEditableData("bleedingLocation", e.target.value)
                        }
                        placeholder={t.describeBleedingLocation}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disability">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {language === "ar" ? "د" : "D"}
                    </Badge>
                    {t.disability}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.gcsScore}</Label>
                      <Select
                        value={editableData.gcs}
                        onValueChange={(value) =>
                          updateEditableData("gcs", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 4).map(
                            (score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.pupils}</Label>
                      <Select
                        value={editableData.pupils}
                        onValueChange={(value) =>
                          updateEditableData("pupils", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PEARL">{t.pearl}</SelectItem>
                          <SelectItem value="Unequal">{t.unequal}</SelectItem>
                          <SelectItem value="Fixed dilated">
                            {t.fixedDilated}
                          </SelectItem>
                          <SelectItem value="Pinpoint">{t.pinpoint}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t.motorResponse}</Label>
                    <Select
                      value={editableData.motorResponse}
                      onValueChange={(value) =>
                        updateEditableData("motorResponse", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">{t.normal}</SelectItem>
                        <SelectItem value="Weakness">{t.weakness}</SelectItem>
                        <SelectItem value="Paralysis">{t.paralysis}</SelectItem>
                        <SelectItem value="Posturing">{t.posturing}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t.neurologicalConcerns}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { en: "Altered LOC", ar: "تغير مستوى الوعي" },
                        { en: "Confusion", ar: "تشوش" },
                        { en: "Seizure", ar: "نوبة صرع" },
                        { en: "Focal deficit", ar: "عجز بؤري" },
                      ].map((concern) => (
                        <div
                          key={concern.en}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={editableData.neurologicalConcerns.includes(
                              concern.en
                            )}
                            onCheckedChange={() =>
                              toggleEditableArrayItem(
                                "neurologicalConcerns",
                                concern.en
                              )
                            }
                          />
                          <Label className="text-sm">
                            {language === "ar" ? concern.ar : concern.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exposure">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {language === "ar" ? "هـ" : "E"}
                    </Badge>
                    {t.exposure}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t.temperature}</Label>
                      <Input
                        value={editableData.temperature}
                        onChange={(e) =>
                          updateEditableData("temperature", e.target.value)
                        }
                        placeholder="°C"
                      />
                    </div>
                    <div>
                      <Label>{t.skinCondition}</Label>
                      <Select
                        value={editableData.skinCondition}
                        onValueChange={(value) =>
                          updateEditableData("skinCondition", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">{t.normal}</SelectItem>
                          <SelectItem value="Pale">{t.pale}</SelectItem>
                          <SelectItem value="Flushed">{t.flushed}</SelectItem>
                          <SelectItem value="Cyanotic">{t.cyanotic}</SelectItem>
                          <SelectItem value="Diaphoretic">
                            {t.diaphoretic}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t.visibleInjuries}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { en: "Lacerations", ar: "جروح قطعية" },
                        { en: "Contusions", ar: "كدمات" },
                        { en: "Burns", ar: "حروق" },
                        { en: "Fractures", ar: "كسور" },
                        { en: "Deformity", ar: "تشوه" },
                        { en: "Swelling", ar: "تورم" },
                      ].map((injury) => (
                        <div
                          key={injury.en}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={editableData.injuries.includes(injury.en)}
                            onCheckedChange={() =>
                              toggleEditableArrayItem("injuries", injury.en)
                            }
                          />
                          <Label className="text-sm">
                            {language === "ar" ? injury.ar : injury.en}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>{t.additionalConcerns}</Label>
                    <Textarea
                      value={editableData.exposureConcerns}
                      onChange={(e) =>
                        updateEditableData("exposureConcerns", e.target.value)
                      }
                      placeholder={t.describeFindings}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>{t.additionalNotes}</Label>
                    <Textarea
                      value={editableData.additionalNotes}
                      onChange={(e) =>
                        updateEditableData("additionalNotes", e.target.value)
                      }
                      placeholder={t.clinicalNotes}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save button at bottom */}
          <div className="mt-6 flex gap-2">
            <Button
              onClick={savePatientChanges}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
            <Button
              onClick={() => setShowSummary(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t.generateSummary}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentView("patientList")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Assessment View
  return (
    <div
      className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h1 className="text-lg font-bold">{t.emergencyAssessment}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("patientList")}
              className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              <FileText className="h-4 w-4 mr-1" />
              {t.patientList}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === "en" ? "العربية" : "English"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="patient" className="text-xs">
              {t.info}
            </TabsTrigger>
            <TabsTrigger value="airway" className="text-xs">
              {language === "ar" ? "أ" : "A"}
            </TabsTrigger>
            <TabsTrigger value="breathing" className="text-xs">
              {language === "ar" ? "ب" : "B"}
            </TabsTrigger>
            <TabsTrigger value="circulation" className="text-xs">
              {language === "ar" ? "ج" : "C"}
            </TabsTrigger>
            <TabsTrigger value="disability" className="text-xs">
              {language === "ar" ? "د" : "D"}
            </TabsTrigger>
            <TabsTrigger value="exposure" className="text-xs">
              {language === "ar" ? "هـ" : "E"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <Card>
              <CardHeader>
                <CardTitle>{t.patientInformation}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-800 tracking-wider">
                      {data.patientId}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateData("patientId", generatePatientId());
                          toast({ title: t.idGenerated });
                        }}
                      >
                        {t.generateNewId}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomIdInput(!showCustomIdInput)}
                      >
                        {t.customId}
                      </Button>
                    </div>
                  </div>
                  {showCustomIdInput && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={customIdValue}
                        onChange={(e) =>
                          setCustomIdValue(e.target.value.toUpperCase())
                        }
                        placeholder={t.enterCustomId}
                        maxLength={10}
                      />
                      <Button
                        onClick={() => {
                          if (customIdValue.trim()) {
                            updateData("patientId", customIdValue.trim());
                            setCustomIdValue("");
                            setShowCustomIdInput(false);
                          }
                        }}
                        disabled={!customIdValue.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="patient-name">{t.patientName}</Label>
                    <Input
                      id="patient-name"
                      value={data.name}
                      onChange={(e) => updateData("name", e.target.value)}
                      placeholder={t.enterPatientName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">{t.age}</Label>
                    <Input
                      id="age"
                      value={data.age}
                      onChange={(e) => updateData("age", e.target.value)}
                      placeholder={t.years}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">{t.gender}</Label>
                    <Select
                      value={data.gender}
                      onValueChange={(value) => updateData("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">{t.male}</SelectItem>
                        <SelectItem value="F">{t.female}</SelectItem>
                        <SelectItem value="NB">{t.nonBinary}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={getLocation}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <MapPin className="h-4 w-4" />
                    {t.getLocation}
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 bg-transparent"
                    >
                      <Camera className="h-4 w-4" />
                      {t.addPhotos}
                    </Button>
                  </div>
                </div>

                {data.location && (
                  <div className="text-sm text-gray-600">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {t.location}: {data.location}
                  </div>
                )}

                {data.photos.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <Camera className="h-4 w-4 inline mr-1" />
                    {data.photos.length} {t.photosSelected}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="airway">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {language === "ar" ? "أ" : "A"}
                  </Badge>
                  {t.airway}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.airwayPatent}
                    onCheckedChange={(checked) =>
                      updateData("airwayPatent", checked)
                    }
                  />
                  <Label>{t.airwayPatent}</Label>
                </div>

                {!data.airwayPatent && (
                  <div>
                    <Label>{t.obstructionDetails}</Label>
                    <Input
                      value={data.airwayObstruction}
                      onChange={(e) =>
                        updateData("airwayObstruction", e.target.value)
                      }
                      placeholder={t.describeObstruction}
                    />
                  </div>
                )}

                <div>
                  <Label>{t.interventions}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { en: "Suction", ar: "شفط" },
                      { en: "OPA", ar: "أنبوب فموي بلعومي" },
                      { en: "NPA", ar: "أنبوب أنفي بلعومي" },
                      { en: "Intubation", ar: "التنبيب" },
                    ].map((intervention) => (
                      <div
                        key={intervention.en}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={data.airwayInterventions.includes(
                            intervention.en
                          )}
                          onCheckedChange={() =>
                            toggleArrayItem(
                              "airwayInterventions",
                              intervention.en
                            )
                          }
                        />
                        <Label className="text-sm">
                          {language === "ar"
                            ? intervention.ar
                            : intervention.en}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breathing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {language === "ar" ? "ب" : "B"}
                  </Badge>
                  {t.breathing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.respiratoryRate}</Label>
                    <Input
                      value={data.respiratoryRate}
                      onChange={(e) =>
                        updateData("respiratoryRate", e.target.value)
                      }
                      placeholder={t.bpm}
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>SpO₂</Label>
                    <Input
                      value={data.spO2}
                      onChange={(e) => updateData("spO2", e.target.value)}
                      placeholder="%"
                      type="number"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t.oxygenSupport}</Label>
                  <Select
                    value={data.oxygenSupport}
                    onValueChange={(value) =>
                      updateData("oxygenSupport", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Room Air">{t.roomAir}</SelectItem>
                      <SelectItem value="Nasal Cannula">
                        {t.nasalCannula}
                      </SelectItem>
                      <SelectItem value="Face Mask">{t.faceMask}</SelectItem>
                      <SelectItem value="Non-rebreather">
                        {t.nonRebreather}
                      </SelectItem>
                      <SelectItem value="BVM">{t.bvm}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.breathSounds}</Label>
                  <Select
                    value={data.breathSounds}
                    onValueChange={(value) => updateData("breathSounds", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal vesicular">
                        {t.normalVesicular}
                      </SelectItem>
                      <SelectItem value="Diminished">{t.diminished}</SelectItem>
                      <SelectItem value="Absent">{t.absent}</SelectItem>
                      <SelectItem value="Wheeze">{t.wheeze}</SelectItem>
                      <SelectItem value="Crackles">{t.crackles}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.concerns}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { en: "Dyspnea", ar: "ضيق تنفس" },
                      { en: "Cyanosis", ar: "زرقة" },
                      { en: "Accessory muscles", ar: "عضلات مساعدة" },
                      { en: "Paradoxical", ar: "متناقض" },
                    ].map((concern) => (
                      <div
                        key={concern.en}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={data.breathingConcerns.includes(concern.en)}
                          onCheckedChange={() =>
                            toggleArrayItem("breathingConcerns", concern.en)
                          }
                        />
                        <Label className="text-sm">
                          {language === "ar" ? concern.ar : concern.en}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="circulation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {language === "ar" ? "ج" : "C"}
                  </Badge>
                  {t.circulation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.heartRate}</Label>
                    <Input
                      value={data.heartRate}
                      onChange={(e) => updateData("heartRate", e.target.value)}
                      placeholder={t.bpm}
                      type="number"
                    />
                  </div>
                  <div>
                    <Label>{t.bloodPressure}</Label>
                    <Input
                      value={data.bloodPressure}
                      onChange={(e) =>
                        updateData("bloodPressure", e.target.value)
                      }
                      placeholder="120/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.capillaryRefill}</Label>
                    <Select
                      value={data.capillaryRefill}
                      onValueChange={(value) =>
                        updateData("capillaryRefill", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<2s">{"<2s"}</SelectItem>
                        <SelectItem value="2-3s">2-3s</SelectItem>
                        <SelectItem value=">3s">{">3s"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.pulseQuality}</Label>
                    <Select
                      value={data.pulseQuality}
                      onValueChange={(value) =>
                        updateData("pulseQuality", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strong">{t.strong}</SelectItem>
                        <SelectItem value="Weak">{t.weak}</SelectItem>
                        <SelectItem value="Thready">{t.thready}</SelectItem>
                        <SelectItem value="Absent">{t.absent}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.bleeding}
                    onCheckedChange={(checked) =>
                      updateData("bleeding", checked)
                    }
                  />
                  <Label>{t.externalBleeding}</Label>
                </div>

                {data.bleeding && (
                  <div>
                    <Label>{t.bleedingLocation}</Label>
                    <Input
                      value={data.bleedingLocation}
                      onChange={(e) =>
                        updateData("bleedingLocation", e.target.value)
                      }
                      placeholder={t.describeBleedingLocation}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {language === "ar" ? "د" : "D"}
                  </Badge>
                  {t.disability}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.gcsScore}</Label>
                    <Select
                      value={data.gcs}
                      onValueChange={(value) => updateData("gcs", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 4).map(
                          (score) => (
                            <SelectItem key={score} value={score.toString()}>
                              {score}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.pupils}</Label>
                    <Select
                      value={data.pupils}
                      onValueChange={(value) => updateData("pupils", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEARL">{t.pearl}</SelectItem>
                        <SelectItem value="Unequal">{t.unequal}</SelectItem>
                        <SelectItem value="Fixed dilated">
                          {t.fixedDilated}
                        </SelectItem>
                        <SelectItem value="Pinpoint">{t.pinpoint}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t.motorResponse}</Label>
                  <Select
                    value={data.motorResponse}
                    onValueChange={(value) =>
                      updateData("motorResponse", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">{t.normal}</SelectItem>
                      <SelectItem value="Weakness">{t.weakness}</SelectItem>
                      <SelectItem value="Paralysis">{t.paralysis}</SelectItem>
                      <SelectItem value="Posturing">{t.posturing}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t.neurologicalConcerns}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { en: "Altered LOC", ar: "تغير مستوى الوعي" },
                      { en: "Confusion", ar: "تشوش" },
                      { en: "Seizure", ar: "نوبة صرع" },
                      { en: "Focal deficit", ar: "عجز بؤري" },
                    ].map((concern) => (
                      <div
                        key={concern.en}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={data.neurologicalConcerns.includes(
                            concern.en
                          )}
                          onCheckedChange={() =>
                            toggleArrayItem("neurologicalConcerns", concern.en)
                          }
                        />
                        <Label className="text-sm">
                          {language === "ar" ? concern.ar : concern.en}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exposure">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">
                    {language === "ar" ? "هـ" : "E"}
                  </Badge>
                  {t.exposure}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.temperature}</Label>
                    <Input
                      value={data.temperature}
                      onChange={(e) =>
                        updateData("temperature", e.target.value)
                      }
                      placeholder="°C"
                    />
                  </div>
                  <div>
                    <Label>{t.skinCondition}</Label>
                    <Select
                      value={data.skinCondition}
                      onValueChange={(value) =>
                        updateData("skinCondition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">{t.normal}</SelectItem>
                        <SelectItem value="Pale">{t.pale}</SelectItem>
                        <SelectItem value="Flushed">{t.flushed}</SelectItem>
                        <SelectItem value="Cyanotic">{t.cyanotic}</SelectItem>
                        <SelectItem value="Diaphoretic">
                          {t.diaphoretic}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t.visibleInjuries}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { en: "Lacerations", ar: "جروح قطعية" },
                      { en: "Contusions", ar: "كدمات" },
                      { en: "Burns", ar: "حروق" },
                      { en: "Fractures", ar: "كسور" },
                      { en: "Deformity", ar: "تشوه" },
                      { en: "Swelling", ar: "تورم" },
                    ].map((injury) => (
                      <div
                        key={injury.en}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={data.injuries.includes(injury.en)}
                          onCheckedChange={() =>
                            toggleArrayItem("injuries", injury.en)
                          }
                        />
                        <Label className="text-sm">
                          {language === "ar" ? injury.ar : injury.en}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>{t.additionalConcerns}</Label>
                  <Textarea
                    value={data.exposureConcerns}
                    onChange={(e) =>
                      updateData("exposureConcerns", e.target.value)
                    }
                    placeholder={t.describeFindings}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t.additionalNotes}</Label>
                  <Textarea
                    value={data.additionalNotes}
                    onChange={(e) =>
                      updateData("additionalNotes", e.target.value)
                    }
                    placeholder={t.clinicalNotes}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-2 mt-6">
          <Button
            onClick={() => {
              saveCurrentAssessment();
              setShowSummary(true);
            }}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t.generateSummary}
          </Button>
          <Button
            onClick={() => setShowScanner(true)}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            <ScanLine className="h-4 w-4 mr-2" />
            {t.scanQrCode}
          </Button>
        </div>
      </div>
      {showScanner && (
        <QRScanner
          onDetected={handleQRScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
