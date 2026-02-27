import React from 'react';
import type { Responsibility } from '../types';
import { STYLES } from '../constants';

interface ResponsibilityItemProps {
    item: Responsibility;
}

export const ResponsibilityItem = React.memo(({ item }: ResponsibilityItemProps) => (
    <li className="flex items-center gap-2">
        <span className={STYLES.bullet} />
        <span>{item.text}</span>
    </li>
));
ResponsibilityItem.displayName = 'ResponsibilityItem';
