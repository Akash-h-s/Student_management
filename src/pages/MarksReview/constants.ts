export const GRADE_THRESHOLDS = [
    { threshold: 90, grade: 'A+', colorClass: 'bg-green-100 text-green-800' },
    { threshold: 80, grade: 'A', colorClass: 'bg-green-100 text-green-800' },
    { threshold: 70, grade: 'B+', colorClass: 'bg-blue-100 text-blue-800' },
    { threshold: 60, grade: 'B', colorClass: 'bg-blue-100 text-blue-800' },
    { threshold: 50, grade: 'C', colorClass: 'bg-yellow-100 text-yellow-800' },
    { threshold: 40, grade: 'D', colorClass: 'bg-orange-100 text-orange-800' },
    { threshold: 0, grade: 'F', colorClass: 'bg-red-100 text-red-800' },
] as const;
