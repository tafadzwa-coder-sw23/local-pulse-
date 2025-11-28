import React, { useState } from 'react';
import { X, Sparkles, Loader2, Calendar as CalIcon, MapPin } from 'lucide-react';
import { EventCategory, LocalEvent } from '../types';
import { parseEventWithAI } from '../services/geminiService';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: LocalEvent) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [rawInput, setRawInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<LocalEvent> | null>(null);

  if (!isOpen) return null;

  const handleAIMagic = async () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);
    
    try {
      const result = await parseEventWithAI(rawInput);
      if (result) {
        setParsedData({
          ...result,
          id: Date.now().toString(),
          date: result.suggestedTime || new Date().toISOString(),
          location: 'TBD', // Placeholder if not extracted
          attendees: 0,
          rating: 0,
          imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`
        });
        setStep('preview');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (parsedData) {
      onAddEvent(parsedData as LocalEvent);
      onClose();
      // Reset
      setStep('input');
      setRawInput('');
      setParsedData(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {step === 'input' ? 'Add New Event' : 'Review Details'}
            {step === 'input' && <Sparkles className="w-5 h-5 text-secondary animate-pulse" />}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium mb-1"> ✨ Magic Create</p>
                <p className="text-xs text-indigo-600">
                  Just describe your event loosely, and our AI will format it for you.
                  <br/>
                  <span className="italic opacity-75">"Braai at Lake Chivero this Sunday..."</span>
                </p>
              </div>
              
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Describe your event here..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-slate-700 bg-slate-50"
              />
              
              <button
                onClick={handleAIMagic}
                disabled={!rawInput.trim() || isProcessing}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Details
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Title</label>
                  <input 
                    type="text" 
                    value={parsedData?.title || ''}
                    onChange={(e) => setParsedData({...parsedData, title: e.target.value})}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea 
                    value={parsedData?.description || ''}
                    onChange={(e) => setParsedData({...parsedData, description: e.target.value})}
                    className="w-full p-2 h-24 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</label>
                    <select
                      value={parsedData?.category}
                      onChange={(e) => setParsedData({...parsedData, category: e.target.value as EventCategory})}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      {Object.values(EventCategory).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={parsedData?.location || ''}
                          onChange={(e) => setParsedData({...parsedData, location: e.target.value})}
                          className="w-full pl-8 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                     </div>
                   </div>
                </div>

                <div>
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date & Time</label>
                   <div className="relative">
                      <CalIcon className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="datetime-local"
                        value={parsedData?.date ? new Date(parsedData.date).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setParsedData({...parsedData, date: new Date(e.target.value).toISOString()})}
                        className="w-full pl-8 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      />
                   </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-colors"
                >
                  Confirm Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;