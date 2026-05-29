# Lesson 08 — Ingress

> One door for the whole cluster. Route by hostname and path. The way real apps get exposed.

## Why Ingress

Exposing every Service with a `LoadBalancer` means one cloud LB (and one bill) per service. **Ingress** is a single entry point that routes requests to the right Service based on the URL.

```
                  ┌────────────────────┐    ┌──────────────────┐
                  │ Ingress Controller │ ──▶│ svc: api  (/api) │
   Internet ────▶ │ nginx/traefik/etc  │ ──▶│ svc: web  (/)    │
                  └────────────────────┘ ──▶│ svc: admin (/adm)│
                                            └──────────────────┘
```

## The two pieces

- **Ingress Controller** — the actual proxy (nginx-ingress, Traefik, HAProxy, etc.). You install it once per cluster. It runs as pods.
- **Ingress resource** — a YAML object you write that tells the controller "for host X path Y, send to Service Z".

## Install the nginx ingress controller (on kind)

> ⚠️ Your cluster needs the port mappings from [`02-setup/cluster.yaml`](../02-setup/cluster.yaml). If you created the cluster without them, delete it and recreate now:
> ```bash
> kind delete cluster --name k8s-101
> kind create cluster --name k8s-101 --config ../02-setup/cluster.yaml
> ```

Then install nginx-ingress for kind:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s
```

Verify:
```bash
kubectl get pods -n ingress-nginx
# the "controller" pod should be Running
```

## Deploy the demo apps

This lesson includes:

- [`web-deployment.yaml`](web-deployment.yaml) — nginx serving a welcome page
- [`api-deployment.yaml`](api-deployment.yaml) — `hashicorp/http-echo` returning JSON-ish text
- [`ingress.yaml`](ingress.yaml) — routes `/` to web, `/api` to api

```bash
kubectl apply -f web-deployment.yaml -f api-deployment.yaml -f ingress.yaml
```

## Test it

```bash
curl http://app.localtest.me/         # → web service
curl http://app.localtest.me/api      # → api service
```

`localtest.me` and all its subdomains resolve to `127.0.0.1` publicly — a free way to test virtual hosts without editing `/etc/hosts`.

## How the Ingress routes

```yaml
spec:
  ingressClassName: nginx     # which controller handles this
  rules:
    - host: app.localtest.me
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api
                port: { number: 80 }
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port: { number: 80 }
```

Path matching order matters in concept but ingress-nginx sorts by specificity, so `/api` wins over `/` for `/api/anything` automatically.

`pathType` options:
| Value      | Meaning                                                  |
| ---------- | -------------------------------------------------------- |
| `Exact`    | Match the exact path only                                |
| `Prefix`   | Match by path prefix (most common)                       |
| `ImplementationSpecific` | Up to the controller                       |

## TLS, briefly

In production you add a `tls:` section pointing at a Secret containing the cert + key, and run **cert-manager** to auto-provision Let's Encrypt certs. We'll skip the details — same shape, more YAML.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 09 — Namespaces & Limits](../09-namespaces/README.md)
