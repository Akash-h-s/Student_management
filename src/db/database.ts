import { createRxDatabase, addRxPlugin } from 'rxdb';
import type { RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration-schema';

import { studentSchema } from './schemas/student.schema';
import { chatSchema } from './schemas/chat.schema';
import { messageSchema } from './schemas/message.schema';
import { dashboardStatsSchema } from './schemas/dashboard_stats.schema';

// Add plugins
if (import.meta.env.DEV) {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBMigrationPlugin);

let dbPromise: Promise<RxDatabase> | null = null;

const createDB = async () => {
    try {
        console.log('[RxDB] Starting database initialization...');
        const db = await createRxDatabase({
            name: 'educloud_db_v3',
            storage: wrappedValidateAjvStorage({
                storage: getRxStorageDexie()
            }),
        });
        console.log('[RxDB] Database instance created successfully');

        // create collections
        console.log('[RxDB] Creating collections...');
        await db.addCollections({
            students: {
                schema: studentSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => oldDoc
                }
            },
            chats: {
                schema: chatSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => oldDoc
                }
            },
            messages: {
                schema: messageSchema,
                migrationStrategies: {
                    1: (oldDoc: any) => oldDoc,
                    2: (oldDoc: any) => ({
                        ...oldDoc,
                        status: oldDoc.is_read ? 'read' : 'sent'
                    })
                }
            },
            dashboard_stats: {
                schema: dashboardStatsSchema
            }
        });
        console.log('[RxDB] Collections initialized: students, chats, messages, dashboard_stats');

        return db;
    } catch (err) {
        console.error('[RxDB] FATAL ERROR during database creation:', err);
        throw err;
    }
};

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = createDB();
    }
    return dbPromise;
};
