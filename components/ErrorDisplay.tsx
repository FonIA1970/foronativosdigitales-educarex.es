import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
      <strong className="font-bold">Ha ocurrido un error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorDisplay;