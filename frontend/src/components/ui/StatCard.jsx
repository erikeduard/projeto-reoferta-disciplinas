import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  className = '' 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1 p-6
        ${className}
      `}
    >
      {/* Gradient Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-16 -mt-16`}></div>
      
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {/* Trend */}
          {trend && (
            <span className={`
              flex items-center text-sm font-medium
              ${trend === 'up' ? 'text-green-600' : 'text-red-600'}
            `}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trendValue}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
