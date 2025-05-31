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

3. Install Istio addons:

```bash
# Install Istio addons
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/grafana.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml

# Apply Kiali configuration
kubectl apply -f k8s/istio/kiali-config.yaml
```

4. Install ArgoCD:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

5. Install Prometheus:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```

6. Apply the namespace and enable Istio injection:

```bash
kubectl apply -f k8s/namespace.yaml
```

7. Deploy applications:

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
# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Username: admin
Password: (use the password from the command above)

2. Access Prometheus UI:
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
```

3. Access Grafana:
```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```
Username: admin
Password: prom-operator

4. Access Kiali dashboard:
```bash
# Wait for Kiali to be ready
kubectl rollout status deployment/kiali -n istio-system

# Access Kiali dashboard
kubectl port-forward svc/kiali -n istio-system 20001:20001
```
Access at http://localhost:20001 (no authentication required)

## Error Simulation and Recovery

To simulate errors and test pod restart functionality:
```bash
curl -X POST http://localhost:30001/api/simulate-error
```

This will trigger errors that will be monitored by Istio, leading to automatic pod restart.

# Enable Kubernetes in Docker Desktop settings
# Then switch to the Docker Desktop context
kubectl config use-context docker-desktop 