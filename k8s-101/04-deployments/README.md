# Lesson 04 — Deployments

> The thing that makes pods stop dying for good. Self-healing, scalable, rolling updates included.

## The hierarchy

You don't manage pods directly in real life. You manage **Deployments**. A Deployment manages a **ReplicaSet**. The ReplicaSet manages **Pods**.

```
┌─────────────┐  manages  ┌─────────────┐  manages  ┌───────┐
│ Deployment  │──────────▶│ ReplicaSet  │──────────▶│  Pod  │
│ "3 of these"│           │ keeps count │           │  Pod  │
└─────────────┘           └─────────────┘           │  Pod  │
                                                    └───────┘
```

- Kill a pod → ReplicaSet spawns another
- Change the image → Deployment creates a new ReplicaSet and rolls traffic over
- Scale to 10 → Deployment tells the ReplicaSet "more"

## Write a Deployment

Read [`deployment.yaml`](deployment.yaml). The key parts:

```yaml
spec:
  replicas: 3                    # how many pods
  selector:
    matchLabels:
      app: web                   # which pods this Deployment owns
  template:                      # ← this whole block is a Pod template
    metadata:
      labels:
        app: web                 # ← must match selector above
    spec:
      containers:
        - name: nginx
          image: nginx:1.25-alpine
          ports:
            - containerPort: 80
```

**The labels in `selector.matchLabels` must match the labels in `template.metadata.labels`.** If they don't, the Deployment refuses to apply.

## Apply and watch

```bash
kubectl apply -f deployment.yaml
kubectl get pods -l app=web -w     # -w = watch
```

You'll see pods transition: `ContainerCreating` → `Running`.

## Self-healing: see it in action

```bash
kubectl delete pod -l app=web --field-selector=status.phase=Running --wait=false
kubectl get pods -l app=web
# new pods are already starting. you literally cannot kill them.
```

## Scale

```bash
kubectl scale deployment/web --replicas=5
```

Or edit the YAML, change `replicas:`, and re-apply. Same result. Editing the YAML is the better habit — your git history then matches the cluster.

## Rolling updates

Change the image in `deployment.yaml` to `nginx:1.27-alpine`, re-apply, and watch:

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/web
```

You'll see something like:
```
Waiting for deployment "web" rollout to finish: 2 of 5 updated...
deployment "web" successfully rolled out
```

What just happened: the Deployment created a new ReplicaSet, scaled it up while scaling the old one down, **one pod at a time**. Users see no downtime. This is the single biggest reason teams adopt Kubernetes.

## Rollouts

```bash
kubectl rollout history deployment/web
kubectl rollout undo deployment/web              # back one revision
kubectl rollout undo deployment/web --to-revision=2
kubectl rollout restart deployment/web           # bounce all pods
```

## Resource requests and limits

Always declare them. This file has them already:

```yaml
resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

- **request** = guaranteed floor; the scheduler uses this to place the pod
- **limit** = hard ceiling; CPU gets throttled above it, memory gets OOM-killed

Without these, one runaway pod can take down a node.

## Strategy

The default rollout strategy is `RollingUpdate` with sensible defaults. You can tune:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1     # how many pods can be down during rollout
      maxSurge: 1           # how many extra pods can briefly exist
```

For most apps, defaults are fine.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md). Two broken deployments to fix.

## Next

➡️  [Lesson 05 — Services](../05-services/README.md)
