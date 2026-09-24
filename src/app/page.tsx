"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  FileText, 
  Plus, 
  Search, 
  Heart, 
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  RotateCcw,
  ShieldAlert,
  TestTube,
  XCircle,
  Printer,
  Save,
  Calendar,
  History,
  FilePlus,
  Edit,
  UserCheck,
  AlertCircle,
  Stethoscope,
  Scale,
  Apple,
  Target,
  Pill,
  User,
  ClipboardList,
  Clock,
  CheckSquare,
  UserCog,
  Gift,
  Bell,
  Send,
  PhoneCall,
  MessageSquare,
  Smartphone,
  Receipt,
  CreditCard,
  Banknote,
  Lock,
  Mail,
  LogOut,
  ShieldCheck,
  Key,
  FolderOpen,
  Upload,
  Download,
  FileCheck,
  FolderPlus,
  TrendingUp,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Patient {
  id: string;
  name: string;
  birth_date: string;
  birth_number: string;
  gender?: string;
  address?: string;
  insurance_company?: string;
  phone?: string;
  email?: string;
  allergies?: string;
  diet_preference?: string;
  activity_level?: string;
  patient_goal?: string;
  medications?: string;
  abpm_status: string;
  status: string;
  notes?: string;
  is_test?: boolean;
  deleted_at?: string | null;
  created_by?: string;
  updated_by?: string;
}

interface PatientReport {
  id?: string;
  patient_id: string;
  report_date: string;
  doc_title: string;
  weight: string;
  height: string;
  bp: string;
  pulse: string;
  anamnesis: string;
  diagnosis: string;
  abpm_summary: string;
  nutritional_plan: string;
  conclusion: string;
  created_by?: string;
}

interface PatientTask {
  id?: string;
  patient_id: string;
  task_title: string;
  assigned_to: string;
  due_date: string;
  status: "Plánováno" | "Dokončeno";
  created_by?: string;
}

interface PatientPayment {
  id: string;
  patient_id: string;
  title: string;
  price: number;
  payment_date: string;
  created_at?: string;
}

interface PatientMedicalDoc {
  id: string;
  patient_id: string;
  title: string;
  file_url: string;
  file_size?: string;
  created_at?: string;
}

interface SmsQueueItem {
  id: string;
  patient_id: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

interface ReceiptItem {
  id: string;
  title: string;
  price: number;
}

interface ClinicDocument {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_size?: string;
  created_at: string;
  uploaded_by?: string;
}

interface AuditLog {
  id: string;
  user_email: string;
  action_type: string;
  description: string;
  created_at: string;
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
   
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [secretAdminKey, setSecretAdminKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [activeTab, setActiveTab] = useState("patients");
  const [showTrash, setShowTrash] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [globalPatientSearch, setGlobalPatientSearch] = useState("");

  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [patientDetailTab, setPatientDetailTab] = useState<"info" | "reports" | "payments" | "meddocs">("info");
  const [patientPayments, setPatientPayments] = useState<PatientPayment[]>([]);
  const [patientMedDocs, setPatientMedDocs] = useState<PatientMedicalDoc[]>([]);
  const [newPayTitle, setNewPayTitle] = useState("");
  const [newPayPrice, setNewPayPrice] = useState("");
  const [uploadingMedDoc, setUploadingMedDoc] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"personal" | "nutritional">("personal");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});
  const [formErrorMsg, setFormErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    birth_number: "",
    gender: "Muž",
    address: "",
    insurance_company: "VZP (111)",
    phone: "",
    email: "",
    allergies: "",
    diet_preference: "Všežravec (Standard)",
    activity_level: "Střední aktivita",
    patient_goal: "Redukce hmotnosti a úprava jídelníčku",
    medications: "",
    notes: "",
    is_test: false
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [savedReports, setSavedReports] = useState<PatientReport[]>([]);
  const [patientTasks, setPatientTasks] = useState<PatientTask[]>([]);
  const [smsQueue, setSmsQueue] = useState<SmsQueueItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [savingReport, setSavingReport] = useState(false);

  const [docCategories, setDocCategories] = useState<string[]>([]);
  const [activeDocCategory, setActiveDocCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [documents, setDocuments] = useState<ClinicDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [progressNotes, setProgressNotes] = useState("");

  const [newTaskCategory, setNewTaskCategory] = useState("🩺 Vyšetření");
  const [newTaskDetail, setNewTaskDetail] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Sestra");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);

  const [receiptPatientName, setReceiptPatientName] = useState("");
  const [receiptPatientAddress, setReceiptPatientAddress] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptNumber, setReceiptNumber] = useState("UCT-" + new Date().getFullYear() + "-001");
  const [paymentMethod, setPaymentMethod] = useState("Hotově");
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([
    { id: "1", title: "Vstupní nutriční vyšetření & komplexní konzultace", price: 950 },
    { id: "2", title: "Analýza tělesného složení (InBody / bioimpedance)", price: 350 }
  ]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const [currentReport, setCurrentReport] = useState<PatientReport>({
    patient_id: "",
    report_date: new Date().toISOString().split("T")[0],
    doc_title: "AMBULANTNÍ DEKURZ / NUTRIČNÍ ZPRÁVA",
    weight: "",
    height: "",
    bp: "",
    pulse: "",
    anamnesis: "",
    diagnosis: "",
    abpm_summary: "",
    nutritional_plan: "",
    conclusion: ""
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await supabase.auth.signOut();
        setSession(null);
        alert("Byl jste automaticky odhlášen kvůli nečinnosti z bezpečnostních důvodů.");
      }, 15 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logAction = async (actionType: string, description: string) => {
    if (!session?.user?.email) return;
    await supabase.from("audit_logs").insert([
      {
        user_email: session.user.email,
        action_type: actionType,
        description: description
      }
    ]);
    fetchAuditLogs();
  };

  const fetchAuditLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setAuditLogs(data);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    setAuthenticating(true);

    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError("Chyba přihlášení: " + error.message);
      } else {
        await logAction("PŘIHLÁŠENÍ", "Uživatel se přihlásil do systému.");
      }
    } else {
      const expectedSecret = "ambulance2026";
      if (secretAdminKey !== expectedSecret) {
        setAuthError("Chyba: Zadaný tajný bezpečnostní klíč pro registraci je nesprávný!");
        setAuthenticating(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError("Chyba registrace: " + error.message);
      } else {
        setAuthSuccessMsg("Úspěch! Účet byl vytvořen. Nyní se můžete přihlásit.");
        setAuthMode("login");
      }
    }
    setAuthenticating(false);
  };

  const handleLogout = async () => {
    await logAction("ODHLÁŠENÍ", "Uživatel se odhlásil ze systému.");
    await supabase.auth.signOut();
    setAuthEmail("");
    setAuthPassword("");
    setSecretAdminKey("");
  };

  const fetchPatients = async () => {
    setLoading(true);
    let query = supabase.from("patients").select("*").order("created_at", { ascending: false });

    if (showTrash) {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Chyba při načítání pacientů:", error);
    } else {
      setPatients(data || []);
      if (data && data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data[0].id);
        setReceiptPatientName(data[0].name);
        setReceiptPatientAddress(data[0].address || "");
      }
    }
    setLoading(false);
  };

  const fetchPatientReports = async (patientId: string) => {
    if (!patientId) return;
    const { data, error } = await supabase
      .from("patient_reports")
      .select("*")
      .eq("patient_id", patientId)
      .order("report_date", { ascending: true });

    if (!error && data) {
      setSavedReports(data);
    }
  };

  const fetchPatientTasks = async (patientId: string) => {
    if (!patientId) return;
    const { data, error } = await supabase
      .from("patient_tasks")
      .select("*")
      .eq("patient_id", patientId)
      .order("due_date", { ascending: true });

    if (!error && data) {
      setPatientTasks(data);
    } else {
      setPatientTasks([]);
    }
  };

  const fetchPatientPayments = async (patientId: string) => {
    if (!patientId) return;
    const { data, error } = await supabase
      .from("patient_payments")
      .select("*")
      .eq("patient_id", patientId)
      .order("payment_date", { ascending: false });

    if (!error && data) {
      setPatientPayments(data);
    } else {
      setPatientPayments([]);
    }
  };

  const fetchPatientMedDocs = async (patientId: string) => {
    if (!patientId) return;
    const { data, error } = await supabase
      .from("patient_medical_docs")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPatientMedDocs(data);
    } else {
      setPatientMedDocs([]);
    }
  };

  const fetchSmsQueue = async () => {
    const { data, error } = await supabase
      .from("sms_queue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setSmsQueue(data);
    }
  };

  const fetchCategoriesAndDocs = async () => {
    const { data: catData, error: catError } = await supabase
      .from("doc_categories")
      .select("name")
      .order("created_at", { ascending: true });

    if (!catError && catData) {
      const cats = catData.map(c => c.name);
      setDocCategories(cats);
      if (cats.length > 0 && !activeDocCategory) {
        setActiveDocCategory(cats[0]);
      }
    }

    const { data: docData, error: docError } = await supabase
      .from("clinic_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (!docError && docData) {
      setDocuments(docData);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPatients();
      fetchSmsQueue();
      fetchCategoriesAndDocs();
      fetchAuditLogs();
    }
  }, [showTrash, session]);

  useEffect(() => {
    if (selectedPatientId && session) {
      fetchPatientReports(selectedPatientId);
      fetchPatientTasks(selectedPatientId);
      setCurrentReport(prev => ({ ...prev, patient_id: selectedPatientId, id: undefined }));
       
      const p = patients.find(pat => pat.id === selectedPatientId);
      if (p) {
        setReceiptPatientName(p.name);
        setReceiptPatientAddress(p.address || "");
      }
    }
  }, [selectedPatientId, session]);

  useEffect(() => {
    if (viewingPatientId) {
      fetchPatientPayments(viewingPatientId);
      fetchPatientMedDocs(viewingPatientId);
    }
  }, [viewingPatientId]);

  const handleAddPatientPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingPatientId || !newPayTitle || !newPayPrice) return;

    const paymentPayload = {
      patient_id: viewingPatientId,
      title: newPayTitle,
      price: parseFloat(newPayPrice) || 0,
      payment_date: new Date().toISOString().split("T")[0]
    };

    const { error } = await supabase.from("patient_payments").insert([paymentPayload]);
    if (error) {
      alert("Chyba při ukládání platby: " + error.message);
    } else {
      await logAction("PLATBA PACIENTA", `Zaevidována platba "${newPayTitle}" (${newPayPrice} Kč) u pacienta.`);
      setNewPayTitle("");
      setNewPayPrice("");
      fetchPatientPayments(viewingPatientId);
    }
  };

  const handleDeletePatientPayment = async (payId: string) => {
    const { error } = await supabase.from("patient_payments").delete().eq("id", payId);
    if (!error && viewingPatientId) {
      fetchPatientPayments(viewingPatientId);
    }
  };

  const handleUploadPatientMedDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingPatientId) return;

    setUploadingMedDoc(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      const docPayload = {
        patient_id: viewingPatientId,
        title: file.name,
        file_url: base64Url,
        file_size: `${(file.size / 1024).toFixed(1)} KB`
      };

      const { error } = await supabase.from("patient_medical_docs").insert([docPayload]);
      if (error) {
        alert("Chyba při nahrávání zprávy: " + error.message);
      } else {
        await logAction("LÉKAŘSKÁ ZPRÁVA", `Nahrána lékařská zpráva "${file.name}" k pacientovi.`);
        fetchPatientMedDocs(viewingPatientId);
        alert(`Lékařská zpráva "${file.name}" byla úspěšně uložena!`);
      }
      setUploadingMedDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePatientMedDoc = async (docId: string) => {
    const confirmDel = window.confirm("Opravdu chcete tuto lékařskou zprávu smazat?");
    if (!confirmDel) return;

    const { error } = await supabase.from("patient_medical_docs").delete().eq("id", docId);
    if (!error && viewingPatientId) {
      fetchPatientMedDocs(viewingPatientId);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (docCategories.includes(trimmed)) {
      alert("Tato složka již existuje.");
      return;
    }

    const { error } = await supabase.from("doc_categories").insert([{ name: trimmed }]);
    if (error) {
      alert("Chyba při vytváření složky: " + error.message);
      return;
    }

    await logAction("SLOŽKA", `Vytvořena nová podsložka dokumentů: ${trimmed}`);
    setNewCategoryName("");
    setShowNewCategoryInput(false);
    fetchCategoriesAndDocs();
    setActiveDocCategory(trimmed);
  };

  const handleDeleteCategory = async (catToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDel = window.confirm(`Opravdu chcete smazat složku "${catToDelete}" a všechny dokumenty v ní?`);
    if (!confirmDel) return;

    await supabase.from("clinic_documents").delete().eq("category", catToDelete);
    await supabase.from("doc_categories").delete().eq("name", catToDelete);

    await logAction("SLOŽKA SMAZÁNA", `Smazána složka: ${catToDelete}`);
    fetchCategoriesAndDocs();
    setActiveDocCategory("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeDocCategory) {
      alert("Nejprve vytvořte a vyberte podsložku, kam chcete dokument nahrát.");
      return;
    }

    setUploadingDoc(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      const newDoc = {
        title: file.name,
        category: activeDocCategory,
        file_url: base64Url,
        file_size: `${(file.size / 1024).toFixed(1)} KB`,
        uploaded_by: session?.user?.email || "Neznámý"
      };

      const { error } = await supabase.from("clinic_documents").insert([newDoc]);
      if (error) {
        alert("Chyba při nahrávání dokumentu: " + error.message);
      } else {
        await logAction("NAHRÁNÍ SOUBORU", `Nahrán dokument "${file.name}" do složky "${activeDocCategory}".`);
        fetchCategoriesAndDocs();
        alert(`Dokument "${file.name}" byl úspěšně uložen do databáze!`);
      }
      setUploadingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    const confirmDelete = window.confirm("Opravdu chcete tento dokument smazat?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("clinic_documents").delete().eq("id", id);
    if (!error) {
      await logAction("SMAZÁNÍ SOUBORU", `Smazán dokument: ${title}`);
      fetchCategoriesAndDocs();
    }
  };

  const isBirthdayToday = (birthDateStr: string) => {
    if (!birthDateStr) return false;
    const today = new Date();
    const currentDay = String(today.getDate()).padStart(2, '0');
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
     
    const cleanStr = birthDateStr.trim();
    if (cleanStr.includes('.')) {
      const parts = cleanStr.split('.');
      if (parts.length >= 2) {
        return parts[0] === currentDay && parts[1] === currentMonth;
      }
    } else if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length >= 3) {
        return parts[2] === currentDay && parts[1] === currentMonth;
      }
    }
    return false;
  };

  const birthdayPatients = patients.filter(p => !p.deleted_at && isBirthdayToday(p.birth_date));

  const handleSendBirthdayEmail = (patient: Patient) => {
    if (!patient.email) {
      alert(`Pacient ${patient.name} nemá v kartotéce vyplněný e-mail.`);
      return;
    }
    const subject = encodeURIComponent("Všechno nejlepší k narozeninám! – Nutriční ambulance");
    const body = encodeURIComponent(`Vážený/á paní/pane ${patient.name},\n\ncelý tým naší Nutriční ambulance Vám co nejsrdečněji přeje všechno nejlepší, pevné zdraví a hodně energie k dosažení Vašich cílů k dnešním narozeninám!\n\nTěšíme se na vaši příští návštěvu v ordinaci v Pardubicích.\n\nS pozdravem,\nNutriční asistent / Terapeut`);
    logAction("NAROZENINY", `Odesláno e-mailové přání pacientovi: ${patient.name}`);
    window.location.href = `mailto:${patient.email}?subject=${subject}&body=${body}`;
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDetail || !selectedPatientId) return;

    const fullTaskTitle = `${newTaskCategory}: ${newTaskDetail}`;
    const patient = patients.find(p => p.id === selectedPatientId);

    const { error } = await supabase.from("patient_tasks").insert([
      {
        patient_id: selectedPatientId,
        task_title: fullTaskTitle,
        assigned_to: newTaskAssignee,
        due_date: newTaskDate,
        status: "Plánováno",
        created_by: session?.user?.email || "Neznámý"
      }
    ]);

    if (error) {
      alert("Chyba při ukládání položky: " + error.message);
      return;
    }

    await logAction("HARMONOGRAM", `Naplánováno "${fullTaskTitle}" pro pacienta ${patient?.name}.`);

    if (patient && patient.phone) {
      const pevnaLinkaOrdinace = "+420 466 111 222"; 
      const message = `Nutriční ambulance: Dobrý den, připomínáme termín (${fullTaskTitle}) dne ${new Date(newTaskDate).toLocaleDateString("cs-CZ")}. V případě dotazů volejte do ordinace: ${pevnaLinkaOrdinace}. Těšíme se na Vás!`;

      const { data: insertedSms } = await supabase.from("sms_queue").insert([
        {
          patient_id: patient.id,
          phone: patient.phone,
          message: message,
          status: "Čeká"
        }
      ]).select();

      const smsId = insertedSms && insertedSms[0] ? insertedSms[0].id : null;

      try {
        const res = await fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: patient.phone, message: message }),
        });

        const data = await res.json();
        if (data.success && smsId) {
          await supabase.from("sms_queue").update({ status: "Odesláno" }).eq("id", smsId);
          await logAction("SMS ODESLÁNA", `SMS odeslána na číslo ${patient.phone}`);
        }
      } catch (err) {
        console.error("Chyba při odesílání SMS:", err);
      }
    }

    setNewTaskDetail("");
    fetchPatientTasks(selectedPatientId);
    fetchSmsQueue();
    alert(`Položka "${fullTaskTitle}" byla úspěšně naplánována a SMS byla odeslána!`);
  };

  const handleAddToSmsQueue = async (patient: Patient, taskTitle: string, dueDate: string) => {
    if (!patient.phone) {
      alert("Pacient nemá vyplněné telefonní číslo.");
      return;
    }

    const pevnaLinkaOrdinace = "+420 466 111 222"; 
    const message = `Nutriční ambulance: Dobrý den, připomínáme termín (${taskTitle}) dne ${new Date(dueDate).toLocaleDateString("cs-CZ")}. V případě dotazů volejte do ordinace: ${pevnaLinkaOrdinace}. Těšíme se na Vás!`;

    const { data: insertedSms } = await supabase.from("sms_queue").insert([
      {
        patient_id: patient.id,
        phone: patient.phone,
        message: message,
        status: "Čeká"
      }
    ]).select();

    const smsId = insertedSms && insertedSms[0] ? insertedSms[0].id : null;

    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: patient.phone, message: message }),
      });

      const data = await res.json();
      if (data.success && smsId) {
        await supabase.from("sms_queue").update({ status: "Odesláno" }).eq("id", smsId);
        await logAction("SMS ODESLÁNA", `Opakovaně odeslána SMS pro ${patient.name}`);
        alert(`Úspěch! SMS byla odeslána z vašeho mobilu pacientovi ${patient.name}.`);
      } else {
        alert(`Zpráva je v databázové frontě, ale mobil neodpověděl: ${data.error || "Neznámá chyba"}`);
      }
    } catch (err) {
      console.error("Chyba:", err);
      alert("Zpráva byla uložena do databáze, ale nepodařilo se spojit s mobilem.");
    }

    fetchSmsQueue();
  };

  const handleDeleteSingleSms = async (smsId: string) => {
    const { error } = await supabase.from("sms_queue").delete().eq("id", smsId);
    if (!error) {
      fetchSmsQueue();
    }
  };

  const handleClearAllSms = async () => {
    const confirmClear = window.confirm("Opravdu chcete smazat celou historii odeslaných SMS?");
    if (!confirmClear) return;

    const { error } = await supabase.from("sms_queue").delete().neq("id", "0");
    if (!error) {
      fetchSmsQueue();
      alert("Historie SMS byla vyčištěna!");
    } else {
      fetchSmsQueue();
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Plánováno" ? "Dokončeno" : "Plánováno";
    const { error } = await supabase
      .from("patient_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (!error) {
      fetchPatientTasks(selectedPatientId);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("patient_tasks")
      .delete()
      .eq("id", taskId);

    if (!error) {
      fetchPatientTasks(selectedPatientId);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPatientId(null);
    setFormErrors({});
    setFormErrorMsg("");
    setModalTab("personal");
    setFormData({
      name: "",
      birth_date: "",
      birth_number: "",
      gender: "Muž",
      address: "",
      insurance_company: "VZP (111)",
      phone: "",
      email: "",
      allergies: "",
      diet_preference: "Všežravec (Standard)",
      activity_level: "Střední aktivita",
      patient_goal: "Redukce hmotnosti a úprava jídelníčku",
      medications: "",
      notes: "",
      is_test: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setFormErrors({});
    setFormErrorMsg("");
    setModalTab("personal");
    setFormData({
      name: patient.name || "",
      birth_date: patient.birth_date || "",
      birth_number: patient.birth_number || "",
      gender: patient.gender || "Muž",
      address: patient.address || "",
      insurance_company: patient.insurance_company || "VZP (111)",
      phone: patient.phone || "",
      email: patient.email || "",
      allergies: patient.allergies || "",
      diet_preference: patient.diet_preference || "Všežravec (Standard)",
      activity_level: patient.activity_level || "Střední aktivita",
      patient_goal: patient.patient_goal || "Redukce hmotnosti a úprava jídelníčku",
      medications: patient.medications || "",
      notes: patient.notes || "",
      is_test: patient.is_test || false
    });
    setIsModalOpen(true);
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg("");

    const errors: { [key: string]: boolean } = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.birth_number.trim()) errors.birth_number = true;
    if (!formData.birth_date.trim()) errors.birth_date = true;
    if (!formData.phone.trim()) errors.phone = true;
    if (!formData.address.trim()) errors.address = true;
    if (!formData.patient_goal.trim()) errors.patient_goal = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormErrorMsg("⚠️ Nevyplnil/a jste všechny povinné údaje. Zvýrazněná políčka níže jsou červeně podbarvena.");
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    const userEmail = session?.user?.email || "Neznámý";
    const patientPayload = {
      name: formData.name,
      birth_date: formData.birth_date,
      birth_number: formData.birth_number,
      gender: formData.gender,
      address: formData.address,
      insurance_company: formData.insurance_company,
      phone: formData.phone,
      email: formData.email,
      allergies: formData.allergies,
      diet_preference: formData.diet_preference,
      activity_level: formData.activity_level,
      patient_goal: formData.patient_goal,
      medications: formData.medications,
      notes: formData.notes,
      is_test: formData.is_test,
      updated_by: userEmail
    };

    if (editingPatientId) {
      const { error } = await supabase
        .from("patients")
        .update(patientPayload)
        .eq("id", editingPatientId);

      if (error) {
        alert("Chyba při úpravě pacienta: " + error.message);
      } else {
        await logAction("ÚPRAVA PACIENTA", `Upraven profil pacienta: ${formData.name} (RČ: ${formData.birth_number})`);
        setIsModalOpen(false);
        fetchPatients();
      }
    } else {
      const { error } = await supabase.from("patients").insert([
        {
          ...patientPayload,
          abpm_status: "Bez zápůjčky",
          status: "Aktivní",
          created_by: userEmail
        }
      ]);

      if (error) {
        alert("Chyba při ukládání pacienta: " + error.message);
      } else {
        await logAction("NOVÝ PACIENT", `Založen nový pacient: ${formData.name} (RČ: ${formData.birth_number})`);
        setIsModalOpen(false);
        fetchPatients();
      }
    }

    setSubmitting(false);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (patient.is_test) {
      const confirmDelete = window.confirm(`Jde o TESTOVACÍHO pacienta "${patient.name}". Přesunout do Koše?`);
      if (!confirmDelete) return;
    } else {
      const userInput = window.prompt(
        `⚠️ POZOR: Chystáte se smazat SKUTEČNÉHO PACIENTA "${patient.name}"!\n\nPro potvrzení opište slovo "SMAZAT":`
      );
      if (userInput !== "SMAZAT") {
        alert("Smazání zrušeno. Heslo nesouhlasí.");
        return;
      }
    }

    const { error } = await supabase
      .from("patients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", patient.id);

    if (error) {
      alert("Chyba při přesunu do koše: " + error.message);
    } else {
      await logAction("SMAZÁNÍ PACIENTA", `Pacient ${patient.name} přesunut do koše.`);
      fetchPatients();
      setViewingPatientId(null);
    }
  };

  const handleRestorePatient = async (id: string, name: string) => {
    const { error } = await supabase
      .from("patients")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) {
      alert("Chyba při obnovení pacienta: " + error.message);
    } else {
      await logAction("OBNOVENÍ PACIENTA", `Pacient ${name} obnoven z koše.`);
      alert(`Pacient "${name}" byl úspěšně obnoven do kartotéky!`);
      fetchPatients();
    }
  };

  const handlePermanentDelete = async (patient: Patient) => {
    if (patient.is_test) {
      const confirmDelete = window.confirm(
        `Opravdu chcete TRVALE vymazat testovacího pacienta "${patient.name}"?`
      );
      if (!confirmDelete) return;
    } else {
      const userInput = window.prompt(
        `🚨 BEZPEČNOSTNÍ VAROVÁNÍ: Chystáte se TRVALE VYMAZAT SKUTEČNÉHO PACIENTA "${patient.name}"!\n\nPro potvrzení opište "TRVALE SMAZAT":`
      );
      if (userInput !== "TRVALE SMAZAT") {
        alert("Trvalé smazání zrušeno. Heslo nesouhlasí.");
        return;
      }
    }

    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", patient.id);

    if (error) {
      alert("Chyba při trvalém mazání: " + error.message);
    } else {
      await logAction("TRVALÉ SMAZÁNÍ", `Trvale smazán pacient: ${patient.name}`);
      fetchPatients();
      setViewingPatientId(null);
    }
  };

  const handleSaveReport = async () => {
    if (!selectedPatientId) return;
    setSavingReport(true);

    const userEmail = session?.user?.email || "Neznámý";
    const reportDataPayload = {
      patient_id: selectedPatientId,
      report_date: currentReport.report_date,
      doc_title: currentReport.doc_title,
      weight: currentReport.weight,
      height: currentReport.height,
      bp: currentReport.bp,
      pulse: currentReport.pulse,
      anamnesis: currentReport.anamnesis,
      diagnosis: currentReport.diagnosis,
      abpm_summary: currentReport.abpm_summary,
      nutritional_plan: currentReport.nutritional_plan,
      conclusion: currentReport.conclusion,
      created_by: userEmail
    };

    let error = null;

    if (currentReport.id) {
      const { error: updateError } = await supabase
        .from("patient_reports")
        .update(reportDataPayload)
        .eq("id", currentReport.id);
      error = updateError;
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from("patient_reports")
        .insert([reportDataPayload])
        .select();
       
      error = insertError;
      if (!insertError && insertedData && insertedData[0]) {
        setCurrentReport(insertedData[0]);
      }
    }

    if (error) {
      alert("Chyba při ukládání dekurzu: " + error.message);
    } else {
      await logAction("DEKURZ", `Uložen dekurz/zpráva (${currentReport.doc_title}) pro pacienta.`);
      alert("Dekurz byl úspěšně uložen do kartotéky pacienta!");
      fetchPatientReports(selectedPatientId);
    }
    setSavingReport(false);
  };

  const handleCreateNewReport = () => {
    setCurrentReport({
      id: undefined,
      patient_id: selectedPatientId,
      report_date: new Date().toISOString().split("T")[0],
      doc_title: "AMBULANTNÍ DEKURZ ZE DNE " + new Date().toLocaleDateString("cs-CZ"),
      weight: "",
      height: "",
      bp: "",
      pulse: "",
      anamnesis: "",
      diagnosis: "",
      abpm_summary: "",
      nutritional_plan: "",
      conclusion: ""
    });
  };

  const handleAddReceiptItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemPrice) return;
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      price: parseFloat(newItemPrice) || 0
    };
    setReceiptItems([...receiptItems, newItem]);
    setNewItemTitle("");
    setNewItemPrice("");
  };

  const handleRemoveReceiptItem = (id: string) => {
    setReceiptItems(receiptItems.filter(item => item.id !== id));
  };

  const totalReceiptSum = receiptItems.reduce((acc, item) => acc + item.price, 0);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.birth_number && p.birth_number.includes(searchTerm)) ||
    (p.birth_date && p.birth_date.includes(searchTerm))
  );

  const searchablePatients = patients.filter(p =>
    p.name.toLowerCase().includes(globalPatientSearch.toLowerCase()) ||
    (p.birth_number && p.birth_number.includes(globalPatientSearch)) ||
    (p.birth_date && p.birth_date.includes(globalPatientSearch))
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const viewingPatient = patients.find(p => p.id === viewingPatientId);

  const weightNum = parseFloat(currentReport.weight) || 0;
  const heightNum = (parseFloat(currentReport.height) || 0) / 100;
  const bmi = heightNum > 0 ? (weightNum / (heightNum * heightNum)).toFixed(1) : "—";

  const handlePrint = () => {
    logAction("TISK", `Vytištěn dokument / zpráva.`);
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-[#0F172A] flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 relative">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-[#0D9488] p-3.5 rounded-2xl text-white shadow-lg mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-wide text-gray-900">
              Nutriční Ambulance
            </h1>
            <p className="text-xs text-gray-500 mt-1">Zabezpečený klinický systém v Pardubicích</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccessMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Přihlášení
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); setAuthSuccessMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Prvotní registrace
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {authError}
            </div>
          )}

          {authSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
              {authSuccessMsg}
            </div>
          )}

          <form onSubmit={handleAuthAction} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="vas@email.cz"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Heslo</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-teal-800 mb-1">Tajný bezpečnostní klíč pro registraci</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Zadejte ověřovací klíč"
                    value={secretAdminKey}
                    onChange={(e) => setSecretAdminKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-teal-50/50 border border-teal-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Chrání systém před neoprávněnou registrací cizích uživatelů.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authenticating}
              className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              {authenticating && <Loader2 className="w-4 h-4 animate-spin" />}
              {authMode === "login" ? "Přihlásit se do systému" : "Vytvořit ověřený účet"}
            </button>
          </form>

          <div className="mt-8 text-center text-[11px] text-gray-400">
            Zabezpečené úložiště • Pardubice
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans print:bg-white">
      <header className="bg-[#1F2937] text-white border-b border-teal-600/30 px-8 py-5 flex items-center justify-between shadow-md print:hidden sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-[#0D9488] p-2.5 rounded-xl text-white shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-teal-400">
              Nutriční Ambulance
            </h1>
            <p className="text-xs text-gray-300">Klinická výživa & Metabolická diagnostika</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-gray-800/80 text-gray-300 text-xs px-3.5 py-1.5 rounded-xl border border-gray-700">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium">
              {currentTime.toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="text-teal-400 font-bold font-mono">
              {currentTime.toLocaleTimeString("cs-CZ")}
            </span>
          </div>

          <span className="inline-flex items-center gap-2 bg-teal-950 text-teal-300 text-xs px-3.5 py-1.5 rounded-full border border-teal-800 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Přihlášen ({session.user.email})
          </span>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-red-900/40 text-gray-300 hover:text-red-300 text-xs font-semibold px-3.5 py-2 rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
            title="Odhlásit se ze systému"
          >
            <LogOut className="w-4 h-4" /> Odhlásit
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 print:p-0 print:max-w-none">
         
        {birthdayPatients.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-teal-500/10 border border-pink-200 rounded-2xl shadow-sm flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500 text-white rounded-xl shadow-sm">
                <Gift className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Narozeninové upozornění pro dnešní den!</h4>
                <p className="text-xs text-gray-600">
                  {birthdayPatients.map(p => p.name).join(", ")} {birthdayPatients.length === 1 ? "má" : "mají"} dnes narozeniny.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {birthdayPatients.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSendBirthdayEmail(p)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Poslat přání ({p.name})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap border-b border-gray-200 mb-8 gap-2 print:hidden">
          <button
            onClick={() => { setActiveTab("patients"); setShowTrash(false); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "patients" && !showTrash && !viewingPatientId
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" /> Kartotéka Pacientů
          </button>
          <button
            onClick={() => { setActiveTab("hours"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "hours"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" /> Ordinační hodiny
          </button>
          <button
            onClick={() => { setActiveTab("examinations"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "examinations"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Vyšetření & Fronta SMS
          </button>
          <button
            onClick={() => { setActiveTab("progress"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "progress"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Vývoj & Pokrok (Analýza)
          </button>
          <button
            onClick={() => { setActiveTab("receipts"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "receipts"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Receipt className="w-4 h-4" /> Účtenky & Platby
          </button>
          <button
            onClick={() => { setActiveTab("reports"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "reports"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" /> Dekurzy & Zprávy
          </button>
          <button
            onClick={() => { setActiveTab("documents"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "documents"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Dokumenty & Tiskopisy
          </button>
          <button
            onClick={() => { setActiveTab("audit"); setViewingPatientId(null); }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 rounded-t-xl ${
              activeTab === "audit"
                ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Audit & Historie změn
          </button>
        </div>

        {viewingPatientId && viewingPatient ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <button
                onClick={() => setViewingPatientId(null)}
                className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#0D9488] bg-gray-100 hover:bg-teal-50 px-4 py-2 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Zpět do kartotéky
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenEditModal(viewingPatient)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl border border-blue-200 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Upravit profil
                </button>
                <button
                  onClick={() => handleDeletePatient(viewingPatient)}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl border border-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Smazat pacienta
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    {viewingPatient.name}
                    {viewingPatient.is_test && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">TEST</span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Rodné číslo: <strong className="font-mono text-teal-900">{viewingPatient.birth_number || "Neuvedeno"}</strong> | Datum narození: <strong>{viewingPatient.birth_date || "Neuvedeno"}</strong> ({viewingPatient.gender || "—"})
                  </p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <div>Pojišťovna: <strong className="text-teal-800">{viewingPatient.insurance_company}</strong></div>
                  <div>Tel: {viewingPatient.phone || "—"} | E-mail: {viewingPatient.email || "—"}</div>
                </div>
              </div>

              <div className="flex flex-wrap border-b border-gray-200 mb-6 gap-2">
                <button
                  onClick={() => setPatientDetailTab("info")}
                  className={`pb-2.5 px-3 font-bold text-xs border-b-2 rounded-t-xl transition-all ${
                    patientDetailTab === "info" ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  📋 Klinický & Nutriční profil
                </button>
                <button
                  onClick={() => setPatientDetailTab("payments")}
                  className={`pb-2.5 px-3 font-bold text-xs border-b-2 rounded-t-xl transition-all ${
                    patientDetailTab === "payments" ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  💳 Doklady & Platby ({patientPayments.length})
                </button>
                <button
                  onClick={() => setPatientDetailTab("meddocs")}
                  className={`pb-2.5 px-3 font-bold text-xs border-b-2 rounded-t-xl transition-all ${
                    patientDetailTab === "meddocs" ? "border-[#0D9488] text-[#0D9488] bg-teal-50/30" : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  📁 Lékařské zprávy ({patientMedDocs.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedPatientId(viewingPatient.id);
                    setActiveTab("reports");
                  }}
                  className="pb-2.5 px-3 font-bold text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 ml-auto"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Přejít na dekurzy →
                </button>
              </div>

              {patientDetailTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
                    <div><strong>🎯 Cíl terapie:</strong> {viewingPatient.patient_goal || "Neuvedeno"}</div>
                    <div><strong>🥗 Styl stravy:</strong> {viewingPatient.diet_preference || "Všežravec"}</div>
                    <div><strong>⚡ Pohybová aktivita:</strong> {viewingPatient.activity_level || "Neuvedeno"}</div>
                  </div>
                  <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
                    <div className="text-red-800"><strong>⚠️ Alergie & Intolerance:</strong> {viewingPatient.allergies || "Žádné hlášené"}</div>
                    <div className="text-purple-900"><strong>💊 Užité léky & doplňky:</strong> {viewingPatient.medications || "Neuvedeno"}</div>
                    <div className="text-gray-700"><strong>🏠 Adresa:</strong> {viewingPatient.address || "Neuvedena"}</div>
                  </div>
                </div>
              )}

              {patientDetailTab === "payments" && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Zaevidovat novou platbu / doklad</h4>
                    <form onSubmit={handleAddPatientPayment} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Název služby (např. Vstupní vyšetření...)"
                        value={newPayTitle}
                        onChange={(e) => setNewPayTitle(e.target.value)}
                        className="bg-white border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Částka v Kč"
                        value={newPayPrice}
                        onChange={(e) => setNewPayPrice(e.target.value)}
                        className="bg-white border border-gray-300 rounded-xl p-2.5 text-xs"
                      />
                      <button
                        type="submit"
                        className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Přidat platbu do evidence
                      </button>
                    </form>
                  </div>

                  {patientPayments.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6">Pro tohoto pacienta zatím nejsou evidovány žádné platby.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold uppercase">
                          <tr>
                            <th className="p-3">Datum</th>
                            <th className="p-3">Položka / Služba</th>
                            <th className="p-3 text-right">Částka</th>
                            <th className="p-3 text-center w-16">Akce</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {patientPayments.map(pay => (
                            <tr key={pay.id} className="hover:bg-gray-50">
                              <td className="p-3 font-bold text-teal-900">{new Date(pay.payment_date).toLocaleDateString("cs-CZ")}</td>
                              <td className="p-3 font-medium text-gray-900">{pay.title}</td>
                              <td className="p-3 text-right font-bold text-teal-950">{pay.price.toLocaleString("cs-CZ")} Kč</td>
                              <td className="p-3 text-center">
                                <button onClick={() => handleDeletePatientPayment(pay.id)} className="text-red-500 hover:text-red-700" title="Smazat">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {patientDetailTab === "meddocs" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-teal-50/60 p-4 rounded-xl border border-teal-200">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-0.5">Složka lékařských zpráv</h4>
                      <p className="text-xs text-gray-600">Nahrajte skeny, výsledky odběrů nebo zprávy od jiných lékařů pro tohoto pacienta.</p>
                    </div>
                    <label className="bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm transition-colors">
                      {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{uploadingDoc ? "Nahrávám..." : "Nahrát zprávu"}</span>
                      <input type="file" onChange={handleUploadPatientMedDoc} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg" />
                    </label>
                  </div>

                  {patientMedDocs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-6">Ve složce pacienta nejsou zatím žádné lékařské zprávy.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {patientMedDocs.map(doc => (
                        <div key={doc.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-between shadow-sm">
                          <div className="flex items-start gap-2.5">
                            <FileCheck className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</h5>
                              <span className="text-[10px] text-gray-400 block">Velikost: {doc.file_size || "—"}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1">
                              <Download className="w-3.5 h-3.5" /> Stáhnout / Zobrazit
                            </a>
                            <button onClick={() => handleDeletePatientMedDoc(doc.id)} className="text-red-500 hover:text-red-700" title="Smazat">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ZÁLOŽKA: ORDINAČNÍ HODINY */}
            {activeTab === "hours" && (
              <div className="space-y-6 max-w-4xl mx-auto font-sans">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h1 className="text-lg font-bold uppercase tracking-wider text-gray-700">NUTRIČNÍ AMBULANCE</h1>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="bg-[#1F2937] hover:bg-gray-800 text-white font-semibold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md print:hidden"
                    >
                      <Printer className="w-4 h-4" /> Vytisknout ordinační hodiny
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-[#0D9488] mb-6">Ordinační hodiny</h2>

                  <div className="border-t border-b border-gray-900 mb-6 overflow-hidden">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="border-b border-gray-900 text-gray-900 font-bold">
                        <tr>
                          <th className="p-3.5 w-1/4">Den</th>
                          <th className="p-3.5 w-1/3">Ordinační doba</th>
                          <th className="p-3.5">Poznámka</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Pondělí</td>
                          <td className="p-3.5 font-mono text-gray-900">12:30 – 17:30</td>
                          <td className="p-3.5 text-gray-800">Příjem klientů a diagnostika</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Úterý</td>
                          <td className="p-3.5 font-mono text-gray-900">
                            <div>8:00 – 12:00</div>
                            <div>13:00 – 16:00</div>
                          </td>
                          <td className="p-3.5 text-gray-600 italic">Pauza na oběd: 12:00 – 13:00</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Středa</td>
                          <td className="p-3.5 font-mono text-gray-900">
                            <div>8:00 – 12:00</div>
                            <div>13:00 – 16:00</div>
                          </td>
                          <td className="p-3.5 text-gray-800">
                            <div><strong>Dopoledne:</strong> Příjem klientů</div>
                            <div><strong>Odpoledne:</strong> <span className="italic">Vyhodnocování diagnostiky (bez klientů)</span></div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Čtvrtek</td>
                          <td className="p-3.5 font-mono text-gray-900">12:30 – 17:30</td>
                          <td className="p-3.5 text-gray-800">Příjem klientů a diagnostika</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Pátek</td>
                          <td className="p-3.5 font-mono text-gray-900">8:30 – 12:30</td>
                          <td className="p-3.5 text-gray-600 italic">Administrativní provoz (bez příjmu klientů)</td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-bold text-gray-900">Sobota – Neděle</td>
                          <td className="p-3.5 font-mono text-gray-600">Zavřeno</td>
                          <td className="p-3.5 text-gray-400">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-xs text-gray-600 mt-4">
                    <strong className="text-[#0D9488]">Upozornění pro klienty:</strong> Návštěva ambulance je možná pouze po předchozím objednání přes rezervační systém nebo telefonicky.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "patients" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Hledat pacienta podle jména nebo rodného čísla..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTrash(!showTrash)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        showTrash 
                          ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm" 
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {showTrash ? "Zobrazit kartotéku" : "Koš (Smazaní)"}
                    </button>

                    {!showTrash && (
                      <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 bg-[#0D9488] hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" /> Nový Pacient
                      </button>
                    )}
                  </div>
                </div>

                {showTrash && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-3 shadow-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Jste v <strong>Koši</strong>. Zde můžete pacienty obnovit zpět do aktivní kartotéky nebo je trvale odstranit.</span>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {loading ? (
                    <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" /> Načítám kartotéku...
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      {showTrash ? "V koši nejsou žádní smazaní pacienti." : "Zatím v databázi nemáte žádné pacienty. Přidejte prvního!"}
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-4.5">Jméno a Příjmení</th>
                          <th className="p-4.5">Rodné číslo (RČ)</th>
                          <th className="p-4.5">Datum nar.</th>
                          <th className="p-4.5">Pojišťovna & Adresa</th>
                          <th className="p-4.5">Hlavní cíl</th>
                          <th className="p-4.5 text-right">Detail / Profil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredPatients.map((patient) => {
                          const isBday = isBirthdayToday(patient.birth_date);
                          return (
                            <tr 
                              key={patient.id} 
                              onClick={() => setViewingPatientId(patient.id)}
                              className={`cursor-pointer transition-colors ${isBday ? "bg-pink-50/60 hover:bg-pink-100/50" : "hover:bg-teal-50/40"}`}
                            >
                              <td className="p-4.5 font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  {patient.name}
                                  {isBday && (
                                    <span className="text-[10px] bg-pink-100 text-pink-800 border border-pink-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Gift className="w-3 h-3 text-pink-600" /> Dnes narozeniny!
                                    </span>
                                  )}
                                  {patient.is_test && (
                                    <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-bold">TEST</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4.5 text-gray-800 text-xs font-mono font-bold">
                                {patient.birth_number || "—"}
                              </td>
                              <td className="p-4.5 text-gray-600 text-xs">
                                <div>{patient.birth_date || "—"}</div>
                                <div className="text-gray-400">{patient.gender || "—"}</div>
                              </td>
                              <td className="p-4.5 text-gray-600 text-xs">
                                <div className="font-bold text-teal-800">{patient.insurance_company || "—"}</div>
                                <div className="text-gray-400 truncate max-w-xs">{patient.address || "Adresa neuvedena"}</div>
                              </td>
                              <td className="p-4.5 text-xs text-teal-900 font-semibold truncate max-w-xs">
                                🎯 {patient.patient_goal || "Neuvedeno"}
                              </td>
                              <td className="p-4.5 text-right">
                                {!showTrash ? (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingPatientId(patient.id);
                                    }}
                                    className="text-teal-700 hover:text-teal-900 font-semibold text-xs inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors"
                                  >
                                    Otevřít profil <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <div className="space-x-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleRestorePatient(patient.id, patient.name); }}
                                      className="text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                                    >
                                      Obnovit
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handlePermanentDelete(patient); }}
                                      className="text-red-700 font-semibold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
                                    >
                                      Smazat
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#0D9488]" /> Auditní stopa & Kdo co upravil
                      </h2>
                      <p className="text-xs text-gray-500">Záznam všech klientských úkonů, uložení zpráv, smazání a změn v systému v reálném čase.</p>
                    </div>
                    <button
                      onClick={fetchAuditLogs}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors border border-gray-300"
                    >
                      Obnovit logy
                    </button>
                  </div>

                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-12">Zatím nebyly zaznamenány žádné auditní události.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Čas události</th>
                            <th className="p-3">Uživatel / E-mail</th>
                            <th className="p-3">Typ akce</th>
                            <th className="p-3">Podrobnosti akce</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 font-mono">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString("cs-CZ")}</td>
                              <td className="p-3 font-bold text-teal-900">{log.user_email}</td>
                              <td className="p-3">
                                <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-[10px] font-bold">
                                  {log.action_type}
                                </span>
                              </td>
                              <td className="p-3 text-gray-800 font-sans">{log.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4 print:hidden">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#0D9488]" /> Analýza vývoje & Pokrok pacienta v čase
                      </h2>
                      <p className="text-xs text-gray-500">Interní přehled naměřených hodnot, trendů a slovního zhodnocení pro terapeuta.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Hledat pacienta (jméno, RČ)..."
                          value={globalPatientSearch}
                          onChange={(e) => setGlobalPatientSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D9488]"
                        />
                      </div>
                      <select 
                        value={selectedPatientId} 
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#0D9488] w-full md:w-60"
                      >
                        {searchablePatients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (RČ: {p.birth_number})</option>
                        ))}
                      </select>
                      <button
                        onClick={handlePrint}
                        className="bg-[#1F2937] hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                      >
                        <Printer className="w-4 h-4" /> Tisk analýzy
                      </button>
                    </div>
                  </div>

                  <div className="hidden print:block border-b-2 border-gray-900 pb-4 mb-6">
                    <h1 className="text-base font-bold uppercase">Analýza vývoje & Pokroku pacienta</h1>
                    <p className="text-xs text-gray-600">Nutriční & Metabolická ambulance | Pardubice</p>
                    {selectedPatient && (
                      <div className="mt-2 text-xs">
                        <strong>Pacient:</strong> {selectedPatient.name} | <strong>Rodné číslo:</strong> {selectedPatient.birth_number} | <strong>Cíl:</strong> {selectedPatient.patient_goal}
                      </div>
                    )}
                  </div>

                  {selectedPatient ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Počet záznamů v historii</span>
                          <div className="text-2xl font-black text-teal-950 mt-1">{savedReports.length}</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Počáteční vs. Aktuální hmotnost</span>
                          <div className="text-lg font-bold text-blue-950 mt-1">
                            {savedReports.length > 0 ? `${savedReports[0].weight || "—"} kg ➔ ${savedReports[savedReports.length - 1].weight || "—"} kg` : "Nedostatek dat"}
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Hlavní cíl terapie</span>
                          <div className="text-xs font-bold text-purple-950 mt-1 truncate">{selectedPatient.patient_goal || "Neuvedeno"}</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-[#0D9488]" /> Přehledná tabulka měření a hodnot
                        </h3>
                        {savedReports.length === 0 ? (
                          <p className="text-xs text-gray-400 italic bg-gray-50 p-6 rounded-xl border text-center">Pro tohoto pacienta zatím nebyly uloženy žádné dekurzy s naměřenými hodnotami.</p>
                        ) : (
                          <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                                <tr>
                                  <th className="p-3">Datum</th>
                                  <th className="p-3">Hmotnost</th>
                                  <th className="p-3">Výška</th>
                                  <th className="p-3">Tlak (mmHg)</th>
                                  <th className="p-3">Puls</th>
                                  <th className="p-3">Závěr / Diagnóza</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {savedReports.map((rep) => (
                                  <tr key={rep.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-bold text-teal-900">{new Date(rep.report_date).toLocaleDateString("cs-CZ")}</td>
                                    <td className="p-3 font-semibold">{rep.weight ? `${rep.weight} kg` : "—"}</td>
                                    <td className="p-3">{rep.height ? `${rep.height} cm` : "—"}</td>
                                    <td className="p-3">{rep.bp || "—"}</td>
                                    <td className="p-3">{rep.pulse ? `${rep.pulse} /min` : "—"}</td>
                                    <td className="p-3 text-gray-600 truncate max-w-xs">{rep.conclusion || rep.diagnosis || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#0D9488]" /> Slovní zhodnocení pokroku a mezistavů (Poznámky terapeuta)
                        </h3>
                        <textarea
                          rows={4}
                          placeholder="Zapište zde své postřehy, jak pacient dodržuje jídelníček, jak reaguje na změny, co je potřeba upravit do příští kontroly..."
                          value={progressNotes}
                          onChange={(e) => setProgressNotes(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                        />
                        <div className="flex justify-end print:hidden">
                          <button
                            onClick={() => alert("Poznámky k pokroku byly zaznamenány!")}
                            className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
                          >
                            Uložit poznámky
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Vyberte prosím pacienta v horním rozbalovacím menu.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "examinations" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#0D9488]" /> Harmonogram (Vyšetření, Odevzdání, Kontrola)
                      </h2>
                      <p className="text-xs text-gray-500">Vyhledejte pacienta a naplánujte termín s odesláním SMS.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Hledat (jméno, RČ)..."
                          value={globalPatientSearch}
                          onChange={(e) => setGlobalPatientSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D9488]"
                        />
                      </div>
                      <select 
                        value={selectedPatientId} 
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full md:w-72 bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#0D9488]"
                      >
                        {searchablePatients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (RČ: {p.birth_number})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedPatient ? (
                    <div className="space-y-8">
                      <div className="bg-teal-50/60 p-5 rounded-2xl border border-teal-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-1 flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-[#0D9488]" /> Mobilní brána aktivní (`http://10.10.5.30:8080`)
                          </h4>
                          <p className="text-xs text-gray-600">
                            Zprávy se odesílají přímo z vaší SIM karty v mobilu a stav se automaticky přepne na „Odesláno“.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-gray-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-3 flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-[#0D9488]" /> Nový záznam v harmonogramu
                        </h3>
                        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <select
                            value={newTaskCategory}
                            onChange={(e) => setNewTaskCategory(e.target.value)}
                            className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-xs font-bold text-teal-900 focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                          >
                            <option value="🩺 Vyšetření">🩺 Vyšetření</option>
                            <option value="📦 Odevzdání">📦 Odevzdání</option>
                            <option value="📅 Kontrola">📅 Kontrola</option>
                          </select>

                          <input
                            type="text"
                            required
                            placeholder="Detail (např. Nasazení ABPM, Vracení holteru...)"
                            value={newTaskDetail}
                            onChange={(e) => setNewTaskDetail(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D9488] focus:outline-none col-span-1 md:col-span-1.5"
                          />

                          <select
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                          >
                            <option value="Sestra">Zodpovídá: Sestra</option>
                            <option value="Nutriční asistent">Zodpovídá: Nutriční asistent</option>
                            <option value="Lékař">Zodpovídá: Lékař</option>
                          </select>

                          <input
                            type="date"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                          />

                          <button
                            type="submit"
                            className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm col-span-1 md:col-span-5"
                          >
                            Uložit do harmonogramu a odeslat SMS
                          </button>
                        </form>
                      </div>

                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-[#0D9488]" /> Historie odeslaných SMS v databázi (sms_queue)
                          </h3>
                          {smsQueue.length > 0 && (
                            <button
                              onClick={handleClearAllSms}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Smazat celou historii SMS
                            </button>
                          )}
                        </div>

                        {smsQueue.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">V databázi nejsou žádné záznamy o SMS.</p>
                        ) : (
                          <div className="space-y-2">
                            {smsQueue.map(item => (
                              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-xl text-xs flex justify-between items-center shadow-sm">
                                <div>
                                  <div className="font-bold text-teal-900">📱 Tel: {item.phone}</div>
                                  <p className="text-gray-800 mt-0.5 font-medium">{item.message}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    item.status === "Odesláno" 
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}>
                                    {item.status}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteSingleSms(item.id)}
                                    className="text-gray-400 hover:text-red-600 p-1"
                                    title="Smazat tuto zprávu"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#0D9488]" /> Harmonogram akcí pro pacienta
                        </h3>
                        {patientTasks.length === 0 ? (
                          <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl border">Zatím nejsou naplánována žádná vyšetření, odevzdání ani kontroly.</p>
                        ) : (
                          <div className="space-y-2">
                            {patientTasks.map(task => (
                              <div 
                                key={task.id} 
                                className={`p-4 rounded-xl border flex justify-between items-center text-xs transition-all ${
                                  task.status === "Dokončeno" 
                                    ? "bg-gray-50 border-gray-200 text-gray-400 line-through" 
                                    : "bg-white border-teal-200 shadow-sm text-gray-800"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={task.status === "Dokončeno"}
                                    onChange={() => handleToggleTaskStatus(task.id!, task.status)}
                                    className="w-4 h-4 text-[#0D9488] rounded focus:ring-[#0D9488] cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-bold text-sm text-gray-900 block">{task.task_title}</span>
                                    <span className="text-[11px] text-gray-500">
                                      👤 Zodpovídá: <strong className="text-teal-800">{task.assigned_to}</strong> | 📅 Termín: <strong>{new Date(task.due_date).toLocaleDateString("cs-CZ")}</strong>
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAddToSmsQueue(selectedPatient, task.task_title, task.due_date)}
                                    className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-[11px] flex items-center gap-1.5 transition-colors shadow-sm"
                                    title="Znovu odeslat SMS přes mobil"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Poslat SMS znovu
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTask(task.id!)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Smazat záznam"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Vyberte prosím pacienta v horním rozbalovacím menu.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "receipts" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                <div className="lg:col-span-4 space-y-5 print:hidden">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#0D9488]" /> Nastavení dokladu
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Rychlé vyhledání a výběr pacienta:</label>
                      <div className="relative mb-2">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Hledat (jméno, RČ)..."
                          value={globalPatientSearch}
                          onChange={(e) => setGlobalPatientSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D9488]"
                        />
                      </div>
                      <select 
                        value={selectedPatientId} 
                        onChange={(e) => {
                          setSelectedPatientId(e.target.value);
                          const p = patients.find(pat => pat.id === e.target.value);
                          if (p) {
                            setReceiptPatientName(p.name);
                            setReceiptPatientAddress(p.address || "");
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#0D9488]"
                      >
                        <option value="">— Vlastní / Samoplátce —</option>
                        {searchablePatients.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (RČ: {p.birth_number})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Jméno pacienta / plátce *</label>
                      <input
                        type="text"
                        value={receiptPatientName}
                        onChange={(e) => setReceiptPatientName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0D9488]"
                        placeholder="např. Jan Novák"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Adresa plátce</label>
                      <input
                        type="text"
                        value={receiptPatientAddress}
                        onChange={(e) => setReceiptPatientAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0D9488]"
                        placeholder="např. Masarykova 123, Pardubice"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Číslo dokladu</label>
                        <input
                          type="text"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0D9488]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Datum úhrady</label>
                        <input
                          type="date"
                          value={receiptDate}
                          onChange={(e) => setReceiptDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0D9488]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Způsob platby</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-[#0D9488]"
                      >
                        <option value="Hotově">Hotově</option>
                        <option value="Platební kartou">Platební kartou</option>
                        <option value="Převodem na účet">Převodem na účet</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#0D9488]" /> Přidat položku / službu
                    </h3>
                    <form onSubmit={handleAddReceiptItem} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Název služby (např. Kontrola a úprava jídelníčku)"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D9488]"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Cena v Kč"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#0D9488]"
                        />
                        <button
                          type="submit"
                          className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                        >
                          Přidat
                        </button>
                      </div>
                    </form>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-full bg-[#1F2937] hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" /> Vytisknout / Uložit PDF účtenku
                  </button>
                </div>

                <div className="lg:col-span-8 bg-white p-12 rounded-2xl border border-gray-300 shadow-xl font-sans print:shadow-none print:border-none print:p-0">
                   
                  <div className="border-b-2 border-gray-900 pb-6 mb-6 flex justify-between items-start">
                    <div>
                      <h1 className="text-lg font-bold uppercase tracking-wider text-gray-900">Nutriční & Metabolická Ambulance</h1>
                      <p className="text-xs text-gray-600 mt-1">Poskytovatel odborných služeb v oblasti klinické výživy</p>
                      <p className="text-xs text-gray-500 mt-0.5">Místo provozovny: Pardubice</p>
                      <p className="text-xs text-gray-500">IČO: 12345678 (Neplátce DPH)</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs px-3 py-1.5 rounded-xl mb-2">
                        PŘÍJMOVÝ POKLADNÍ DOKLAD
                      </span>
                      <div className="text-xs text-gray-600 font-semibold">Doklad č.: {receiptNumber}</div>
                      <div className="text-xs text-gray-500">Datum: {new Date(receiptDate).toLocaleDateString("cs-CZ")}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-200 mb-6 text-xs grid grid-cols-2 gap-3 print:bg-transparent print:border-gray-400">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Odběratel / Pacient:</span>
                      <strong className="text-sm text-gray-900">{receiptPatientName || "Neuvedeno"}</strong>
                      {receiptPatientAddress && <div className="text-gray-600 mt-0.5">{receiptPatientAddress}</div>}
                      {selectedPatient && <div className="text-gray-500 font-mono mt-1">Rodné číslo: {selectedPatient.birth_number}</div>}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Způsob úhrady:</span>
                      <strong className="text-sm text-teal-800">{paymentMethod}</strong>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs mb-8">
                    <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase tracking-wider print:bg-gray-200">
                      <tr>
                        <th className="p-3">Označení služeb / položky</th>
                        <th className="p-3 text-right">Celkem Kč</th>
                        <th className="p-3 text-center print:hidden w-16">Akce</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {receiptItems.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-400 italic">Žádné položky na účtence. Přidejte služby vlevo.</td>
                        </tr>
                      ) : (
                        receiptItems.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{item.title}</td>
                            <td className="p-3 text-right font-bold text-gray-900">{item.price.toLocaleString("cs-CZ")} Kč</td>
                            <td className="p-3 text-center print:hidden">
                              <button 
                                onClick={() => handleRemoveReceiptItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Smazat položku"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="flex justify-end mb-12">
                    <div className="w-72 bg-teal-50 border border-teal-200 p-4 rounded-xl text-right print:bg-transparent print:border-gray-900">
                      <span className="text-xs uppercase font-bold text-teal-800 block">Celkem k úhradě</span>
                      <div className="text-2xl font-black text-teal-950 mt-1">{totalReceiptSum.toLocaleString("cs-CZ")} Kč</div>
                    </div>
                  </div>

                  <div className="mt-16 pt-4 border-t border-gray-200 flex justify-between items-end">
                    <div className="text-[10px] text-gray-400">
                      Doklad vystavil/a: {session?.user?.email || "Admin"}
                    </div>
                    <div className="text-center">
                      <div className="w-48 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs font-bold text-gray-800">Podpis a razítko vystavovatele</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-[#0D9488]" /> Dokumenty & Trvalé podsložky
                      </h2>
                      <p className="text-xs text-gray-500">Podsložky a dokumenty se ukládají do databáze a po obnovení stránky nezmizí.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 transition-colors border border-gray-300"
                      >
                        <FolderPlus className="w-4 h-4 text-[#0D9488]" /> Vytvořit novou podsložku
                      </button>

                      <label className="bg-[#0D9488] hover:bg-teal-700 text-white text-xs font-bold px-5 py-3 rounded-xl cursor-pointer flex items-center gap-2 shadow-md transition-colors">
                        <span className="flex items-center gap-2">
                          {uploadingDoc ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>
                            {uploadingDoc
                              ? "Ukládám do DB..."
                              : activeDocCategory
                              ? `Nahrát do složky: ${activeDocCategory}`
                              : "Zvolte podsložku"}
                          </span>
                        </span>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg" />
                      </label>
                    </div>
                  </div>

                  {showNewCategoryInput && (
                    <form onSubmit={handleCreateCategory} className="mb-6 p-4 bg-teal-50/60 rounded-xl border border-teal-200 flex gap-3 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Název nové podsložky (např. Všeobecné tiskopisy...)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-white border border-teal-300 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-[#0D9488] hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Uložit podsložku
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(false)}
                        className="text-gray-500 hover:text-gray-700 text-xs px-2"
                      >
                        Zrušit
                      </button>
                    </form>
                  )}

                  {docCategories.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-6">
                      Zatím nemáte vytvořené žádné podsložky. Klikněte nahoře na tlačítko „Vytvořit novou podsložku“.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-6 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      {docCategories.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => setActiveDocCategory(cat)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            activeDocCategory === cat 
                              ? "bg-white text-teal-900 shadow-sm border border-gray-300" 
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <FolderOpen className={`w-4 h-4 ${activeDocCategory === cat ? "text-[#0D9488]" : "text-gray-400"}`} />
                          <span>{cat}</span>
                          <button
                            onClick={(e) => handleDeleteCategory(cat, e)}
                            className="text-gray-400 hover:text-red-600 ml-1.5 p-0.5"
                            title="Smazat tuto podsložku"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeDocCategory && documents.filter(d => d.category === activeDocCategory).length === 0 ? (
                    <div className="p-12 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       Ve složce "{activeDocCategory}" zatím nejsou žádné dokumenty. Klikněte nahoře na tlačítko pro nahrání souboru.
                    </div>
                  ) : activeDocCategory ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.filter(d => d.category === activeDocCategory).map((doc) => (
                        <div key={doc.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between hover:border-teal-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
                              <FileCheck className="w-6 h-6" />
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</h4>
                              <span className="text-[10px] text-gray-400 block mt-0.5">Velikost: {doc.file_size || "Neznámá"}</span>
                              <span className="text-[10px] text-teal-700 block">Nahral: {doc.uploaded_by || "Admin"}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-[#0D9488] hover:text-teal-700 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-teal-200 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" /> Stáhnout / Tisk
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.title)}
                              className="text-red-500 hover:text-red-700 p-1.5"
                              title="Smazat dokument"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                <div className="lg:col-span-4 space-y-5 print:hidden">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Vyhledat & Zvolit pacienta *</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Hledat podle jména nebo RČ..."
                        value={globalPatientSearch}
                        onChange={(e) => setGlobalPatientSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0D9488]"
                      />
                    </div>
                    <select 
                      value={selectedPatientId} 
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#0D9488]"
                    >
                      {searchablePatients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (RČ: {p.birth_number})</option>
                      ))}
                      {searchablePatients.length === 0 && <option value="">Žádný pacient nenalezen</option>}
                    </select>

                    {selectedPatient && (
                      <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs space-y-1.5 mt-2">
                        <div className="font-bold text-teal-900">🎯 Cíl: {selectedPatient.patient_goal || "Neuvedeno"}</div>
                        <div className="text-gray-800">🥗 Styl: {selectedPatient.diet_preference || "Všežravec"}</div>
                        <div className="text-red-700 font-medium">⚠️ Alergie: {selectedPatient.allergies || "Žádné hlášené"}</div>
                        {selectedPatient.medications && <div className="text-purple-800">💊 Léky: {selectedPatient.medications}</div>}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleCreateNewReport}
                        className="flex-1 bg-teal-50 hover:bg-teal-100 text-[#0D9488] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-teal-200 transition-colors shadow-sm"
                      >
                        <FilePlus className="w-4 h-4" /> Nový dekurz (Dnes)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <History className="w-4 h-4 text-[#0D9488]" /> Historie návštěv & Dekurzů
                    </h3>
                    {savedReports.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Pro tohoto pacienta zatím nebyly uloženy žádné dekurzy.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {savedReports.map(rep => (
                          <div 
                            key={rep.id}
                            onClick={() => setCurrentReport(rep)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              currentReport.id === rep.id 
                                ? "bg-teal-50 border-[#0D9488] text-teal-900 font-bold shadow-sm" 
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="flex items-center gap-1 text-[#0D9488]">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(rep.report_date).toLocaleDateString("cs-CZ")}
                              </span>
                            </div>
                            <p className="truncate text-gray-800 font-medium">{rep.doc_title}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSaveReport}
                    disabled={savingReport}
                    className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {savingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Uložit dekurz do kartotéky pacienta
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full bg-[#1F2937] hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Printer className="w-4 h-4" /> Vytisknout / Uložit PDF
                  </button>
                </div>

                <div className="lg:col-span-8 bg-white p-12 rounded-2xl border border-gray-300 shadow-xl font-sans print:shadow-none print:border-none print:p-0">
                   
                  <div className="border-b-2 border-gray-900 pb-5 mb-6 flex justify-between items-start">
                    <div>
                      <h1 className="text-base font-bold uppercase tracking-wider text-gray-900">Nutriční & Metabolická Ambulance</h1>
                      <p className="text-xs text-gray-600">Klinická výživa, poradenství životního stylu a diagnostika</p>
                    </div>
                    <div className="text-right text-[11px] text-gray-500">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span className="font-bold text-gray-700">Datum vyšetření:</span>
                        <input 
                          type="date"
                          value={currentReport.report_date}
                          onChange={(e) => setCurrentReport({...currentReport, report_date: e.target.value})}
                          className="border border-gray-300 rounded px-2 py-0.5 text-xs font-semibold text-gray-800"
                        />
                      </div>
                      <p className="text-gray-400 text-[10px]">Pardubice</p>
                    </div>
                  </div>

                  <input 
                    type="text"
                    value={currentReport.doc_title}
                    onChange={(e) => setCurrentReport({...currentReport, doc_title: e.target.value})}
                    className="w-full text-center text-sm font-bold uppercase tracking-wide text-teal-900 mb-6 border-b border-teal-200 pb-2 focus:outline-none focus:border-[#0D9488]"
                    placeholder=""
                  />

                  {selectedPatient ? (
                    <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-200 mb-6 text-xs grid grid-cols-2 gap-3.5 print:bg-transparent print:border-gray-400">
                      <div><strong>Jméno pacienta:</strong> {selectedPatient.name}</div>
                      <div><strong>Rodné číslo (RČ):</strong> <span className="font-mono font-bold">{selectedPatient.birth_number}</span></div>
                      <div><strong>Datum narození:</strong> {selectedPatient.birth_date || "Neuvedeno"} ({selectedPatient.gender || "Neuvedeno"})</div>
                      <div><strong>Zdravotní pojišťovna:</strong> <span className="text-teal-800 font-bold">{selectedPatient.insurance_company || "Neuvedena"}</span></div>
                      <div><strong>Bydliště / Adresa:</strong> {selectedPatient.address || "Neuvedena"}</div>
                      <div><strong>Telefon:</strong> {selectedPatient.phone || "Neuvedeno"}</div>
                      <div className="col-span-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
                        <div>🎯 <strong>Cíl terapie:</strong> {selectedPatient.patient_goal || "Neuvedeno"}</div>
                        <div>🥗 <strong>Styl stravy:</strong> {selectedPatient.diet_preference || "Všežravec"}</div>
                        <div className="text-red-700 font-semibold">⚠️ <strong>Alergie:</strong> {selectedPatient.allergies || "Žádné"}</div>
                        <div className="text-purple-800 font-medium">💊 <strong>Léky/Doplňky:</strong> {selectedPatient.medications || "Neuvedeno"}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 mb-6">Vyberte pacienta pro zobrazení údajů.</p>
                  )}

                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 border-b border-teal-200 pb-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" /> I. Naměřené antropometrické & hemodynamické hodnoty
                    </h3>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-500 block text-[10px] mb-0.5">Hmotnost (kg)</span>
                        <input 
                          type="text"
                          value={currentReport.weight}
                          onChange={(e) => setCurrentReport({...currentReport, weight: e.target.value})}
                          className="w-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-500 block text-[10px] mb-0.5">Výška (cm)</span>
                        <input 
                          type="text"
                          value={currentReport.height}
                          onChange={(e) => setCurrentReport({...currentReport, height: e.target.value})}
                          className="w-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl">
                        <span className="text-teal-700 block text-[10px] mb-0.5">BMI</span>
                        <strong className="text-base font-extrabold">{bmi}</strong>
                      </div>
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-500 block text-[10px] mb-0.5">Tlak (mmHg)</span>
                        <input 
                          type="text"
                          value={currentReport.bp}
                          onChange={(e) => setCurrentReport({...currentReport, bp: e.target.value})}
                          className="w-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <span className="text-gray-500 block text-[10px] mb-0.5">Puls (tep/min)</span>
                        <input 
                          type="text"
                          value={currentReport.pulse}
                          onChange={(e) => setCurrentReport({...currentReport, pulse: e.target.value})}
                          className="w-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 border-b border-teal-200 pb-1">
                      II. Anamnéza & Subjektivní potíže
                    </h3>
                    <textarea
                      rows={2}
                      value={currentReport.anamnesis}
                      onChange={(e) => setCurrentReport({...currentReport, anamnesis: e.target.value})}
                      className="w-full text-xs text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-y"
                    />
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 border-b border-teal-200 pb-1">
                      III. Diagnóza / Nález
                    </h3>
                    <textarea
                      rows={2}
                      value={currentReport.diagnosis}
                      onChange={(e) => setCurrentReport({...currentReport, diagnosis: e.target.value})}
                      className="w-full text-xs text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-y"
                    />
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 border-b border-teal-200 pb-1">
                      IV. Diagnostická vyšetření & ABPM
                    </h3>
                    <textarea
                      rows={2}
                      value={currentReport.abpm_summary}
                      onChange={(e) => setCurrentReport({...currentReport, abpm_summary: e.target.value})}
                      className="w-full text-xs text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-y"
                    />
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 border-b border-teal-200 pb-1">
                      V. Nutriční terapeitický plán & Jídelníček
                    </h3>
                    <textarea
                      rows={5}
                      value={currentReport.nutritional_plan}
                      onChange={(e) => setCurrentReport({...currentReport, nutritional_plan: e.target.value})}
                      className="w-full text-xs text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-y font-mono"
                    />
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1 border-b border-teal-200 pb-1">
                      VI. Závěr a doporučená kontrola
                    </h3>
                    <textarea
                      rows={2}
                      value={currentReport.conclusion}
                      onChange={(e) => setCurrentReport({...currentReport, conclusion: e.target.value})}
                      className="w-full text-xs text-gray-800 leading-relaxed bg-transparent focus:outline-none resize-y"
                    />
                  </div>

                  <div className="mt-12 pt-4 border-t border-gray-200 flex justify-between items-end print:mt-16">
                    <div className="text-[10px] text-gray-400">
                      Zprávu zpracoval/a: <strong className="text-gray-700">{session?.user?.email || "Admin"}</strong> | Nutriční ambulance Pardubice
                    </div>
                    <div className="text-center">
                      <div className="w-40 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs font-bold text-gray-800">Nutriční asistent / Terapeut</p>
                      <p className="text-[10px] text-gray-500">Razítko a podpis</p>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {editingPatientId ? "Upravit profil pacienta" : "Přidat nového pacienta"}
            </h3>
            <p className="text-xs text-gray-500 mb-3">Vyplňte povinné osobní a klinické údaje (e-mail je volitelný).</p>

            {formErrorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold animate-shake">
                {formErrorMsg}
              </div>
            )}

            <div className="flex border-b border-gray-200 mb-5 gap-4">
              <button
                type="button"
                onClick={() => setModalTab("personal")}
                className={`pb-2.5 px-3 font-bold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
                  modalTab === "personal"
                    ? "border-[#0D9488] text-[#0D9488]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <User className="w-3.5 h-3.5" /> 1. Osobní & Kontaktní údaje
              </button>
              <button
                type="button"
                onClick={() => setModalTab("nutritional")}
                className={`pb-2.5 px-3 font-bold text-xs transition-all border-b-2 flex items-center gap-1.5 ${
                  modalTab === "nutritional"
                    ? "border-[#0D9488] text-[#0D9488]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Apple className="w-3.5 h-3.5" /> 2. Klinický & Nutriční profil
              </button>
            </div>

            <form onSubmit={handleSubmitPatient} className="space-y-4">
              {modalTab === "personal" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Jméno a příjmení *</label>
                    <input
                      type="text"
                      placeholder="např. Jan Novák"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none ${
                        formErrors.name ? "border-red-500 bg-red-50/50" : "border-gray-300"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rodné číslo (RČ) *</label>
                      <input
                        type="text"
                        placeholder="např. 820515/1234"
                        value={formData.birth_number}
                        onChange={(e) => setFormData({ ...formData, birth_number: e.target.value })}
                        className={`w-full border rounded-xl p-2.5 text-sm font-mono focus:ring-2 focus:ring-[#0D9488] focus:outline-none ${
                          formErrors.birth_number ? "border-red-500 bg-red-50/50" : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Datum narození *</label>
                      <input
                        type="text"
                        placeholder="např. 15.05.1982"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className={`w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none ${
                          formErrors.birth_date ? "border-red-500 bg-red-50/50" : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pohlaví *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                      >
                        <option value="Muž">Muž</option>
                        <option value="Žena">Žena</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Zdravotní pojišťovna *</label>
                      <select
                        value={formData.insurance_company}
                        onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                      >
                        <option value="VZP (111)">VZP (111)</option>
                        <option value="VoZP (201)">VoZP (201)</option>
                        <option value="ČPZP (205)">ČPZP (205)</option>
                        <option value="OZP (207)">OZP (207)</option>
                        <option value="ZPŠ (209)">ZPŠ (209)</option>
                        <option value="ZPMV (211)">ZPMV (211)</option>
                        <option value="RBP (213)">RBP (213)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Telefon *</label>
                      <input
                        type="text"
                        placeholder="+420 777 111 222"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none ${
                          formErrors.phone ? "border-red-500 bg-red-50/50" : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">E-mail <span className="text-gray-400 font-normal">(nepovinné)</span></label>
                      <input
                        type="email"
                        placeholder="jan@novak.cz"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Bydliště / Adresa *</label>
                    <input
                      type="text"
                      placeholder="např. Masarykova 123, Pardubice"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none ${
                        formErrors.address ? "border-red-500 bg-red-50/50" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              )}

              {modalTab === "nutritional" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-teal-900 mb-1">🎯 Hlavní cíl pacienta / terapie *</label>
                    <input
                      type="text"
                      placeholder="např. Redukce hmotnosti, úprava tlaku, nabrání svalů..."
                      value={formData.patient_goal}
                      onChange={(e) => setFormData({ ...formData, patient_goal: e.target.value })}
                      className={`w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium ${
                        formErrors.patient_goal ? "border-red-500 bg-red-50/50" : "border-teal-200 bg-teal-50/30"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">🥗 Styl stravy *</label>
                      <select
                        value={formData.diet_preference}
                        onChange={(e) => setFormData({ ...formData, diet_preference: e.target.value })}
                        className="w-full border border-teal-200 bg-teal-50/30 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                      >
                        <option value="Všežravec (Standard)">Všežravec (Standard)</option>
                        <option value="Vegetarián">Vegetarián</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Low-carb / Keto">Low-carb / Keto</option>
                        <option value="Bezlepková dieta">Bezlepková dieta</option>
                        <option value="Bezlaktózová dieta">Bezlaktózová dieta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">⚡ Pohybová aktivita *</label>
                      <select
                        value={formData.activity_level}
                        onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                        className="w-full border border-teal-200 bg-teal-50/30 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-[#0D9488] focus:outline-none font-medium"
                      >
                        <option value="Nízká (sedavé zaměstnání)">Nízká (sedavé zaměstnání)</option>
                        <option value="Střední aktivita">Střední aktivita</option>
                        <option value="Vysoká (sportovec / fyzicky)">Vysoká (sportovec / fyzicky)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">⚠️ Alergie & Intolerance <span className="text-gray-400 font-normal">(nepovinné)</span></label>
                    <input
                      type="text"
                      placeholder="např. ořechy, laktóza, lepek..."
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full border border-red-200 bg-red-50/30 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">💊 Užité léky & doplňky stravy <span className="text-gray-400 font-normal">(nepovinné)</span></label>
                    <input
                      type="text"
                      placeholder="např. léky na hypertenzi, vitamín D, omega-3..."
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      className="w-full border border-purple-200 bg-purple-50/30 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="is_test"
                  checked={formData.is_test}
                  onChange={(e) => setFormData({ ...formData, is_test: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="is_test" className="text-xs text-purple-900 font-bold cursor-pointer">
                  Označit jako <strong>TESTOVACÍHO pacienta</strong> (snazší mazání)
                </label>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                {modalTab === "nutritional" ? (
                  <button
                    type="button"
                    onClick={() => setModalTab("personal")}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    ← Zpět na osobní údaje
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Zrušit
                  </button>

                  {modalTab === "personal" ? (
                    <button
                      type="button"
                      onClick={() => setModalTab("personal")}
                      className="px-5 py-2 text-sm font-semibold bg-[#0D9488] hover:bg-teal-700 text-white rounded-xl shadow-md transition-colors"
                      onClickCapture={() => setModalTab("nutritional")}
                    >
                      Další: Nutriční profil →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 text-sm font-semibold bg-[#0D9488] hover:bg-teal-700 text-white rounded-xl flex items-center gap-2 shadow-md transition-colors"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingPatientId ? "Uložit změny" : "Uložit pacienta"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}