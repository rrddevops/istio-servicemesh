const express = require('express');
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

const errorCounter = new promClient.Counter({
  name: 'service_b_errors_total',
  help: 'Total number of errors in Service B',
  registers: [register]
});

let errorMode = false;

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/api/hello', (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  
  if (errorMode) {
    errorCounter.inc();
    end({ method: 'GET', route: '/api/hello', status_code: 500 });
    res.status(500).json({ error: 'Service is in error mode' });
    return;
  }

  end({ method: 'GET', route: '/api/hello', status_code: 200 });
  res.json({ message: 'Hello from Service B!' });
});

app.post('/api/simulate-error', (req, res) => {
  errorMode = !errorMode;
  res.json({ message: `Error mode ${errorMode ? 'enabled' : 'disabled'}` });
});

app.listen(port, () => {
  console.log(`Service B listening at http://localhost:${port}`);
}); 