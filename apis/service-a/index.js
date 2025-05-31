const express = require('express');
const axios = require('axios');
const promClient = require('prom-client');

const app = express();
const port = 3000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Error counter
const errorCounter = new promClient.Counter({
  name: 'service_a_errors_total',
  help: 'Total number of errors in Service A',
  registers: [register]
});

let errorMode = false;

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/api/hello', (req, res) => {
  if (errorMode) {
    errorCounter.inc();
    res.status(500).json({ error: 'Service is in error mode' });
    return;
  }
  res.json({ message: 'Hello from Service A!' });
});

app.get('/api/call-b', async (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  try {
    if (errorMode) {
      errorCounter.inc();
      throw new Error('Service is in error mode');
    }
    const response = await axios.get('http://service-b:3000/api/hello');
    res.json(response.data);
    end({ method: 'GET', route: '/api/call-b', status_code: 200 });
  } catch (error) {
    errorCounter.inc();
    end({ method: 'GET', route: '/api/call-b', status_code: 500 });
    res.status(500).json({ error: 'Error calling Service B' });
  }
});

app.post('/api/simulate-error', (req, res) => {
  errorMode = !errorMode;
  res.json({ message: `Error mode ${errorMode ? 'enabled' : 'disabled'}` });
});

app.listen(port, () => {
  console.log(`Service A listening at http://localhost:${port}`);
}); 