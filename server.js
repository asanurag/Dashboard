const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const connectDB = require("./db");

connectDB();

app.use(cors());
app.use(express.json());

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  sold: { type: Boolean, required: true },
  image: { type: String },
  dateOfSale: { type: Date, required: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const validateInput = (req, res, next) => {
  const { page, perPage, search, month } = req.query;
  if (
    isNaN(page) ||
    page < 1 ||
    isNaN(perPage) ||
    perPage < 1 ||
    month < 0 ||
    month > 11 ||
    (search && typeof search !== "string")
  ) {
    return res.status(400).json({ error: "Invalid input parameters" });
  }
  next();
};

// Route to fetch data from third-party API and initialize the database
app.get("/api/initDB", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const data = response.data;

    await Transaction.insertMany(data);

    res.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


 

// API endpoint to list transactions with search and pagination
app.get("/api/transactions", validateInput, async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    search = "",
    month = new Date().getMonth(),
  } = req.query;
  const regex = new RegExp(search, "i");

  const startDate = new Date(new Date().getFullYear(), month, 1);
  const endDate = new Date(new Date().getFullYear(), month + 1, 0);

  try {
    const transactions = await Transaction.find({
      $and: [
        { dateOfSale: { $gte: startDate, $lt: endDate } },
        {
          $or: [
            { title: regex },
            { description: regex },
            { price: parseFloat(search) || 0 },
          ],
        },
      ],
    })
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const count = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
    });
    res.json({
      transactions,
      totalPages: Math.ceil(count / parseInt(perPage)),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/statistics", async (req, res) => {
  const month = new Date().getMonth();

  const startDate = new Date(new Date().getFullYear(), month, 1);
  const endDate = new Date(new Date().getFullYear(), month + 1, 0);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate },
    });
    const totalSale = transactions.reduce(
      (acc, transaction) => acc + transaction.price,
      0
    );
    const soldCount = transactions.filter(
      (transaction) => transaction.sold
    ).length;
    const notSoldCount = transactions.length - soldCount;
    res.json({ totalSale, soldCount, notSoldCount });
  } catch (error) {
    console.error("Error fetchaing statistics:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Other API endpoints (bar-chart)
app.get("/api/bar-chart", async (req, res) => {
  const month = new Date().getMonth();
  const startDate = new Date(new Date().getFullYear(), month, 1);
  const endDate = new Date(new Date().getFullYear(), month + 1, 0);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate },
    });
    const priceRanges = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901+": 0,
    };

    for (const transaction of transactions) {
      const price = transaction.price;
      if (price >= 0 && price <= 100) {
        priceRanges["0-100"]++;
      } else if (price >= 101 && price <= 200) {
        priceRanges["101-200"]++;
      } else if (price >= 201 && price <= 300) {
        priceRanges["201-300"]++;
      } else if (price >= 301 && price <= 400) {
        priceRanges["301-400"]++;
      } else if (price >= 401 && price <= 500) {
        priceRanges["401-500"]++;
      } else if (price >= 501 && price <= 600) {
        priceRanges["501-600"]++;
      } else if (price >= 601 && price <= 700) {
        priceRanges["601-700"]++;
      } else if (price >= 701 && price <= 800) {
        priceRanges["701-800"]++;
      } else if (price >= 801 && price <= 900) {
        priceRanges["801-900"]++;
      } else {
        priceRanges["901+"]++;
      }
    }


    const chartData = {
      labels: Object.keys(priceRanges), 
      datasets: [
        {
          label: "Price Distribution",
          data: Object.values(priceRanges), 
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)", 
            "rgba(54, 162, 235, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    res.json(chartData);
  } catch (error) {
    console.error("Error generating bar chart data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to fetch transaction statistics for the selected month
app.get("/api/monthly-statistics", async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(new Date().getFullYear(), month, 1);
  const endDate = new Date(new Date().getFullYear(), month + 1, 0);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate },
    });

    const totalSale = transactions.reduce((acc, transaction) => acc + transaction.price, 0);
    const soldCount = transactions.filter(transaction => transaction.sold).length;
    const notSoldCount = transactions.length - soldCount;

    res.json({
      totalSale,
      soldCount,
      notSoldCount,
    });
  } catch (error) {
    console.error("Error fetching monthly statistics:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/pie-chart", async (req, res) => {
  const month = new Date().getMonth();
  const startDate = new Date(new Date().getFullYear(), month, 1);
  const endDate = new Date(new Date().getFullYear(), month + 1, 0);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startDate, $lt: endDate },
    });
    const categoryCounts = transactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + 1;
      return acc;
    }, {});

    const categoryLabels = Object.keys(categoryCounts);
    const categoryData = Object.values(categoryCounts);

    const chartData = {
      labels: categoryLabels,
      datasets: [
        {
          label: "Category Distribution",
          data: categoryData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)", 
            "rgba(54, 162, 235, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    res.json(chartData);
  } catch (error) {
    console.error("Error generating pie chart data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Combine all APIs response
app.get("/api/combined-data", async (req, res) => {
  try {
    const initDBResponse = await axios.get("http://localhost:3000/api/initDB");
    const statisticsResponse = await axios.get(
      "http://localhost:3000/api/statistics"
    );
    const barChartResponse = await axios.get(
      "http://localhost:3000/api/bar-chart"
    );
    const pieChartResponse = await axios.get(
      "http://localhost:3000/api/pie-chart"
    );

    // Extract data from responses
    const initData = initDBResponse.data;
    const statisticsData = statisticsResponse.data;
    const barChartData = barChartResponse.data;
    const pieChartData = pieChartResponse.data;

    // Combine data into a single object
    const combinedData = {
      initDBData: initData,
      statisticsData: statisticsData,
      barChartData: barChartData,
      pieChartData: pieChartData,
    };  

    // Send combined data as response
    res.json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to your MERN stack application!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
