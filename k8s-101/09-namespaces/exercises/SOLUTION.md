# Solutions — Lesson 09

## Quota rejects pods without resources

When you apply `no-resources.yaml` to a namespace that has a ResourceQuota requiring `requests.cpu`/`requests.memory`, the Deployment applies but the ReplicaSet's pod-creation attempts fail. You'll see:

```
$ kubectl describe rs -n dev
...
Events:
  Warning  FailedCreate  ...  Error creating: pods "greedy-..." is forbidden:
    failed quota: dev-quota: must specify limits.cpu,limits.memory,requests.cpu,requests.memory
```

**Why a LimitRange fixes it:** with the LimitRange in place, the API server fills in defaults for any container that omits them, *before* the quota check runs. The two objects are designed to work together.

## broken-probe.yaml — wrong probe target

**Symptom:**
```
$ kubectl get pods -l app=broken-probe
NAME                              READY   STATUS    RESTARTS   AGE
broken-probe-xxx                  0/1     Running   3          45s
```

The pod is `Running` but `0/1 Ready`, and the `RESTARTS` count climbs. Reasons in `kubectl describe pod`:

```
Warning  Unhealthy  ...  Readiness probe failed: dial tcp ...:8080: connect: connection refused
Warning  Unhealthy  ...  Liveness probe failed: HTTP probe failed with statuscode: 404
```

**What's wrong:** two bugs.
1. The readiness probe targets port **8080**. Nginx listens on **80**. Connection refused → never marked Ready.
2. The liveness probe hits **`/healthz`**. Nginx returns 404 for that path. Treated as failure → pod restarted.

**Fix:**
```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
livenessProbe:
  httpGet:
    path: /
    port: 80
```

For a real app you control, you'd build a proper `/healthz` endpoint and probe that. We do this in the capstone.

**Lesson:**
- Failed readiness ⇒ pod doesn't receive traffic. Failed liveness ⇒ pod gets restarted.
- A combo of those two = pod stays at `0/1 Ready` with rising restart count. Hallmark of a probe-config bug.
- Treat probe configuration like code. Test the probe target separately (`kubectl exec -- wget -O- http://localhost:PORT/PATH`) before relying on it.
