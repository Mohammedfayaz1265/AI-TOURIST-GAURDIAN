import React, { useState } from 'react';
import { useTrips } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Hotel,
  Bus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const TripManagementView: React.FC = () => {
  const {
    trips,
    activeTrip,
    createTrip,
    updateTripStatus,
    reminderState,
    respondToTripReminder,
  } = useTrips();
  const { currentUser } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('Mysore & Grand Palace Grounds');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [hotelName, setHotelName] = useState('Grand Heritage Hotel');
  const [transport, setTransport] = useState('Pre-registered Tourist Shuttle');

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await createTrip({
      touristId: currentUser.id,
      title,
      destinations: destination.split(',').map((d) => d.trim()),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      accommodationName: hotelName,
      accommodationVerified: true,
      status: 'ACTIVE',
      riskLevel: 'LOW',
      activities: ['Heritage Walk', 'Temple Procession', 'Evening Cultural Gala'],
      transportMode: transport,
    });
    setIsCreateModalOpen(false);
    setTitle('');
  };

  return (
    <div id="trip-management-view" className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Trip Lifecycle & Safety Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time itinerary monitoring, accommodation verification & 24h automated trip-end checks.
          </p>
        </div>

        <button
          id="create-new-trip-button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* 24-Hour Trip End Safety Automation Engine Card */}
      {activeTrip && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 rounded-3xl p-6 border border-cyan-500/40 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
                  AUTOMATED SAFETY PROTOCOL
                </span>
                <h3 className="text-base font-black text-white">
                  24-Hour Trip-End Safety Check
                </h3>
              </div>
            </div>

            {/* Response Status Pill */}
            {reminderState.touristResponded ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                VERIFIED SAFE ({reminderState.responseType})
              </span>
            ) : reminderState.stage === 'ESCALATED_MANUAL_FOLLOWUP' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                ESCALATED TO AUTHORITIES
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ATTEMPT {reminderState.attemptCount} OF 3
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            "Your planned trip ends in 24 hours. Are you safe and on schedule?"
          </p>

          {/* Interactive Response Controls */}
          {!reminderState.touristResponded && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="trip-reminder-safe-button"
                onClick={() => respondToTripReminder('SAFE')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I'M SAFE & ON SCHEDULE</span>
              </button>
              <button
                id="trip-reminder-help-button"
                onClick={() => respondToTripReminder('NEED_HELP')}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md shadow-rose-600/30"
              >
                <AlertCircle className="w-4 h-4" />
                <span>NEED ASSISTANCE / REPORT ISSUE</span>
              </button>
            </div>
          )}

          {reminderState.touristResponded && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmation logged into Immutable Audit Trail at{' '}
              {new Date(reminderState.respondedAt || Date.now()).toLocaleTimeString()}.
              Subsequent automated reminders are stopped.
            </p>
          )}
        </div>
      )}

      {/* Active Trip Details & Visual Timeline */}
      {activeTrip && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">
                ACTIVE TRIP ITINERARY
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeTrip.title}
              </h2>
            </div>

            {/* Progression Status Selector */}
            <div className="flex items-center gap-2">
              {(['PLANNED', 'ACTIVE', 'ENDING_SOON', 'COMPLETED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => updateTripStatus(activeTrip.id, status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTrip.status === status
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Key Trip Meta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Destinations</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeTrip.destinations.join(', ')}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <Hotel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Accommodation</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeTrip.accommodationName}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <Bus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Transport</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeTrip.transportMode}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Timeline: Arrival -> Stay -> Activities -> Departure -> Completed */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trip Milestone Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {[
                { title: '1. Arrival & Check-In', state: 'COMPLETED', desc: 'Hotel ID verified' },
                { title: '2. Temple Darshan', state: 'COMPLETED', desc: 'Zone A morning slot' },
                { title: '3. Cultural Gala', state: 'IN_PROGRESS', desc: 'Zone B active' },
                { title: '4. 24h Safe-End Check', state: 'ACTIVE', desc: 'Prompt dispatched' },
                { title: '5. Departure & Review', state: 'UPCOMING', desc: 'Feedback pending' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    step.state === 'COMPLETED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                      : step.state === 'IN_PROGRESS' || step.state === 'ACTIVE'
                      ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-500 text-cyan-900 dark:text-cyan-300 ring-2 ring-cyan-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">{step.title}</span>
                    {step.state === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-[10px] opacity-80">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Plan New Trip Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Travel Itinerary
            </h2>

            <form onSubmit={handleCreateTrip} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mysore Palace & Heritage Temple Tour"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Destinations (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Verified Accommodation
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Save & Activate Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
