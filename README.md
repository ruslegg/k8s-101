# Kubernetes 101 — From Zero to Deploy

A hands-on tutorial for full-stack engineers who have **never touched Kubernetes**. Designed for self-paced learning or team workshops.

## What you'll build

By the end you will have deployed, broken, and healed a full three-tier application (React frontend + Node API + Postgres) running on a local Kubernetes cluster, complete with rolling updates, persistent storage, config management, and ingress routing.

## How this is organized

```
01-what-and-why/      Concepts, no code yet
02-setup/             Install kind + kubectl, create a cluster
03-pods/              The atomic unit
04-deployments/       Self-healing, scaling, rolling updates
05-services/          Stable networking
06-config/            ConfigMaps and Secrets
07-storage/           PVs, PVCs, persistence
08-ingress/           External traffic routing
09-namespaces/        Organization and resource limits
10-capstone/          Full-stack app: source code, Dockerfiles, manifests
docs/                 Browsable HTML version of the tutorial
```

Each lesson folder contains:

- `README.md` — the lesson content with concepts and walk-through
- Working `.yaml` files you can apply
- `exercises/` — todo lists + a broken file to fix + verification steps

## Prerequisites

- Docker installed and running
- Comfortable on the command line
- 4 GB RAM free for the local cluster

You do **not** need cloud accounts. Everything runs on your laptop.

## How to use this
1. `python3 -m http.server 8080` serve the files from k8s-101
2. open `index.html`
3. cd `./k8s-101/01-what-and-why` Follow the lesson and go each lesson's additional resources (exercises, files, etc).


## Quick install reference

```bash
# macOS
brew install docker kind kubectl

# Linux: see 02-setup/README.md
```

Then verify:
```bash
docker version
kind version
kubectl version --client
```

## Tutorial conventions

- `$` at the start of a code block means "type this into your shell"
- File paths in code blocks are relative to the lesson folder
- "Broken" exercise files have intentional bugs — fixing them teaches debugging
- Solutions live in `exercises/SOLUTION.md` (no peeking until you've tried)

## Where to go next

After lesson 10, you'll have the foundation to learn Helm, Kustomize, GitOps (Argo CD / Flux), cloud-managed K8s (EKS / GKE / AKS), and observability tooling (Prometheus / Grafana / OpenTelemetry).

## License

MIT — fork, modify, teach your team.
