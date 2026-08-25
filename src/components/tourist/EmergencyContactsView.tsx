import React, { useState } from 'react';
import { useTrips } from '../../context/TripContext';
import { PhoneCall, Plus, Trash2, ShieldCheck, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

export const EmergencyContactsView: React.FC = () => {
  const { emergencyContacts, addEmergencyContact, deleteEmergencyContact } = useTrips();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent / Guardian');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<'PRIMARY' | 'SECONDARY'>('PRIMARY');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEmergencyContact({
      userId: 'test-tourist-national-01',
      name,
      relationship,
      phone,
      email: email || undefined,
      priority,
      verified: true,
    });
    setIsModalOpen(false);
    setName('');
    setPhone('+91 ');
  };

  return (
    <div id="emergency-contacts-view" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-cyan-500" />
            Emergency Contacts & Next-of-Kin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Contacts alerted during critical SOS triggers or unanswered 24-hour trip completion checks.
          </p>
        </div>

        <button
          id="add-contact-button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {contact.name}
                  </h3>
                  <span className="text-xs text-slate-400">{contact.relationship}</span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  contact.priority === 'PRIMARY'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {contact.priority} CONTACT
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5 font-mono">
              <div className="text-slate-800 dark:text-slate-200">
                📞 {contact.phone}
              </div>
              {contact.email && (
                <div className="text-slate-600 dark:text-slate-400">
                  ✉️ {contact.email}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> SMS & Call Alert Verified
              </span>

              <button
                onClick={() => deleteEmergencyContact(contact.id)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Emergency Contact
            </h2>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Mohammed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sister / Next of Kin"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="contact@family.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Contact Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="PRIMARY">Primary Contact (Dial First)</option>
                  <option value="SECONDARY">Secondary Backup</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
