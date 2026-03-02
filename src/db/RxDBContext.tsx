import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RxDatabase } from 'rxdb';
import { getDB } from './database';

const RxDBContext = createContext<RxDatabase | null>(null);

export const RxDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [db, setDb] = useState<RxDatabase | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const _db = await getDB();
                setDb(_db);
            } catch (err) {
                console.error('Failed to initialize RxDB', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
                <div className="text-indigo-500 font-medium">Initializing Local Database...</div>
            </div>
        );
    }

    return (
        <RxDBContext.Provider value={db}>
            {children}
        </RxDBContext.Provider>
    );
};

export const useRxDB = () => {
    const context = useContext(RxDBContext);
    if (context === undefined) {
        throw new Error('useRxDB must be used within a RxDBProvider');
    }
    return context;
};
