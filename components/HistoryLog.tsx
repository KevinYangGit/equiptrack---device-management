import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HistoryRecord } from '../types';
import { History, ArrowRight, ArrowLeft, PlusCircle, Trash2, Calendar, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

interface HistoryLogProps {
  logs: HistoryRecord[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  const [tempDate, setTempDate] = useState('');
  
  const calendarRef = useRef<HTMLDivElement>(null);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

  const filteredLogs = selectedDate
    ? sortedLogs.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === selectedDate;
      })
    : sortedLogs;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCalendar = () => {
    setTempDate(selectedDate);
    setViewDate(selectedDate ? new Date(selectedDate) : new Date());
    setIsCalendarOpen(true);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure string is correct YYYY-MM-DD
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    setTempDate(adjustedDate.toISOString().split('T')[0]);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1);
    setViewDate(newDate);
  };

  const confirmDate = () => {
    setSelectedDate(tempDate);
    setIsCalendarOpen(false);
  };

  const clearDate = () => {
    setTempDate('');
    setSelectedDate('');
    setIsCalendarOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(viewDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getActionIcon = (action: HistoryRecord['action']) => {
    switch (action) {
      case 'borrow': return <ArrowRight className="text-amber-500" size={16} />;
      case 'return': return <ArrowLeft className="text-green-500" size={16} />;
      case 'add': return <PlusCircle className="text-blue-500" size={16} />;
      case 'delete': return <Trash2 className="text-red-500" size={16} />;
      default: return <History size={16} />;
    }
  };

  const getActionText = (record: HistoryRecord) => {
    switch (record.action) {
      case 'borrow': return `Borrowed by ${record.borrower}`;
      case 'return': return `Returned from ${record.borrower}`;
      case 'add': return `Device added to inventory`;
      case 'delete': return `Device removed from inventory`;
      default: return record.action;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 flex flex-col h-[600px] relative">
      <div className="p-4 border-b border-gray-100/80 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2 mb-3">
          <History size={18} className="text-gray-500" />
          <h2 className="font-semibold text-gray-800">Transaction History</h2>
        </div>
        
        {/* Custom Date Filter Trigger */}
        <div className="relative" ref={calendarRef}>
          <div 
            onClick={openCalendar}
            className="w-full pl-3 pr-9 py-2 text-sm border border-gray-200 rounded-lg bg-white/80 hover:bg-white hover:border-brand-400 hover:ring-2 hover:ring-brand-100 cursor-pointer transition-all flex items-center text-gray-700 shadow-sm"
          >
             <Calendar size={16} className="text-gray-400 mr-2" />
             <span className={selectedDate ? "text-gray-900 font-medium" : "text-gray-400"}>
               {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Filter by date..."}
             </span>
          </div>
          
          {selectedDate && (
            <button 
              onClick={(e) => { e.stopPropagation(); clearDate(); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              title="Reset Date Filter"
            >
              <X size={16} />
            </button>
          )}

          {/* Calendar Popup */}
          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-900">
                        {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-400 font-medium">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} />
                    ))}
                    {days.map(day => {
                        // Simple construction to match YYYY-MM-DD
                        const currentValStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = tempDate === currentValStr;
                        
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                                    isSelected 
                                        ? 'bg-brand-600 text-white font-semibold' 
                                        : 'hover:bg-brand-50 text-gray-700'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                    <button 
                        onClick={() => setIsCalendarOpen(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
                    >
                        Cancel
                    </button>
                    <Button size="sm" onClick={confirmDate} disabled={!tempDate}>
                        Confirm
                    </Button>
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-auto divide-y divide-gray-100/80 rounded-b-xl scroll-smooth">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No records {selectedDate ? 'for this date' : 'found'}.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-start gap-3">
              <div className={`mt-1 p-1.5 rounded-full bg-gray-50 border border-gray-100 shrink-0`}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900 truncate text-sm">{log.deviceName}</p>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      hour: '2-digit', minute: '2-digit'
                    })}
                    {!selectedDate && (
                       <span className="block text-right">
                         {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{getActionText(log)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};