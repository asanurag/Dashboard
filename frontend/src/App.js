import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionsTable from './components/TransactionsTable';
import StatisticsDisplay from './components/StatisticsDisplay';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await axios.get('/api/transactions');
        setTransactions(transactionsResponse.data.transactions);

        // Fetch statistics
        const statisticsResponse = await axios.get('/api/statistics');
        setStatistics(statisticsResponse.data);

        // Fetch bar chart data
        const barChartDataResponse = await axios.get('/api/bar-chart');
        setBarChartData(barChartDataResponse.data);

        // Fetch pie chart data
        const pieChartDataResponse = await axios.get('/api/pie-chart');
        setPieChartData(pieChartDataResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>MERN Stack Dashboard</h1>
      <TransactionsTable transactions={transactions} />
      <StatisticsDisplay statistics={statistics} />
      <BarChart data={barChartData} />
      <PieChart data={pieChartData} />
    </div>
  );
};

export default App;
