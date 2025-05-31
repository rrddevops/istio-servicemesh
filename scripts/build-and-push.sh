#!/bin/bash

# Build and push Service A
cd apis/service-a
docker build -t rodrigordavila/service-a:latest .
docker push rodrigordavila/service-a:latest

# Build and push Service B
cd ../service-b
docker build -t rodrigordavila/service-b:latest .
docker push rodrigordavila/service-b:latest 