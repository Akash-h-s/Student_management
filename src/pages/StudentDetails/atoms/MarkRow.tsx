import React from 'react';
import { STYLES } from '../constants';
import { calculatePercentage, getGradeColor } from '../utils';
import type { Mark } from '../types';

interface MarkRowProps {
    mark: Mark;
}

export const MarkRow = React.memo(({ mark }: MarkRowProps) => {
    const percentage = calculatePercentage(mark.marks_obtained, mark.max_marks);
    const gradeColor = getGradeColor(mark.grade);

    return (
        <tr className={STYLES.tableRow}>
            <td className={STYLES.tableCell}>
                <span className="truncate block max-w-[100px] md:max-w-none">{mark.subject.name}</span>
            </td>
            <td className={STYLES.tableCell}>{mark.marks_obtained}</td>
            <td className={STYLES.tableCell}>{mark.max_marks}</td>
            <td className={STYLES.tableCell}>{percentage}%</td>
            <td className={STYLES.tableCell}>
                <span className={`px-1 md:px-2 py-1 rounded font-semibold text-xs md:text-sm inline-block ${gradeColor}`}>{mark.grade}</span>
            </td>
            <td className={STYLES.tableCell}>
                <span className="text-xs block truncate max-w-[80px] md:max-w-none">{mark.remarks || '-'}</span>
            </td>
        </tr>
    );
});
MarkRow.displayName = 'MarkRow';
