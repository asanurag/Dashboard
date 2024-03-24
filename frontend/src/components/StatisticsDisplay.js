import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsDisplay = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [statistics, setStatistics] = useState({
    totalSale: 0,
    soldCount: 0,
    notSoldCount: 0,
  });

  useEffect(() => {
    fetchStatistics(selectedMonth);
  }, [selectedMonth]);

  const fetchStatistics = async (month) => {
    try {
      const response = await axios.get(`/api/monthly-statistics?month=${month}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error.message);
    }
  };

  return (
    <div>
      <h2>Statistics Display</h2>
      <label>Select Month:</label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <option key={index} value={index}>
            {new Date(new Date().getFullYear(), index, 1).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
      <div>
        <p>Total Sale Amount: ${statistics.totalSale}</p>
        <p>Total Number of Sold Items: {statistics.soldCount}</p>
        <p>Total Number of Not Sold Items: {statistics.notSoldCount}</p>
      </div>
    </div>
  );
};

export default StatisticsDisplay;
