import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'react-chartjs-2';

const PieChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
    }],
  });

  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async (month) => {
      try {
        const response = await axios.get(`/api/pie-chart?month=${month}`);
        const { labels, data } = response.data;
        const backgroundColors = generateBackgroundColors(labels.length);

        setChartData({
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors,
          }],
        });
      } catch (error) {
        console.error('Error fetching pie chart data:', error.message);
      }
    };

    fetchData(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    // If a chart already exists, destroy it before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        maintainAspectRatio: false,
      },
    });
  }, [chartData]);

  const generateBackgroundColors = (length) => {
    // Generate random colors for each segment
    const colors = [];
    for (let i = 0; i < length; i++) {
      const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;
      colors.push(color);
    }
    return colors;
  };

  return (
    <div>
      <h2>Pie Chart</h2>
      <canvas id="myChart" />
    </div>
  );
};

export default PieChart;