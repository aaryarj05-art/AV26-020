import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  city: string;
  rating: number;
  consultation_fee: number;
  languages: string;
  profile_image_url: string;
  available_slots: string; // JSON string
}

interface Recommendation {
  specialization: string;
  reason: string;
}

interface Appointment {
  id: number;
  booking_id: string;
  doctor_id: number;
  date: string;
  time_slot: string;
  patient_name: string;
  status: string;
  join_url: string;
  doctor?: Doctor;
}

export default function Teleconsult() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    time_slot: '',
    patient_name: 'Aarya',
    symptoms: '',
  });
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState<string | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');

  useEffect(() => {
    fetchData();
    fetchMyAppointments();
  }, [cityFilter, specFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get mock risk profile for demo
      const mockRisk = JSON.stringify({ stroke_risk: 75, heart_risk: 40 });
      const mockSymptoms = "I have a severe headache and some slurred speech";
      
      const res = await axios.get(`http://localhost:8000/api/teleconsult/doctors`, {
        params: {
          city: cityFilter || undefined,
          specialization: specFilter || undefined,
          risk_profile: mockRisk,
          symptoms: mockSymptoms
        }
      });
      setDoctors(res.data.doctors);
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/teleconsult/my-appointments');
      setMyAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingStep(1);
    setShowBooking(true);
    setBookingSuccess(null);
    fetchSlots(doctor.id, bookingData.date);
  };

  const fetchSlots = async (docId: number, date: string) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/teleconsult/doctors/${docId}/slots`, {
        params: { date }
      });
      setAvailableSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/teleconsult/appointments/book', {
        doctor_id: selectedDoctor?.id,
        date: bookingData.date,
        time_slot: bookingData.time_slot,
        patient_name: bookingData.patient_name,
        symptoms: bookingData.symptoms,
        risk_score: 75 // Mock
      });
      setBookingSuccess(res.data.booking_id);
      setBookingStep(4);
      fetchMyAppointments();
    } catch (err) {
      alert("Booking failed. Slot might have been taken.");
    }
  };

  return (
    <div className="min-h-screen bg-helix-background p-8 pb-24 text-helix-text animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🩺</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Helix <span className="text-helix-accent">Teleconsultation</span></h1>
          <p className="text-sm text-helix-text-muted">AI-driven specialist matching & video consultations</p>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {recommendations.length > 0 && (
        <div className="mb-8 bg-helix-accent/10 border border-helix-accent/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <span className="text-8xl">🧠</span>
          </div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-helix-accent">AI Recommended Specialists</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <p className="text-helix-accent font-bold mb-1">{rec.specialization}</p>
                <p className="text-xs text-helix-text-muted">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-6">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2">Specialization</label>
                <select 
                  className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none"
                  value={specFilter}
                  onChange={(e) => setSpecFilter(e.target.value)}
                >
                  <option value="">All Specialities</option>
                  <option>General Physician</option>
                  <option>Epidemiologist</option>
                  <option>Cardiologist</option>
                  <option>Neurologist</option>
                  <option>Pulmonologist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2">City</label>
                <select 
                  className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm focus:border-helix-accent outline-none"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  <option>Bangalore</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Hyderabad</option>
                  <option>Chennai</option>
                  <option>Pune</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-helix-surface border border-helix-border rounded-3xl p-6">
            <h3 className="text-sm font-bold text-helix-text-muted uppercase tracking-widest mb-4">Upcoming Calls</h3>
            <div className="space-y-3">
              {myAppointments.filter(a => a.status === 'scheduled').slice(0, 3).map(app => (
                <div key={app.id} className="p-3 bg-black/20 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-helix-accent">{app.time_slot}</span>
                    <span className="text-helix-text-muted">{app.date}</span>
                  </div>
                  <p className="font-medium truncate mb-2">Consultation #{app.booking_id}</p>
                  <button 
                    onClick={() => setShowVideo(app.join_url)}
                    className="w-full py-2 bg-helix-accent/20 text-helix-accent rounded-lg font-bold hover:bg-helix-accent hover:text-black transition-all"
                  >
                    Join Room
                  </button>
                </div>
              ))}
              {myAppointments.length === 0 && <p className="text-center text-helix-text-muted py-4 italic">No appointments</p>}
            </div>
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-helix-text-muted">
              <div className="w-12 h-12 border-4 border-helix-accent/20 border-t-helix-accent rounded-full animate-spin mb-4" />
              <p>Scanning Helix Network for Doctors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map(doc => (
                <div key={doc.id} className="bg-helix-surface border border-helix-border rounded-3xl p-5 hover:border-helix-accent/50 transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={doc.profile_image_url} alt={doc.name} className="w-16 h-16 rounded-2xl bg-black/30 object-cover" />
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-helix-accent transition-colors">{doc.name}</h4>
                      <p className="text-xs text-helix-accent font-semibold">{doc.specialization}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-helix-warning text-xs">★</span>
                        <span className="text-xs font-bold">{doc.rating}</span>
                        <span className="text-[10px] text-helix-text-muted ml-2">{doc.city}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t border-white/5 mb-4">
                    <div>
                      <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-wider">Fee</p>
                      <p className="text-sm font-bold">₹{doc.consultation_fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-helix-text-muted uppercase font-bold tracking-wider">Languages</p>
                      <p className="text-[10px] font-medium">{doc.languages.split(',')[0]} +{doc.languages.split(',').length - 1}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => startBooking(doc)}
                    className="w-full py-3 bg-helix-surface-light border border-helix-border rounded-2xl font-bold text-sm hover:bg-helix-accent hover:text-black hover:border-helix-accent transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
              {doctors.length === 0 && (
                <div className="col-span-full py-12 text-center text-helix-text-muted">
                  <span className="text-4xl block mb-4">🔍</span>
                  <p>No doctors found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-helix-surface border border-helix-border w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowBooking(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center hover:bg-helix-danger transition-colors"
            >
              ✕
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedDoctor?.profile_image_url} className="w-14 h-14 rounded-2xl" />
                <div>
                  <h3 className="text-xl font-bold">{selectedDoctor?.name}</h3>
                  <p className="text-sm text-helix-accent">{selectedDoctor?.specialization}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {bookingStep < 4 && (
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${bookingStep >= i ? 'bg-helix-accent' : 'bg-helix-border'}`} />
                  ))}
                </div>
              )}

              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold">Select Date</h4>
                  <input 
                    type="date" 
                    className="w-full bg-black/30 border border-helix-border rounded-2xl p-4 outline-none focus:border-helix-accent"
                    value={bookingData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setBookingData({...bookingData, date: e.target.value});
                      fetchSlots(selectedDoctor!.id, e.target.value);
                    }}
                  />
                  <button 
                    onClick={() => setBookingStep(2)}
                    className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl mt-4"
                  >
                    Select Time Slot
                  </button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold">Available Slots for {bookingData.date}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(slot => (
                      <button 
                        key={slot.id}
                        onClick={() => setBookingData({...bookingData, time_slot: slot.time_slot})}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${bookingData.time_slot === slot.time_slot ? 'bg-helix-accent border-helix-accent text-black' : 'bg-black/20 border-helix-border hover:border-white/20'}`}
                      >
                        {slot.time_slot}
                      </button>
                    ))}
                    {availableSlots.length === 0 && <p className="col-span-3 text-center text-xs text-helix-danger py-4">No slots available on this date.</p>}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setBookingStep(1)} className="flex-1 py-4 border border-helix-border rounded-2xl font-bold">Back</button>
                    <button 
                      onClick={() => setBookingStep(3)} 
                      disabled={!bookingData.time_slot}
                      className="flex-1 py-4 bg-helix-accent text-black font-bold rounded-2xl disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold">Patient Details</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-helix-text-muted uppercase mb-2">Patient Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm outline-none"
                      value={bookingData.patient_name}
                      onChange={(e) => setBookingData({...bookingData, patient_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-helix-text-muted uppercase mb-2">Describe Symptoms</label>
                    <textarea 
                      className="w-full bg-black/30 border border-helix-border rounded-xl p-3 text-sm h-32 outline-none"
                      placeholder="e.g., headache for 2 days, fever..."
                      value={bookingData.symptoms}
                      onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={handleBook}
                    className="w-full py-4 bg-helix-accent text-black font-bold rounded-2xl mt-4 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                  >
                    Confirm Booking (₹{selectedDoctor?.consultation_fee})
                  </button>
                </div>
              )}

              {bookingStep === 4 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-helix-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-helix-success">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                  <p className="text-helix-text-muted text-sm mb-6">Your consultation ID is <span className="text-helix-accent font-mono font-bold">{bookingSuccess}</span></p>
                  
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-8 text-left">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-helix-text-muted">Doctor</span>
                      <span className="font-bold">{selectedDoctor?.name}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-helix-text-muted">Date & Time</span>
                      <span className="font-bold">{bookingData.date} @ {bookingData.time_slot}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowBooking(false)}
                    className="w-full py-4 border border-helix-accent text-helix-accent font-bold rounded-2xl"
                  >
                    Close & View Appointments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black animate-fade-in">
          <div className="w-full h-full max-w-6xl max-h-[800px] flex flex-col bg-helix-surface border border-helix-border rounded-[3rem] overflow-hidden">
            <div className="p-6 border-b border-helix-border flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-helix-danger rounded-full animate-pulse" />
                <span className="font-bold uppercase tracking-widest text-xs">Live Consultation</span>
              </div>
              <button onClick={() => setShowVideo(null)} className="px-6 py-2 bg-helix-danger/10 text-helix-danger border border-helix-danger/30 rounded-full font-bold text-xs hover:bg-helix-danger hover:text-white transition-all">End Session</button>
            </div>
            <div className="flex-1 bg-black">
              <iframe 
                src={showVideo} 
                className="w-full h-full border-none"
                allow="camera; microphone; display-capture; fullscreen"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
