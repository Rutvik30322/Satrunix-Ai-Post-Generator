
import React from 'react';

const Card: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`p-6 flex flex-col space-y-1.5 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <h2 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h2>
);

const CardContent: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`p-6 pt-0 ${className}`}>
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardContent };
