#!/bin/bash

echo "Testing Service A directly..."
curl -X GET http://localhost:30001/api/hello

echo -e "\n\nTesting Service B through Service A..."
curl -X GET http://localhost:30001/api/call-b

echo -e "\n\nEnabling error mode in Service A..."
curl -X POST http://localhost:30001/api/simulate-error

echo -e "\n\nTesting Service A in error mode..."
curl -X GET http://localhost:30001/api/hello

echo -e "\n\nWaiting for pod restart..."
sleep 30

echo -e "\n\nTesting Service A after restart..."
curl -X GET http://localhost:30001/api/hello 