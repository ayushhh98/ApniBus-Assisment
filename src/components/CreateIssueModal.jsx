import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertTriangle, CheckCircle, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateIssueModal({ isOpen, onClose, onIssueCreated }) {
    const { currentUser } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [similarIssues, setSimilarIssues] = useState([]);
    const [showSimilarWarning, setShowSimilarWarning] = useState(false);
    const [users, setUsers] = useState([]);

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setDescription('');
            setPriority('Medium');
            setAssignedTo('');
            setShowSimilarWarning(false);
            setSimilarIssues([]);
        }
    }, [isOpen]);

    // Simple Jaccard Similarity implementation
    const checkSimilarity = (str1, str2) => {
        const set1 = new Set(str1.toLowerCase().split(/\s+/));
        const set2 = new Set(str2.toLowerCase().split(/\s+/));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    };

    // Generate keywords from text
    const generateKeywords = (text) => {
        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2); // Filter out short words
    };

    const checkForSimilarIssues = async () => {
        if (!title || title.length < 5) {
            if (title && title.length < 5) toast.error('Title must be at least 5 characters');
            return false;
        }

        const keywords = generateKeywords(title);
        if (keywords.length === 0) return false;

        try {
            // Query for issues that contain ANY of the keywords
            const q = query(
                collection(db, 'issues'),
                where('keywords', 'array-contains-any', keywords)
            );

            const issuesSnapshot = await getDocs(q);
            const potentialDuplicates = [];

            issuesSnapshot.forEach(doc => {
                const issue = doc.data();
                if (issue && issue.title) {
                    const titleSim = checkSimilarity(title, issue.title);
                    if (titleSim > 0.4) {
                        potentialDuplicates.push({ id: doc.id, ...issue, similarity: titleSim });
                    }
                }
            });

            if (potentialDuplicates.length > 0) {
                setSimilarIssues(potentialDuplicates);
                setShowSimilarWarning(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking duplicates:", error);
            // Fallback to client-side check if index is missing or query fails
            return false;
        }
    };

    const handleSubmit = async (e, force = false) => {
        e.preventDefault();

        // Timeout safeguard: If nothing happens in 10 seconds, reset loading
        const safetyTimeout = setTimeout(() => {
            console.warn("Operation timed out!");
            setLoading(false);
            toast.error('Request timed out. Please check your internet connection.');
        }, 10000);

        try {
            /* 
            // Temporarily bypassing duplicate check to isolate write issue
            if (!force && !showSimilarWarning) {
                setLoading(true);
                let hasDuplicates = false;
                try {
                    hasDuplicates = await checkForSimilarIssues();
                } catch (checkError) {
                    console.error("Duplicate check failed:", checkError);
                }
                setLoading(false);
                if (hasDuplicates) {
                    clearTimeout(safetyTimeout);
                    return;
                }
            } 
            */

            setLoading(true);
            const keywords = generateKeywords(title) || []; // Ensure it's usually an array

            const issueData = {
                title,
                description,
                priority,
                status: 'Open',
                assignedTo,
                keywords,
                createdBy: currentUser?.email || 'Anonymous',
                createdAt: serverTimestamp()
            };

            // Optimistic Update: Don't await the promise!
            addDoc(collection(db, 'issues'), issueData).catch(err => console.error("Background sync failed:", err));

            toast.success('Issue created!');
            onIssueCreated();
            onClose();
        } catch (error) {
            console.error('Error adding issue:', error);

            if (error.code === 'permission-denied') {
                toast.error('You do not have permission to create issues.');
            } else if (error.code === 'unavailable') {
                // With persistence enabled, this might not trigger, but good to keep
                toast.error('Network unavailable. Check your connection.');
            } else {
                toast.error(`Failed to create issue: ${error.message}`);
            }
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full relative z-[101] border border-white/10 ring-1 ring-black/50">
                    {/* Decorative header gradient */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

                    <div className="bg-slate-800 px-8 pt-10 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-slate-900 rounded-xl border border-white/5 shadow-sm ring-4 ring-white/5">
                                    <Sparkles className="h-6 w-6 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none" id="modal-title">
                                        {showSimilarWarning ? 'Similar Issues Found' : 'Create New Issue'}
                                    </h3>
                                    <p className="text-sm text-slate-400 mt-1 font-medium">
                                        {showSimilarWarning ? 'We found potential duplicates' : 'Add a new task to the board'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="group bg-white/5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-200">
                                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {showSimilarWarning ? (
                            <div className="mt-4 animate-fade-in-up">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6 shadow-sm">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-bold text-amber-500">Potential Duplicates Detected</h4>
                                            <p className="mt-1 text-sm text-amber-400/90 leading-relaxed opacity-90">
                                                To keep the board clean, please check if one of these existing issues matches yours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto space-y-3 mb-8 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                    {similarIssues.map(issue => (
                                        <div key={issue.id} className="p-4 bg-slate-900 rounded-xl border border-white/5 hover:border-primary-500/50 hover:shadow-md transition-all cursor-default group">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="font-semibold text-slate-200 text-sm group-hover:text-primary-400 transition-colors">{issue.title}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wide border ${issue.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    issue.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'
                                                    }`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end space-x-3 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setShowSimilarWarning(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-transparent border border-white/10 rounded-xl hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-all shadow-sm"
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleSubmit(e, true)}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5"
                                    >
                                        Create Anyway
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                                <div className="space-y-5">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            className="block w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium sm:text-sm shadow-sm hover:bg-slate-900/80"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="E.g., Bug in login flow..."
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Description</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            rows="4"
                                            className="block w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium sm:text-sm shadow-sm hover:bg-slate-900/80 resize-none"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe the issue in detail..."
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Priority</label>
                                            <div className="relative group">
                                                <select
                                                    id="priority"
                                                    name="priority"
                                                    className="block w-full pl-4 pr-10 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 font-medium text-sm shadow-sm appearance-none hover:bg-slate-900/80 cursor-pointer transition-all"
                                                    value={priority}
                                                    onChange={(e) => setPriority(e.target.value)}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-primary-400 transition-colors">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="assignedTo" className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Assignee</label>
                                            <div className="relative group">
                                                <select
                                                    id="assignedTo"
                                                    name="assignedTo"
                                                    className="block w-full pl-4 pr-10 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 font-medium text-sm shadow-sm appearance-none hover:bg-slate-900/80 cursor-pointer transition-all"
                                                    value={assignedTo}
                                                    onChange={(e) => setAssignedTo(e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {users.map(user => (
                                                        <option key={user.id} value={user.email}>
                                                            {user.name || user.email}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-primary-400 transition-colors">
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-400 bg-transparent border border-white/10 rounded-xl hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-all shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center min-w-[150px]"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        {loading ? 'Creating...' : 'Create Issue'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
