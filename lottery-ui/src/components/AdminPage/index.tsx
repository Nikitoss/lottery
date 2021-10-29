import React, { useState } from 'react';

export function AdminPage() {
    // Объявление переменной состояния, которую мы назовём "count"
    const [count, setCount] = useState(0);
  
    const isEnterLotteryAvailable = () => {}

    return (
      <div >
        <div className="rounded-t-xl overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-100 p-10">

        <button type="button" className="py-2 px-4 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none">
            Click me
        </button>

        <button type="button" className="py-2 px-4 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none">
            Click me
        </button>

        </div>
      </div>
    );
  };