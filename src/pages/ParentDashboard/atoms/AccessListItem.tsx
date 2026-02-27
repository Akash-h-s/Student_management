import React from 'react';
import type { AccessItem } from '../types';
import { STYLES } from '../constants';

interface AccessListItemProps {
    item: AccessItem;
}

export const AccessListItem = React.memo(({ item }: AccessListItemProps) => (
    <li className="flex items-center gap-2">
        <span className={STYLES.bullet} />
        <span>{item.text}</span>
    </li>
));
AccessListItem.displayName = 'AccessListItem';
