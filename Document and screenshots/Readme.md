# MERN Application with Monitoring and Observability

This repository contains a MERN (MongoDB, Express, React, Node.js) application for travel memories, integrated with a robust monitoring and observability setup. The application is instrumented with Prometheus for metrics, Grafana for dashboards and alerting, Loki for log aggregation, Promtail for shipping logs, and Jaeger for distributed tracing. The goal is to monitor the application’s performance, log the events, and trace request flows through the stack.

## Project Overview
This project deploys a travel memory application with a MERN stack, focused on observability and monitoring to ensure high availability, performance, and scalability. The monitoring stack includes:

- Prometheus for metrics
- Grafana for dashboards and alerting
- Loki for log aggregation
- Jaeger for distributed tracing
  
This setup provides insights into backend performance, database health, and frontend interactions.

## Step 1: MERN Application Setup
### 1. Application Deployment

   Clone the TravelMemory application repository:
```
   git clone https://github.com/UnpredictablePrashant/TravelMemory.git
   cd TravelMemory
```

### 2. Set up environment variables for the application. In the backend/ directory, create a .env file:
```
   MONGO_URI='<copied connection string>'					
   PORT=3001
```
### 3. Install the npm libraries and run the backend

```
   npm install
   node index.js
```
Backend is available at  http://localhost:3001
   
### 4. Set up frontend(React)

  Open url.js file in frontend/src folder and update the backend url

 **Note**: Replace your ip address with instance ip address

### export const baseUrl = "http://52.78:28:89:3001"

Install the npm libraries and run the frontend server

```
npm install
npm start
```
The frontend is available at http://localhost:3000

## Step 2: Install Winston for logging

To integrate logging into your backend, Winston is a great choice as it’s a versatile and powerful logging library for Node.js. Here’s how to install and set it up in your backend:

### 1. Install winston:
```
   npm install winston
```
### 2. Set Up Winston in the Backend

Create a new file for Winston configuration: Create a file called logger.js in the backend directory. This file will configure Winston to handle logging for your application.
```
// logger.js
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', // Set logging level (e.g., 'info', 'debug', 'error')
  format: format.combine(
    format.timestamp(), // Add timestamp to logs
    format.json() // Format logs as JSON
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/combined.log' })
  ],
});

module.exports = logger;
```
### 3. Use Winston in Your Application

Open index.js file and import winston logger:

```
const expressWinston = require('express-winston');
const logger = require('./logger');

// Request Logging Middleware
app.use(expressWinston.logger({
  winstonInstance: logger,
  msg: "HTTP {{req.method}} {{req.url}}", // Customize the log message
  meta: true, // Include request and response metadata (default)
  expressFormat: true, // Use default Express format
  colorize: false, // Disable colorized output
}));
```
### 4. Test Winston Logging

Start your backend server:
```
node server.js
```
Check the logs/combined.log

## Step 3: Install Promtail

Promtail is an agent used to collect logs from various sources, which it then forwards to a Loki server for log aggregation

**1. Create a Promtail Configuration File promtail-config.yaml**
   
```
   server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://15.152.42.254:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*.log
  - job_name: mern_logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: mern_logs
          __path__: /logs/*.log
```
- Replace <LOKI_SERVER> with the IP or hostname of your Loki server.
- The __path__ key specifies the path for the log files Promtail will read (this example reads files in /var/log/*.log).

**2. Run Promtail with Docker**

Now, use the docker run command to start a Promtail container with this configuration. 

```
sudo docker run -d --name=promtail   -v "$(pwd)/promtail-config.yaml:/etc/promtail/config.yaml"   -v "/var/log:/var/log"   -v "/home/ubuntu/TravelMemory/backend/logs:/logs" grafana/promtail:2.7.3 -config.file=/etc/promtail/config.yaml
```
**3.Check the logs**

```
sudo docker logs -f <container id>
```

![image](https://github.com/user-attachments/assets/6e86be7f-617e-45f4-b274-4e384473b692)

## Step 4: Install Loki Using Docker

Run the Loki Container:

```
docker run -d \
  --name loki \
  -p 3100:3100 \
  -v $(pwd)/loki-config.yaml:/etc/loki/local-config.yaml \
  grafana/loki:latest \
  -config.file=/etc/loki/local-config.yaml
```

## Step 5: Intall and setup Grafana
```
sudo apt install grafana
sudo systemctl start grafana-server
```
### Create dashboard in Grafana
Go to Configuration > Data Sources > Add data source. 
Select Loki and set the URL to http://loki:3100.
Select job as "mern_logs"








