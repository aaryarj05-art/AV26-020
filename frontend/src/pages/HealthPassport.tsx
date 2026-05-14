import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PassportData {
  name: string;
  blood_type: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contacts: { name: string; phone: string; relation: string }[];
  risk_scores: { diabetes: number; heart: number; stroke: number };
  organ_donor: boolean;
}

export default function HealthPassport() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PassportData>({
    name: "Aarya Sharma",
    blood_type: "O+",
    allergies: ["Penicillin"],
    chronic_conditions: [],
    current_medications: [],
    emergency_contacts: [{ name: "Raj Sharma", phone: "9876543210", relation: "Father" }],
    risk_scores: { diabetes: 75, heart: 40, stroke: 20 },
    organ_donor: true
  });
  const [passportId, setPassportId] = useState<string | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPassport = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/passport/create', formData);
      setPassportId(res.data.passport_id);
      
      const qrRes = await axios.get(`http://localhost:8000/api/passport/${res.data.passport_id}/qr`);
      setQrBase64(qrRes.data.qr_base64);
      setStep(6); // Success / View Card
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const url = `http://localhost:5173/passport/${passportId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const shareWhatsApp = () => {
    const url = `http://localhost:5173/passport/${passportId}`;
    const text = encodeURIComponent(`This is my Helix Emergency Health Passport. In case of emergency, scan this QR or visit: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-32 text-helix-text animate-fade-in">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">🪪</span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Emergency <span className="text-helix-accent">Health Passport</span></h1>
          <p className="text-sm text-helix-text-muted">A secure, scannable life-saving medical summary</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {step < 6 ? (
          <div className="bg-helix-surface border border-helix-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-helix-border">
              <div className="h-full bg-helix-accent transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
            </div>

            <div className="mb-10 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {step === 1 && "Critical Information"}
                {step === 2 && "Conditions & Meds"}
                {step === 3 && "Emergency Contacts"}
                {step === 4 && "Clinical Risk Profile"}
                {step === 5 && "Preferences"}
              </h2>
              <span className="text-xs font-mono text-helix-accent uppercase tracking-widest">Step {step} of 5</span>
            </div>

            <div className="space-y-8 min-h-[300px]">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-helix-text-muted uppercase">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-helix-text-muted uppercase">Blood Type</label>
                    <select 
                      className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                      value={formData.blood_type}
                      onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-helix-text-muted uppercase">Allergies (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent"
                      placeholder="e.g. Penicillin, Peanuts"
                      value={formData.allergies.join(", ")}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value.split(",").map(s => s.trim())})}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-helix-text-muted uppercase">Chronic Conditions</label>
                    <textarea 
                      className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent h-32"
                      placeholder="List any ongoing health conditions..."
                      value={formData.chronic_conditions.join("\n")}
                      onChange={(e) => setFormData({...formData, chronic_conditions: e.target.value.split("\n")})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-helix-text-muted uppercase">Current Medications</label>
                    <textarea 
                      className="w-full bg-black/20 border border-helix-border rounded-xl p-4 outline-none focus:border-helix-accent h-32"
                      placeholder="List medications and dosages..."
                      value={formData.current_medications.join("\n")}
                      onChange={(e) => setFormData({...formData, current_medications: e.target.value.split("\n")})}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {formData.emergency_contacts.map((contact, i) => (
                    <div key={i} className="p-6 bg-black/20 border border-helix-border rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-helix-text-muted uppercase">Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/20 border border-helix-border rounded-lg p-2 text-sm"
                          value={contact.name}
                          onChange={(e) => {
                            const newContacts = [...formData.emergency_contacts];
                            newContacts[i].name = e.target.value;
                            setFormData({...formData, emergency_contacts: newContacts});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-helix-text-muted uppercase">Phone</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/20 border border-helix-border rounded-lg p-2 text-sm"
                          value={contact.phone}
                          onChange={(e) => {
                            const newContacts = [...formData.emergency_contacts];
                            newContacts[i].phone = e.target.value;
                            setFormData({...formData, emergency_contacts: newContacts});
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-helix-text-muted uppercase">Relation</label>
                        <input 
                          type="text" 
                          className="w-full bg-black/20 border border-helix-border rounded-lg p-2 text-sm"
                          value={contact.relation}
                          onChange={(e) => {
                            const newContacts = [...formData.emergency_contacts];
                            newContacts[i].relation = e.target.value;
                            setFormData({...formData, emergency_contacts: newContacts});
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setFormData({...formData, emergency_contacts: [...formData.emergency_contacts, {name: "", phone: "", relation: ""}]})}
                    className="text-xs text-helix-accent font-bold"
                  >
                    + Add Another Contact
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <p className="text-sm text-helix-text-muted italic">We've imported your clinical risk scores from your last assessment. These help responders understand your baseline health vulnerabilities.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-helix-accent/5 border border-helix-accent/20 rounded-2xl text-center">
                      <p className="text-xs font-bold text-helix-text-muted uppercase mb-2">Diabetes Risk</p>
                      <p className="text-3xl font-bold">{formData.risk_scores.diabetes}%</p>
                    </div>
                    <div className="p-6 bg-helix-accent/5 border border-helix-accent/20 rounded-2xl text-center">
                      <p className="text-xs font-bold text-helix-text-muted uppercase mb-2">Heart Risk</p>
                      <p className="text-3xl font-bold">{formData.risk_scores.heart}%</p>
                    </div>
                    <div className="p-6 bg-helix-accent/5 border border-helix-accent/20 rounded-2xl text-center">
                      <p className="text-xs font-bold text-helix-text-muted uppercase mb-2">Stroke Risk</p>
                      <p className="text-3xl font-bold">{formData.risk_scores.stroke}%</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-black/20 border border-helix-border rounded-2xl">
                    <div>
                      <h4 className="font-bold">Organ Donor Status</h4>
                      <p className="text-xs text-helix-text-muted">Include your preference in the emergency summary</p>
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, organ_donor: !formData.organ_donor})}
                      className={`w-14 h-8 rounded-full transition-all relative ${formData.organ_donor ? 'bg-helix-success' : 'bg-helix-border'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.organ_donor ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="p-6 bg-helix-warning/5 border border-helix-warning/20 rounded-2xl">
                    <p className="text-xs text-helix-warning leading-relaxed">
                      <strong>Legal Disclaimer:</strong> This health passport is for emergency informational purposes only and does not constitute a legally binding medical document or advance directive. Always consult with legal and medical professionals for formal documentation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 flex gap-4">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="px-10 py-4 border border-helix-border rounded-2xl font-bold hover:bg-helix-surface-light transition-all"
                >
                  Back
                </button>
              )}
              <button 
                onClick={() => step === 5 ? createPassport() : setStep(step + 1)}
                className="flex-1 py-4 bg-helix-accent text-black font-bold rounded-2xl shadow-lg shadow-helix-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {step === 5 ? (loading ? "Generating Passport..." : "Finish & Generate") : "Continue"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-scale-in">
            {/* The Digital Card */}
            <div className="max-w-md mx-auto aspect-[1.6/1] bg-helix-surface border border-helix-border rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              {/* Dynamic Design Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-helix-accent/10 via-transparent to-transparent opacity-50" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-helix-accent/5 rounded-full blur-3xl" />
              
              <div className="relative p-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-bold tracking-tighter">
                      <span className="text-helix-accent">{formData.blood_type}</span> | {formData.name.split(" ")[0][0]}{formData.name.split(" ")[1]?.[0]}
                    </h3>
                    <p className="text-[10px] text-helix-text-muted uppercase tracking-widest font-bold mt-1">Helix Emergency ID</p>
                  </div>
                  {qrBase64 && (
                    <div className="p-2 bg-white rounded-xl">
                      <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code" className="w-20 h-20" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {formData.allergies.length > 0 && (
                    <div className="px-4 py-2 bg-helix-danger/10 border border-helix-danger/30 rounded-xl">
                      <p className="text-[10px] font-black text-helix-danger uppercase tracking-tighter">⚠️ ALLERGIES: {formData.allergies.join(", ")}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-[8px] text-helix-text-muted uppercase font-bold mb-1">ICE Contact</p>
                      <p className="text-xs font-bold">{formData.emergency_contacts[0].name}</p>
                      <p className="text-[10px] text-helix-accent font-mono">{formData.emergency_contacts[0].phone}</p>
                    </div>
                    <div className="w-px bg-helix-border h-8 mt-2" />
                    <div className="flex-1 pl-4">
                      <p className="text-[8px] text-helix-text-muted uppercase font-bold mb-1">Donor</p>
                      <p className="text-xs font-bold">{formData.organ_donor ? "YES" : "NO"}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-helix-text-muted flex justify-between items-center opacity-50">
                  <span>VALID UNTIL 12/2026</span>
                  <span className="italic">Scanned by responder? Call 112.</span>
                </div>
              </div>
            </div>

            {/* Sharing Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={copyLink}
                className="p-5 bg-helix-surface border border-helix-border rounded-2xl text-xs font-bold hover:bg-helix-surface-light transition-all flex flex-col items-center gap-3"
              >
                <span className="text-xl">🔗</span> Copy Link
              </button>
              <button 
                onClick={shareWhatsApp}
                className="p-5 bg-helix-surface border border-helix-border rounded-2xl text-xs font-bold hover:bg-helix-surface-light transition-all flex flex-col items-center gap-3"
              >
                <span className="text-xl">💬</span> WhatsApp
              </button>
              <a 
                href={`http://localhost:8000/api/passport/${passportId}/pdf`}
                className="p-5 bg-helix-surface border border-helix-border rounded-2xl text-xs font-bold hover:bg-helix-surface-light transition-all flex flex-col items-center gap-3"
              >
                <span className="text-xl">📄</span> Wallet Card PDF
              </a>
              <button 
                onClick={() => window.print()}
                className="p-5 bg-helix-accent text-black rounded-2xl text-xs font-bold hover:scale-105 transition-all flex flex-col items-center gap-3"
              >
                <span className="text-xl">🖨️</span> Print Card
              </button>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep(1)}
                className="text-sm text-helix-text-muted hover:text-helix-accent transition-all underline underline-offset-4"
              >
                Edit Passport Information
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
