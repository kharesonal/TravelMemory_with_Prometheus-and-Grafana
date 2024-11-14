const express = require('express')
const cors = require('cors')
const expressWinston = require('express-winston');
const logger = require('./logger');
const { collectDefaultMetrics, register, Histogram, Counter } = require('prom-client'); //prometheus client
require('dotenv').config()

// Prometheus Metrics
collectDefaultMetrics(); // Collect default metrics

const app = express()
PORT = process.env.PORT
const conn = require('./conn')

// Create custom Prometheus metrics
const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

const requestCounter = new Counter({
  name: 'http_request_count',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});


// Request Logging Middleware
app.use(expressWinston.logger({
  winstonInstance: logger,
  msg: "HTTP {{req.method}} {{req.url}}", // Customize the log message
  meta: true, // Include request and response metadata (default)
  expressFormat: true, // Use default Express format
  colorize: false, // Disable colorized output
}));

// Middleware to track request metrics
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer(); // Start timer for request duration
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode }); // Stop timer when request is finished
    requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode }); // Increment request counter
  });
  next();
});

app.use(express.json())
app.use(cors())

const tripRoutes = require('./routes/trip.routes')

app.use('/trip', tripRoutes) // http://localhost:3001/trip --> POST/GET/GET by ID

app.get('/hello', (req,res)=>{
    res.send('Hello World!')
})

// Expose Prometheus metrics at /metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
  console.log(await register.metrics());

});

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
