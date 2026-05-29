# Lesson 10 — Capstone: Full-Stack Deployment

> Deploy a real three-tier app: React frontend, Node API, Postgres database. End-to-end on your laptop cluster.

This is the final lesson and it's deliberately a step up in scope. You'll build images from real source code, push them into the cluster, wire everything together with manifests, and break it on purpose to internalize how the pieces interact.

## What you'll deploy

```
                  ┌──────────────────┐
                  │      browser     │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │  Ingress         │
                  │  /     → web     │
                  │  /api  → api     │
                  └────┬─────────┬───┘
                       │         │
              ┌────────▼─┐   ┌───▼─────────┐
              │  svc:web │   │   svc:api   │
              └────┬─────┘   └──────┬──────┘
                   │                │
              ┌────▼──────┐    ┌────▼─────────┐
              │ Deployment│    │  Deployment  │
              │  (2 pods) │    │  (2 pods)    │
              │  nginx +  │    │  Node.js +   │
              │  built    │    │  Express API │
              │  React    │    └────┬─────────┘
              └───────────┘         │
                                ┌───▼──────┐
                                │ svc: db  │ (headless)
                                └───┬──────┘
                                ┌───▼──────────────┐
                                │ StatefulSet (db) │
                                │ Postgres + PVC   │
                                └──────────────────┘
```

## Repo layout

```
10-capstone/
├── README.md             ← you are here
├── Makefile              ← build / load / deploy / destroy
├── web/                  ← React frontend (Vite + nginx)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       └── App.jsx
├── api/                  ← Node + Express API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.js
├── k8s/                  ← Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-db-secret.yaml
│   ├── 02-db.yaml
│   ├── 03-api-config.yaml
│   ├── 04-api.yaml
│   ├── 05-web.yaml
│   └── 06-ingress.yaml
└── exercises/
    ├── TODO.md
    ├── SOLUTION.md
    └── broken/
        ├── broken-1-db.yaml
        ├── broken-2-api.yaml
        └── broken-3-ingress.yaml
```

## Prerequisites

- Cluster created from [`02-setup/cluster.yaml`](../02-setup/cluster.yaml) (it has the port mappings for ingress)
- nginx-ingress installed (see [`08-ingress/README.md`](../08-ingress/README.md))
- Docker running on your laptop
- `make` available (`brew install make` on macOS if needed)

## Quick start (TL;DR)

```bash
cd 10-capstone
make all
# wait ~2 minutes for everything to come up
make status

# in your browser:
open http://app.localtest.me
```

If you see a page that shows the current time from Postgres and the pod name that served you, **you just deployed a full three-tier app to Kubernetes from scratch.**

## What `make all` does

1. `make build` — builds Docker images for `web` and `api`
2. `make load` — loads them into the kind cluster (so the cluster can see them without a registry)
3. `make deploy` — applies all manifests in `k8s/` in order
4. `make wait` — waits for everything to be ready

Read the Makefile. Every step is a simple shell command. No magic.

## Why no Helm / no registry?

For learning. In real life:
- You'd push images to a registry (ECR, GHCR, Docker Hub).
- You'd template manifests with Helm or Kustomize so dev/staging/prod can share a base.

These are valuable next steps but they add ceremony that obscures the K8s primitives. Once you can deploy this by hand, learning Helm takes an afternoon.

## Walk-through

### The frontend (`web/`)

A tiny Vite + React app. The Dockerfile is **multi-stage**:
1. Stage 1 builds the static bundle with Node
2. Stage 2 serves the static files with nginx

This keeps the final image tiny (~25MB instead of ~300MB).

### The API (`api/`)

A small Express app that:
- Exposes `GET /healthz` for liveness/readiness probes
- Exposes `GET /api/time` that queries Postgres and returns the current DB time + the pod hostname
- Reads DB credentials from env vars (populated from a Secret)

### The database (`k8s/02-db.yaml`)

A Postgres `StatefulSet` with:
- A headless Service for stable DNS (`db-0.db`)
- A `volumeClaimTemplate` that gives every replica its own PVC
- A `readinessProbe` using `pg_isready`

Single replica for this tutorial — multi-master Postgres is its own multi-month topic.

### The Ingress (`k8s/06-ingress.yaml`)

- `/api/*` → api service
- `/*`     → web service

You hit `http://app.localtest.me` and everything works.

## Exercises

See [`exercises/TODO.md`](exercises/TODO.md). Three broken manifests to debug, plus open-ended scaling and failure-recovery tasks.

## Tear down

```bash
make clean
# or for a full reset
kind delete cluster --name k8s-101
```

## Where to go next

You now have the foundation to learn:

- **Helm** — package manager for K8s. Turns this YAML soup into reusable, parameterized charts.
- **Kustomize** — built into kubectl. Overlay-based config for dev / staging / prod.
- **Observability** — Prometheus for metrics, Loki/Grafana for logs, OpenTelemetry for traces.
- **GitOps** — Argo CD or Flux. Your git repo becomes the source of truth; the cluster reconciles itself.
- **Production clouds** — EKS / GKE / AKS. Same APIs, plus IAM, autoscaling, managed networking, real LoadBalancers.
- **The docs** — kubernetes.io/docs is genuinely excellent reference material.

You started knowing zero. You now have a real cluster running a real three-tier app you can break and heal at will. Everything else in the Kubernetes ecosystem is variations on the same primitives: **pods, controllers, services, config, storage**. Build from here.
