import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Number of Items',
      data: [],
      backgroundColor: [],
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/bar-chart?month=${selectedMonth}`);
        const { labels, data } = response.data;
        const backgroundColors = generateBackgroundColors(labels.length);

        setChartData({
          labels: labels,
          datasets: [{
            label: 'Number of Items',
            data: data,
            backgroundColor: backgroundColors,
          }],
        });
      } catch (error) {
        console.error('Error fetching bar chart data:', error.message);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const generateBackgroundColors = (length) => {
    // Generate random colors for each bar
    const colors = [];
    for (let i = 0; i < length; i++) {
      const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;
      colors.push(color);
    }
    return colors;
  };

  return (
    <div>
      <h2>Bar Chart</h2>
      <Bar
        data={chartData}
        options={{
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};

export default BarChart;