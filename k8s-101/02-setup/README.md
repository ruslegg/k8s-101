# Lesson 02 — Setup

> Install three things. Verify they work. Then we play with a real cluster on your laptop.

## What we'll install

| Tool       | Role                                                |
| ---------- | --------------------------------------------------- |
| `docker`   | Container runtime — builds and runs images          |
| `kind`     | "Kubernetes in Docker" — a real cluster in containers |
| `kubectl`  | Command-line client to talk to the cluster          |

**Why kind over Docker Desktop's built-in K8s or minikube?** kind is fast, scriptable, and lets you spin up multi-node clusters trivially. It's what most teams use for CI.

## Install

### macOS (Homebrew)

```bash
brew install docker kind kubectl
open -a Docker          # start Docker Desktop
```

### Linux

```bash
# docker — follow docs.docker.com for your distro

# kind
[ "$(uname -m)" = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
chmod +x ./kind && sudo mv ./kind /usr/local/bin/

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -m 0755 kubectl /usr/local/bin/kubectl
```

### Windows

Easiest path: install **Docker Desktop** (it bundles a working kubectl), then `winget install Kubernetes.kind`. Or use WSL2 + the Linux instructions above (recommended for serious work).

## Create your first cluster

A config file is included in this folder so we get reproducible clusters. Apply it:

```bash
cd 02-setup
kind create cluster --name k8s-101 --config cluster.yaml
```

The first run downloads the node image (~1 GB). Subsequent runs are fast.

Verify:

```bash
kubectl cluster-info
kubectl get nodes
```

You should see one or more nodes in `Ready` state. If yes — **congratulations, you have a real Kubernetes cluster.**

## The cluster, conceptually

```
┌────────────────────────────┐    ┌────────────────────────┐
│ CONTROL PLANE              │    │ WORKER NODE            │
│  ┌────────────────────┐    │    │  ┌──────────────────┐  │
│  │ API Server         │◄───┼────┼──┤ kubelet (agent)  │  │
│  ├────────────────────┤    │    │  ├──────────────────┤  │
│  │ Scheduler          │    │    │  │ container runtime│  │
│  ├────────────────────┤    │    │  └──────────────────┘  │
│  │ Controller Manager │    │    └────────────────────────┘
│  ├────────────────────┤    │    ┌────────────────────────┐
│  │ etcd  (the brain's │    │    │ WORKER NODE            │
│  │        memory)     │    │    │  ...                   │
│  └────────────────────┘    │    └────────────────────────┘
└────────────────────────────┘
```

Right now your kind cluster has *one* node playing both roles (control-plane + worker). That's fine for learning. The `cluster.yaml` in this folder is set up to allow ingress later.

## Make kubectl pleasant

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias k=kubectl
source <(kubectl completion zsh)   # or 'bash'
complete -F __start_kubectl k
```

You'll type kubectl ~500 times. Save your wrists.

## Useful kubectl commands you'll use constantly

```bash
kubectl get <kind>                 # list things
kubectl get pods -o wide           # more detail
kubectl get pods -A                # across all namespaces
kubectl describe pod <name>        # everything K8s knows
kubectl logs <pod>                 # stdout/stderr
kubectl logs -f <pod>              # follow
kubectl exec -it <pod> -- sh       # shell into it
kubectl apply -f file.yaml         # create or update
kubectl delete -f file.yaml        # remove
kubectl explain pod.spec           # built-in API docs (!)
```

That last one is gold: `kubectl explain` documents every field of every object.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 03 — Pods](../03-pods/README.md)
