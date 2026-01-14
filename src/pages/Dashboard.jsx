import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import IssueCard from '../components/IssueCard';
import CreateIssueModal from '../components/CreateIssueModal';
import { Plus, Filter, ArrowUpDown, ClipboardList, Sparkles, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filters and Sorting
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = Newest first

    useEffect(() => {
        const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const issuesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setIssues(issuesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching issues:", error);
            toast.error("Failed to load issues");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Derived state for filtered and sorted issues
    const filteredIssues = issues.filter(issue => {
        const statusMatch = statusFilter === 'All' || issue.status === statusFilter;
        const priorityMatch = priorityFilter === 'All' || issue.priority === priorityFilter;
        return statusMatch && priorityMatch;
    }).sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return (
        <div className="min-h-screen bg-slate-900 relative text-slate-200 selection:bg-primary-500/30">
            {/* Background Pattern - Fixed to cover entire screen */}
            <div className="fixed inset-0 z-0 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-20 pointer-events-none"></div>

            {/* Full Width Hero Poster - Spans entire width */}
            <div className="w-full bg-gradient-to-r from-primary-950 to-indigo-950 relative shadow-2xl pt-28 pb-16 overflow-hidden border-b border-white/5">
                {/* Abstract Decor - Positioned absolutely within the hero */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

                {/* Hero Content - Constrained to max-w-7xl */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 mb-4 border border-white/10 shadow-xl">
                            <Sparkles className="w-4 h-4 text-primary-300" />
                            <span className="text-xs font-bold tracking-widest uppercase text-primary-100">Project Workspace</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg">
                            Issue Board
                        </h1>
                        <p className="text-lg text-slate-300 max-w-xl leading-relaxed font-medium">
                            Efficiently track, prioritize, and resolve your project tasks via our smart issue management system.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Create New Issue</span>
                    </button>
                </div>
            </div>

            {/* Main Content - Constrained */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-8 pb-20">
                {/* Glassmorphic Filter & Tabs Bar */}
                <div className="bg-slate-800/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl shadow-black/20 mb-10 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row items-center gap-5 justify-between">

                        {/* Left: Status Tabs */}
                        <div className="flex p-1 bg-slate-900/50 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar border border-white/5">
                            {['All', 'Open', 'In Progress', 'Done'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`
                                    px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap
                                    ${statusFilter === status
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
                                >
                                    {status === 'All' ? 'All Issues' : status}
                                </button>
                            ))}
                        </div>

                        {/* Right: Filters & Sort */}
                        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                            {/* Priority Filter */}
                            <div className="relative group">
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900 border border-white/10 text-slate-300 font-medium rounded-xl hover:border-primary-500/50 hover:bg-slate-800 focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/50 transition-all cursor-pointer text-sm min-w-[140px]"
                                >
                                    <option value="All">All Priorities</option>
                                    <option value="High">High Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="Low">Low Priority</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500 group-hover:text-primary-400 transition-colors">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>

                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-primary-400 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                            >
                                <ArrowUpDown className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                                <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-primary-500"></div>
                        </div>
                        <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">Loading workspace...</p>
                    </div>
                ) : filteredIssues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                        {filteredIssues.map(issue => (
                            <IssueCard key={issue.id} issue={issue} />
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-xl shadow-black/20 border border-white/5 overflow-hidden text-center p-12 md:p-16 animate-fade-in-up">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-3xl mb-8 shadow-inner ring-1 ring-white/10">
                                <ClipboardList className="w-10 h-10 text-primary-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                {issues.length === 0 ? "Your board is empty" : "No matches found"}
                            </h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                                {issues.length === 0
                                    ? "Get started by creating your first issue. Track bugs, features, and tasks all in one place."
                                    : "We couldn't find any issues matching your current filters. Try adjusting them."}
                            </p>
                            {issues.length === 0 && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-2xl shadow-lg shadow-primary-500/30 text-white bg-primary-600 hover:bg-primary-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:-translate-y-1"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create First Issue
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <CreateIssueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onIssueCreated={() => {
                    // Refresh logic if needed, but onSnapshot handles it automatically
                }}
            />
        </div>
    );
}
