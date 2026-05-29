# Solutions — Lesson 05

## broken-1.yaml — selector matches no pods

**Symptom:**
```
$ kubectl get endpoints broken-one
NAME         ENDPOINTS   AGE
broken-one   <none>      30s
```

`kubectl describe svc broken-one` confirms the selector: `app=webserver`.

`kubectl get pods --show-labels` shows pods labeled `app=web`.

**What's wrong:** the Service's selector is `app: webserver`, but the pods are labeled `app: web`. The Service is a label query; no matches means no endpoints; no endpoints means connections hang or get refused.

**Fix:**
```yaml
selector:
  app: web
```

**Lesson:** when traffic isn't reaching pods, **always look at endpoints first.**
```bash
kubectl get endpoints <svc>
```
Empty endpoints = selector problem. Non-empty endpoints but failing = port or app problem.

---

## broken-2.yaml — wrong `targetPort`

**Symptom:**
```
$ kubectl get endpoints broken-two
NAME         ENDPOINTS                             AGE
broken-two   10.244.0.5:8080,10.244.0.6:8080,...   30s

$ curl http://broken-two
curl: (7) Failed to connect to broken-two port 80: Connection refused
```

**What's wrong:** the Service forwards to `targetPort: 8080` on the pod. But nginx listens on port **80**, not 8080. Verify:
```bash
kubectl exec -it <pod> -- netstat -tln
# or
kubectl exec -it <pod> -- ss -ltn
```

**Fix:**
```yaml
ports:
  - port: 80
    targetPort: 80         # match what nginx actually listens on
```

**Lesson:**
- `port` = port on the Service (what callers connect to)
- `targetPort` = port on the pod (what the container listens on)
- `containerPort` in the pod template is documentation — Kubernetes uses `targetPort` to route, regardless of `containerPort`. The two should match, but only `targetPort` is enforced.
- Endpoints showing the wrong port number is a strong hint the Service is misconfigured.
