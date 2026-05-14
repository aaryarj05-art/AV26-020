import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function EmergencyPassportView() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/passport/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-helix-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-helix-accent/20 border-t-helix-accent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-helix-background flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-helix-danger mb-4">Passport Not Found</h1>
      <p className="text-helix-text-muted">The emergency medical summary could not be retrieved.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6 pb-24 font-sans">
      {/* Emergency Header */}
      <div className="bg-helix-danger text-white p-6 rounded-3xl mb-8 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-center">EMERGENCY MEDICAL SUMMARY</h1>
        <p className="text-[10px] font-bold text-center mt-2 opacity-90">Verify patient identity before proceeding. Call 112 if not already done.</p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Critical Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-helix-surface p-8 rounded-[2.5rem] border border-helix-border text-center">
            <p className="text-xs font-bold text-helix-text-muted uppercase mb-2">Blood Type</p>
            <p className="text-6xl font-black text-helix-accent">{data.blood_type}</p>
          </div>
          <div className="bg-helix-surface p-8 rounded-[2.5rem] border border-helix-border text-center">
            <p className="text-xs font-bold text-helix-text-muted uppercase mb-2">Initials</p>
            <p className="text-6xl font-black">{data.initials}</p>
          </div>
        </div>

        {/* Allergy Warning */}
        {data.allergies.length > 0 ? (
          <div className="bg-helix-danger/10 border-2 border-helix-danger rounded-[2rem] p-8">
            <h2 className="text-helix-danger font-black uppercase tracking-widest text-sm mb-4">⚠️ SEVERE ALLERGIES</h2>
            <div className="flex flex-wrap gap-3">
              {data.allergies.map((a: string) => (
                <span key={a} className="bg-helix-danger text-white px-4 py-2 rounded-xl text-lg font-bold">{a}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-helix-success/10 border border-helix-success/30 rounded-[2rem] p-6 text-center">
            <p className="text-helix-success font-bold">NO KNOWN DRUG ALLERGIES</p>
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8">
          <h2 className="text-xs font-bold text-helix-text-muted uppercase tracking-widest mb-6">In Case of Emergency (ICE)</h2>
          <div className="space-y-4">
            {data.emergency_contacts.map((c: any, i: number) => (
              <a 
                key={i} 
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-helix-accent transition-all"
              >
                <div>
                  <p className="font-black text-xl">{c.name}</p>
                  <p className="text-xs text-helix-text-muted uppercase font-bold">{c.relation}</p>
                </div>
                <div className="bg-helix-accent text-black p-4 rounded-2xl">
                  <span className="text-2xl">📞</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-bold text-helix-text-muted uppercase mb-4">Chronic Conditions</h3>
            <ul className="space-y-2">
              {data.chronic_conditions.length > 0 ? data.chronic_conditions.map((c: string) => (
                <li key={c} className="text-sm font-medium border-b border-white/5 pb-2">▪ {c}</li>
              )) : <li className="text-sm text-helix-text-muted">None reported</li>}
            </ul>
          </div>
          <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8">
            <h3 className="text-[10px] font-bold text-helix-text-muted uppercase mb-4">Current Medications</h3>
            <ul className="space-y-2">
              {data.current_medications.length > 0 ? data.current_medications.map((m: string) => (
                <li key={m} className="text-sm font-medium border-b border-white/5 pb-2">💊 {m}</li>
              )) : <li className="text-sm text-helix-text-muted">None reported</li>}
            </ul>
          </div>
        </div>

        {/* Clinical Risks */}
        <div className="bg-helix-surface border border-helix-border rounded-[2.5rem] p-8">
          <h3 className="text-[10px] font-bold text-helix-text-muted uppercase mb-6">Historical Clinical Risks</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.risk_scores.diabetes}%</p>
              <p className="text-[8px] text-helix-text-muted uppercase font-bold">Diabetes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.risk_scores.heart}%</p>
              <p className="text-[8px] text-helix-text-muted uppercase font-bold">Heart</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{data.risk_scores.stroke}%</p>
              <p className="text-[8px] text-helix-text-muted uppercase font-bold">Stroke</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-8 bg-black/40 rounded-3xl border border-white/5">
          <p className="text-[10px] text-helix-text-muted mb-2">Patient Organ Donor Status</p>
          <p className="text-2xl font-black text-helix-accent">{data.organ_donor ? "YES, REGISTERED DONOR" : "NOT SPECIFIED"}</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex justify-center">
        <a 
          href="tel:112"
          className="w-full max-w-sm py-4 bg-helix-danger text-white text-center font-black rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-bounce"
        >
          CALL EMERGENCY (112)
        </a>
      </div>
    </div>
  );
}
