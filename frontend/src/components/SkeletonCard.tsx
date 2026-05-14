import React from 'react';

interface SkeletonCardProps {
  height?: string;
  width?: string;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  height = "h-32", 
  width = "w-full",
  className = "" 
}) => {
  return (
    <div className={`bg-[#1A2332] animate-pulse rounded-2xl ${height} ${width} ${className}`} />
  );
};

export default SkeletonCard;
