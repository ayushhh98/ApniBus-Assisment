import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, User, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssueCard({ issue, onUpdate }) {
    const statusColors = {
        'Open': 'bg-slate-700/50 text-slate-200 border-slate-600',
        'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };

    const priorityColors = {
        'Low': 'bg-slate-700/50 text-slate-300 border border-slate-600',
        'Medium': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        'High': 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        const oldStatus = issue.status;

        // Status Rule Enforcement
        if (oldStatus === 'Open' && newStatus === 'Done') {
            toast.error("Please move the issue to 'In Progress' before marking it Done 😊", {
                icon: '🚧',
            });
            return;
        }

        try {
            await updateDoc(doc(db, 'issues', issue.id), {
                status: newStatus
            });
            toast.success(`Status updated to ${newStatus}`);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/5 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full group relative overflow-hidden">
            {/* Decorative gradient blob on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/40 to-indigo-100/0 rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${priorityColors[issue.priority] || priorityColors.Medium}`}>
                    {issue.priority}
                </span>
                <div className="relative">
                    <select
                        value={issue.status}
                        onChange={handleStatusChange}
                        className={`appearance-none text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer outline-none ring-1 ring-inset ring-white/5 transition-all focus:ring-2 focus:ring-primary-500/50 ${statusColors[issue.status]}`}
                    >
                        <option value="Open" className="text-gray-900 bg-white">Open</option>
                        <option value="In Progress" className="text-gray-900 bg-white">In Progress</option>
                        <option value="Done" className="text-gray-900 bg-white">Done</option>
                    </select>
                </div>
            </div>

            <h3 className="text-slate-100 font-bold text-lg mb-2 leading-tight group-hover:text-primary-400 transition-colors">
                {issue.title}
            </h3>

            <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {issue.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center group/tooltip relative">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-300 font-bold text-[10px] ring-2 ring-slate-800 shadow-sm">
                            {issue.assignedTo ? issue.assignedTo.charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                        </div>
                        <span className="ml-2 font-medium text-slate-400 truncate max-w-[100px]">
                            {issue.assignedTo ? issue.assignedTo.split('@')[0] : 'Unassigned'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="flex items-center text-slate-500 font-medium opacity-80">
                        <User className="w-3 h-3 mr-1" />
                        {issue.createdBy ? issue.createdBy.split('@')[0] : 'Anon'}
                    </span>
                    <span className="flex items-center font-medium bg-white/5 px-2 py-0.5 rounded text-slate-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {issue.createdAt ? new Date(issue.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Now'}
                    </span>
                </div>
            </div>
        </div>
    );

}
