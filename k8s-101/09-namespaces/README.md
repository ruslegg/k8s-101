# Lesson 09 — Namespaces & Limits

> Organizing the cluster and stopping any one team (or bug) from eating it alive.

## Namespaces

Namespaces are virtual partitions of a cluster. They:

- Scope names — you can have `web` in `dev` and `web` in `prod` simultaneously
- Enable per-team RBAC (who can do what)
- Are the unit at which **ResourceQuota** and **NetworkPolicy** apply

```bash
kubectl get ns
kubectl create namespace dev
kubectl create namespace prod
kubectl apply -f deployment.yaml -n dev
kubectl get pods -n dev
```

### Set a default namespace for your context

```bash
kubectl config set-context --current --namespace=dev
# now `kubectl get pods` is implicitly in dev
```

> 💡 Install `kubectx` and `kubens`. They're tiny CLIs for switching contexts and namespaces. Worth the 30-second install.

### Special namespaces

| Namespace      | What's in it                                          |
| -------------- | ----------------------------------------------------- |
| `default`      | Where stuff lands if you don't specify a namespace    |
| `kube-system`  | Cluster components (DNS, scheduler, proxy)            |
| `kube-public`  | Anonymously-readable cluster info                     |
| `kube-node-lease` | Node heartbeats                                    |

Don't put your apps in `kube-system`. Don't touch `kube-system` unless you know exactly what you're doing.

## Resource requests and limits (review + deepen)

Every container should declare what it *needs* (`requests`) and what it's *capped at* (`limits`).

- **request** is what the scheduler uses to place the pod. It's a reservation.
- **limit** is the hard ceiling. CPU gets throttled; memory gets OOM-killed.

```
  ┌─────────┬──────────────────────┬─────────────┐
  │ request │   between (burst)    │   over      │
  │guaranteed│   elastic / shared  │   DENIED    │
  └─────────┴──────────────────────┴─────────────┘
            ↑                      ↑
          request                 limit
```

### How to express resources

- **CPU:** `1` = 1 full core. `500m` = half a core. `100m` = 10% of a core.
- **Memory:** `128Mi` = 128 mebibytes. `1Gi` = 1 gibibyte.

## ResourceQuota: cap a whole namespace

See [`quota.yaml`](quota.yaml):

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
    pods: "20"
```

Once a ResourceQuota with `requests.cpu` or `requests.memory` exists in a namespace, **every pod must declare matching `resources` fields** — otherwise the API server rejects them. The cluster forces good hygiene.

## LimitRange: set defaults

A `LimitRange` provides defaults for pods that don't specify resources, so people don't have to remember:

```yaml
# limitrange.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-defaults
  namespace: dev
spec:
  limits:
    - type: Container
      default:
        cpu: 200m
        memory: 256Mi
      defaultRequest:
        cpu: 50m
        memory: 64Mi
```

Apply this to a quota'd namespace and pods without resource specs will quietly get the defaults instead of being rejected.

## Health checks: liveness, readiness, startup

Three probes Kubernetes uses to know if your pod is OK:

| Probe        | What happens on failure                                                |
| ------------ | ---------------------------------------------------------------------- |
| `liveness`   | Pod is restarted                                                       |
| `readiness`  | Pod is removed from Service endpoints (no traffic) until healthy       |
| `startup`    | Suppresses the other two while a slow app boots                        |

Example in [`deployment-with-probes.yaml`](deployment-with-probes.yaml):

```yaml
readinessProbe:
  httpGet: { path: /healthz, port: 8080 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
  periodSeconds: 10
  failureThreshold: 3
```

> ⚠️ Don't make liveness probes too aggressive. A pod that's slow under load can get restarted into a loop, making things worse. Start with readiness; only add liveness if you actually have a "process is stuck" failure mode.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 10 — Capstone](../10-capstone/README.md)
