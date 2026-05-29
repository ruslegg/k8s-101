# Lesson 03 — Pods

> The smallest deployable unit. Not the container — the pod. This distinction matters.

## What is a Pod?

A Pod is a wrapper around one or more containers that share a network namespace and storage. **You never run a bare container on Kubernetes — you run pods.**

```
   POD (typical)              POD (sidecar pattern)
┌──────────────────┐       ┌──────────────────────────┐
│  ┌────────────┐  │       │  ┌────────┐ ┌─────────┐  │
│  │ container  │  │       │  │  app   │ │ log-    │  │
│  │ app: nginx│  │       │  │ (main) │ │ shipper │  │
│  └────────────┘  │       │  └────────┘ └─────────┘  │
│                  │       │      ↑ talk via localhost│
└──────────────────┘       └──────────────────────────┘
shared: IP, port space, volumes
```

99% of the time, one pod = one container. Multi-container pods exist for tight-coupling patterns (logging sidecars, proxies, init containers). Don't overuse them.

## Run your first pod (the imperative way)

```bash
kubectl run hello --image=nginx:alpine
kubectl get pods
kubectl describe pod hello       # everything K8s knows about it
kubectl logs hello               # container's stdout/stderr
kubectl exec -it hello -- sh     # shell into it
```

That works, but `kubectl run` is for poking around. The real way is **declarative**: write a YAML file describing what you want, then apply it.

## The declarative way (YAML)

This folder contains [`pod.yaml`](pod.yaml). Read it:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello
  labels:
    app: hello
spec:
  containers:
    - name: web
      image: nginx:alpine
      ports:
        - containerPort: 80
```

Apply it:

```bash
kubectl delete pod hello              # clean up the imperative one
kubectl apply -f pod.yaml
kubectl get pod hello -o yaml | less  # see everything K8s filled in
```

Every Kubernetes object has the same four-field skeleton:

- `apiVersion`
- `kind`
- `metadata`
- `spec`

Memorize it. It never changes.

## Pods are mortal

> ⚠️ If your node dies, your pod dies with it. Pods are **not** resilient on their own. They're designed to be replaceable. To run resilient apps, you wrap pods in a *Deployment* — that's the next lesson.

Try this to see for yourself:

```bash
kubectl delete pod hello
kubectl get pods
# gone. nothing brings it back.
```

## Pod lifecycle states

When you `kubectl get pods`, the `STATUS` column shows one of:

| Status              | What it means                                          |
| ------------------- | ------------------------------------------------------ |
| `Pending`           | Scheduled but image still pulling / waiting on resources |
| `ContainerCreating` | Image pulled, container is starting                     |
| `Running`           | All containers are up                                  |
| `Completed`         | Containers ran to completion (job-style workloads)      |
| `CrashLoopBackOff`  | Container keeps crashing; K8s is backing off restarts  |
| `ImagePullBackOff`  | Can't pull the image (typo? auth?)                     |
| `Error`             | Generic failure                                         |

You'll see `CrashLoopBackOff` and `ImagePullBackOff` a lot. They're not bugs in Kubernetes; they're K8s reporting bugs in your config.

## Useful debugging flow

When a pod isn't doing what you want:

```bash
kubectl get pods                # what's the status?
kubectl describe pod <name>     # what events occurred? (scroll to "Events:")
kubectl logs <name>             # what did the app print?
kubectl logs <name> --previous  # logs from the *last* container, if it crashed
kubectl exec -it <name> -- sh   # poke around inside
```

The `Events:` section of `kubectl describe pod` is usually where the answer is.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md). This is your first **broken file to fix** exercise.

## Next

➡️  [Lesson 04 — Deployments](../04-deployments/README.md)
