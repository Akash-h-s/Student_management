import React from 'react';
import { RESPONSIBILITIES } from '../constants';
import { ResponsibilityItem } from './ResponsibilityItem';

export const ResponsibilitiesSection = React.memo(() => (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Responsibilities</h2>
        <ul className="space-y-2 text-gray-600">
            {RESPONSIBILITIES.map((item, index) => (
                <ResponsibilityItem key={index} item={item} />
            ))}
        </ul>
    </div>
));
ResponsibilitiesSection.displayName = 'ResponsibilitiesSection';
