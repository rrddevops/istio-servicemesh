# Kubernetes Service Mesh Demo with Istio

This project demonstrates a service mesh implementation using Istio, with two microservices communicating with each other. The setup includes ArgoCD for continuous deployment and Prometheus for monitoring.

## Prerequisites

- Docker Desktop
- Kind
- kubectl
- Istio
- ArgoCD CLI
- Helm

## Project Structure

```
.
├── apis/
│   ├── service-a/
│   └── service-b/
├── k8s/
│   ├── argocd/
│   ├── istio/
│   └── prometheus/
└── scripts/
```

## Setup Instructions

1. Create Kind cluster:

```bash
kind create cluster --name istio-demo --config k8s/kind-config.yaml
```

2. Install Istio:

```bash
istioctl install --set profile=demo -y
```

3. Install ArgoCD:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

4. Install Prometheus:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```
5. Apply the namespace and enable Istio injection:

```bash
kubectl apply -f k8s/namespace.yaml
```
6. Deploy applications:

```bash 
kubectl apply -f k8s/service-a/
kubectl apply -f k8s/service-b/
```

## Testing the Setup

1. Test Service A:
```bash
curl -X GET http://localhost:30001/api/hello
```

2. Test Service B (through Service A):
```bash
curl -X GET http://localhost:30001/api/call-b
```

## Monitoring

1. Access ArgoCD UI:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

2. Access Prometheus UI:
```bash
kubectl port-forward svc/prometheus-operated -n monitoring 9090:9090
```

3. Access Grafana:
```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```

## Error Simulation and Recovery

To simulate errors and test pod restart functionality:
```bash
curl -X POST http://localhost:30001/api/simulate-error
```

This will trigger errors that will be monitored by Istio, leading to automatic pod restart. 