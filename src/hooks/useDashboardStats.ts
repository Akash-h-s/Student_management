import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../graphql/dashboard';
import { useRxDB } from '../db/RxDBContext';
import type { DashboardStatsDoc } from '../db/types';

export const useDashboardStats = () => {
    const db = useRxDB();
    const { data: apolloData, loading: apolloLoading, error: apolloError } = useQuery(GET_DASHBOARD_STATS, {
        pollInterval: 30000,
        fetchPolicy: 'cache-and-network',
    });

    const [localData, setLocalData] = useState<DashboardStatsDoc | null>(null);

    // Load from RxDB on mount
    useEffect(() => {
        if (!db) {
            console.warn('[useDashboardStats] Database not initialized yet');
            return;
        }

        console.log('[useDashboardStats] Attempting to load cached stats from RxDB...');
        const sub = db.dashboard_stats.findOne('singleton').$.subscribe(doc => {
            if (doc) {
                console.log('[useDashboardStats] Found cached data:', doc.toJSON());
                setLocalData(doc.toJSON());
            } else {
                console.log('[useDashboardStats] No cached data found in RxDB');
            }
        });

        return () => sub.unsubscribe();
    }, [db]);

    // Save Apollo data to RxDB
    useEffect(() => {
        if (apolloData && db) {
            console.log('[RxDB] Hook: syncing apollo data');
            console.log('[useDashboardStats] Apollo data received, updating RxDB cache...');
            const stats = {
                id: 'singleton',
                students_count: apolloData.students_aggregate?.aggregate?.count ?? 0,
                teachers_count: apolloData.teachers_aggregate?.aggregate?.count ?? 0,
                admins_count: apolloData.admins_aggregate?.aggregate?.count ?? 0,
                parents_count: apolloData.parents_aggregate?.aggregate?.count ?? 0,
                updated_at: new Date().toISOString()
            };
            db.dashboard_stats.upsert(stats)
                .then(() => console.log('[useDashboardStats] Successfully updated RxDB cache'))
                .catch(err => console.error('[useDashboardStats] Failed to cache stats:', err));
        }
    }, [apolloData, db]);

    // Decide what to return
    // If we have local data, we can show it even if apollo is loading or has error
    const stats = apolloData ? {
        students_count: apolloData.students_aggregate?.aggregate?.count ?? 0,
        teachers_count: apolloData.teachers_aggregate?.aggregate?.count ?? 0,
        admins_count: apolloData.admins_aggregate?.aggregate?.count ?? 0,
        parents_count: apolloData.parents_aggregate?.aggregate?.count ?? 0,
    } : localData ? {
        students_count: localData.students_count,
        teachers_count: localData.teachers_count,
        admins_count: localData.admins_count,
        parents_count: localData.parents_count,
    } : null;

    return {
        stats,
        loading: apolloLoading && !stats, // Only show loading if we have no data at all
        error: apolloError && !stats, // Only show error if we have no cached data
    };
};
