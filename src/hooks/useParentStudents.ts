import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STUDENT_DETAILS_BY_PARENT } from '../graphql/studentsandparents';
import { useRxDB } from '../db/RxDBContext';
import type { StudentDoc } from '../db/types';

export const useParentStudents = (parentId: number | null) => {
    const db = useRxDB();
    const { data: apolloData, loading: apolloLoading, error: apolloError, refetch } = useQuery(GET_STUDENT_DETAILS_BY_PARENT, {
        variables: { parentId },
        skip: !parentId,
        fetchPolicy: 'cache-and-network',
    });

    const [localStudents, setLocalStudents] = useState<StudentDoc[]>([]);

    // Load from RxDB on mount/parentId change
    useEffect(() => {
        if (!db || !parentId) return;

        console.log('[RxDB] Loading students for parent:', parentId);
        const sub = db.students
            .find({
                selector: {
                    parent_id: parentId.toString()
                }
            })
            .$.subscribe(docs => {
                if (docs) {
                    console.log('[RxDB] Found cached students:', docs.length);
                    setLocalStudents(docs.map(d => d.toJSON()));
                }
            });

        return () => sub.unsubscribe();
    }, [db, parentId]);

    // Save Apollo data to RxDB
    useEffect(() => {
        if (apolloData?.students && db && parentId) {
            console.log('[RxDB] Syncing students from Apollo...');
            const studentsToSave = apolloData.students.map((s: any) => ({
                ...s,
                id: s.id.toString(),
                parent_id: parentId.toString(),
                is_active: true,
                updated_at: new Date().toISOString()
            }));

            // Bulk upsert
            const runUpsert = async () => {
                for (const student of studentsToSave) {
                    await db.students.upsert(student);
                }
                console.log('[RxDB] Student sync complete');
            };
            runUpsert().catch(err => console.error('[RxDB] Student sync failed:', err));
        }
    }, [apolloData, db, parentId]);

    const students = apolloData?.students || localStudents;

    return {
        students,
        loading: apolloLoading && students.length === 0,
        error: apolloError && students.length === 0 ? apolloError : null,
        refetch
    };
};
