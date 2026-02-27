import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_SCHOOL_DETAILS } from '../../../graphql/studentsandparents';

interface SchoolInfoProps {
    adminId?: number;
}

export const SchoolInfo = React.memo(({ adminId }: SchoolInfoProps) => {
    const { data, loading } = useQuery(GET_ADMIN_SCHOOL_DETAILS, {
        variables: { adminId },
        skip: !adminId
    });

    const admin = data?.admins_by_pk;

    if (loading) return null;
    if (!admin?.school_name) return null;

    return (
        <div className="text-left md:text-right">
            <p className="text-xs md:text-sm font-semibold text-gray-700">{admin.school_name}</p>
            {admin.school_address && <p className="text-xs text-gray-500">{admin.school_address}</p>}
            {admin.school_phone && <p className="text-xs text-gray-500">{admin.school_phone}</p>}
        </div>
    );
});
SchoolInfo.displayName = 'SchoolInfo';
