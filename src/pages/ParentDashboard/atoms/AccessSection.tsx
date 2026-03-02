import React from 'react';
import { ACCESS_ITEMS } from '../constants';
import { AccessListItem } from './AccessListItem';

export const AccessSection = React.memo(() => (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent Access</h2>
        <ul className="space-y-2 text-gray-600">
            {ACCESS_ITEMS.map((item, index) => (
                <AccessListItem key={index} item={item} />
            ))}
        </ul>
    </div>
));
AccessSection.displayName = 'AccessSection';
