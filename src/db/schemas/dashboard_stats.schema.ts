import type { RxJsonSchema } from 'rxdb';
import type { DashboardStatsDoc } from '../types';

export const dashboardStatsSchema: RxJsonSchema<DashboardStatsDoc> = {
    title: 'dashboard stats schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        students_count: {
            type: 'number'
        },
        teachers_count: {
            type: 'number'
        },
        admins_count: {
            type: 'number'
        },
        parents_count: {
            type: 'number'
        },
        updated_at: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: ['id', 'students_count', 'teachers_count', 'admins_count', 'parents_count']
};
