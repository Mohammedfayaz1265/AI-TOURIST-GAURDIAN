import React, { useState } from 'react';
import { useTrips } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare, ShieldCheck, CheckCircle2, ImagePlus, Eye, Lock, Globe2 } from 'lucide-react';

export const TripFeedbackView: React.FC = () => {
  const { feedbacks, submitFeedback, activeTrip } = useTrips();
  const { currentUser } = useAuth();

  const [overallRating, setOverallRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(4);
  const [crowdingRating, setCrowdingRating] = useState(4);
  const [transportRating, setTransportRating] = useState(5);
  const [accommodationRating, setAccommodationRating] = useState(5);
  const [accessibilityRating, setAccessibilityRating] = useState(4);
  const [comment, setComment] = useState('');
  const [consentLevel, setConsentLevel] = useState<'PRIVATE_INTERNAL' | 'GOVERNMENT_IMPROVEMENT_ONLY' | 'PUBLIC_HIGHLIGHT'>('PUBLIC_HIGHLIGHT');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await submitFeedback({
      tripId: activeTrip?.id || 'trip-current-01',
      touristId: currentUser.id,
      touristName: currentUser.name,
      overallRating,
      safetyRating,
      cleanlinessRating,
      crowdingRating,
      transportRating,
      accommodationRating,
      accessibilityRating,
      comment,
      consentLevel,
      moderationStatus: consentLevel === 'PUBLIC_HIGHLIGHT' ? 'PENDING_MODERATION' : 'APPROVED',
    });
    setSubmitted(true);
    setComment('');
  };

  const renderRatingStars = (val: number, setVal: (n: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setVal(star)}
          className="p-1 text-amber-400 hover:scale-110 transition"
        >
          <Star className={`w-4 h-4 ${star <= val ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div id="trip-feedback-view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-cyan-500" />
          Journey Experience & Safety Feedback
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your feedback drives official tourism safety rankings and civic municipal improvements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Submission Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Rate Your Recent Travel Experience
          </h2>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Thank you! Your feedback has been verified and recorded in the audit trail.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Multi-Dimensional Ratings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Overall Safety & Security</span>
                {renderRatingStars(safetyRating, setSafetyRating)}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Overall Experience</span>
                {renderRatingStars(overallRating, setOverallRating)}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Cleanliness & Hygiene</span>
                {renderRatingStars(cleanlinessRating, setCleanlinessRating)}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Crowd Management & Flow</span>
                {renderRatingStars(crowdingRating, setCrowdingRating)}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Transport & Shuttles</span>
                {renderRatingStars(transportRating, setTransportRating)}
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Hotel & Accommodation</span>
                {renderRatingStars(accommodationRating, setAccommodationRating)}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Safety Observations & Comments
              </label>
              <textarea
                rows={3}
                required
                placeholder="Share your experience regarding emergency response, queue times, staff assistance, or lighting..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Privacy & Consent Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Sharing & Privacy Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'PRIVATE_INTERNAL', label: 'Private (Internal)', icon: Lock },
                  { id: 'GOVERNMENT_IMPROVEMENT_ONLY', label: 'Gov Safety Review', icon: ShieldCheck },
                  { id: 'PUBLIC_HIGHLIGHT', label: 'Public Highlight', icon: Globe2 },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConsentLevel(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      consentLevel === item.id
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="submit-feedback-button"
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-600/20 cursor-pointer"
            >
              Submit Journey Review
            </button>
          </form>
        </div>

        {/* Existing Verified Reviews */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Community Safety Insights
          </h3>

          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{fb.touristName}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{fb.overallRating}.0</span>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  "{fb.comment}"
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Moderation Approved
                  </span>
                  <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
