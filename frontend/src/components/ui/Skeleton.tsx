import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, circle }) => {
    const style: React.CSSProperties = {
        width,
        height,
        borderRadius: circle ? '50%' : undefined,
    };

    return (
        <div
            className={`skeleton rounded-md ${className}`}
            style={style}
        />
    );
};
