import React from 'react';

const PaymentButton = ({ href, children, primary = false }) => {
  const baseClasses = "w-full sm:w-auto text-center font-bold py-4 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 ease-in-out";
  const primaryClasses = "bg-[#00838F] text-white hover:bg-[#006064]";
  const secondaryClasses = "bg-white text-[#00838F] border-2 border-[#00838F] hover:bg-gray-100";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${primary ? primaryClasses : secondaryClasses}`}>
      {children}
    </a>
  );
};
export default PaymentButton;