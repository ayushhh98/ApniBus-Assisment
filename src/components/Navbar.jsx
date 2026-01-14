import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

import logo from '../assets/logo-clean.png';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            toast.success('Logged out successfully 👋');
            navigate('/login');
        } catch {
            console.error('Failed to log out');
        }
    }

    return (
        <nav className="fixed h-[72px] w-full z-50 top-0 start-0 border-b border-white/5 bg-slate-900/70 backdrop-blur-xl shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent pointer-events-none opacity-50"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center group relative z-10">
                            <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                                <img src={logo} alt="Smart Issue Board" className="h-32 w-auto object-contain absolute -left-6 top-1/2 -translate-y-1/2 drop-shadow-sm filter brightness-110 transition-all" />
                                <div className="ml-24 font-bold text-xl tracking-tight text-white hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
                                    Smart Issue Board
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-5">
                        {currentUser ? (
                            <div className="relative">
                                {/* Avatar Button */}
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="flex items-center gap-3 focus:outline-none bg-white/5 hover:bg-white/10 p-1 pr-4 rounded-full border border-white/10 shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white 
                                            flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-slate-900">
                                        {currentUser.email.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-xs font-bold text-slate-200 leading-none group-hover:text-primary-400 transition-colors">
                                            {currentUser.email.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">Online</span>
                                    </div>
                                    <svg className={`w-4 h-4 text-slate-500 group-hover:text-primary-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>

                                {/* Dropdown */}
                                {open && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-60 bg-slate-800 rounded-2xl 
                                                shadow-2xl shadow-black/50 border border-white/5 z-50 overflow-hidden animate-fade-in-up origin-top-right ring-1 ring-black/50">
                                            <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                                                <p className="text-sm font-semibold text-white truncate">{currentUser.email}</p>
                                            </div>
                                            <ul className="py-2">
                                                <li>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-5 py-2.5 text-sm text-red-400 
                                   hover:bg-red-500/10 transition-colors flex items-center space-x-3 font-medium"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                        <span>Sign Out</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-3">
                                <Link to="/login" className="text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5">Log in</Link>
                                <Link to="/signup" className="text-white bg-primary-600 hover:bg-primary-500 hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );

}
