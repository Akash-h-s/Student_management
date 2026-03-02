import type { RxJsonSchema } from 'rxdb';
import type { StudentDoc } from '../types';

export const studentSchema: RxJsonSchema<StudentDoc> = {
    title: 'student schema',
    description: 'describes a student',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        admission_no: {
            type: 'string',
            maxLength: 50
        },
        name: {
            type: 'string',
            maxLength: 100
        },
        class_name: {
            type: 'string',
            maxLength: 50
        },
        section_name: {
            type: 'string',
            maxLength: 50
        },
        parent_id: {
            type: 'string'
        },
        created_by_admin_id: {
            type: 'string'
        },
        is_active: {
            type: 'boolean'
        },
        updated_at: {
            type: 'string',
            format: 'date-time'
        },
        marks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    marks_obtained: { type: 'number' },
                    max_marks: { type: 'number' },
                    grade: { type: 'string' },
                    remarks: { type: 'string' },
                    subject: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' }
                        }
                    },
                    exam: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            academic_year: { type: 'string' }
                        }
                    },
                    entered_at: { type: 'string' }
                }
            }
        }
    },
    required: ['id', 'name', 'admission_no'],
    indexes: ['name', 'admission_no']
};
