# Solutions — Lesson 08

## broken-1.yaml — no `ingressClassName`

**Symptom:**
```
$ kubectl get ingress broken-one
NAME         CLASS    HOSTS                       ADDRESS   PORTS   AGE
broken-one   <none>   broken-one.localtest.me               80      30s
```

The `ADDRESS` is empty. `curl` returns the default nginx 404 (or whatever's at the root).

**What's wrong:** `ingressClassName` is missing. Modern clusters can have multiple ingress controllers (nginx, traefik, AWS ALB...). Each only handles Ingresses that name its class. Without the field, no controller picks it up.

**Fix:**
```yaml
spec:
  ingressClassName: nginx
```

**Lesson:**
- An Ingress with no class is invisible to controllers.
- You can also set a default class on a cluster (`kubectl get ingressclass`), but explicit is better. Always set `ingressClassName`.
- `kubectl get ingress` showing `<none>` under `CLASS` is the first thing to check when an Ingress mysteriously doesn't route.

---

## broken-2.yaml — bad service reference

**Symptom:**
```
$ curl http://broken-two.localtest.me/
<html>...503 Service Temporarily Unavailable...</html>
```

`kubectl describe ingress broken-two` shows the rules, but nginx can't find an endpoint to send traffic to.

**What's wrong:** the backend references service `webb` on port `8080`. Two issues:
1. The service is named `web`, not `webb` (typo)
2. The service's port is `80`, not `8080`

`kubectl get svc` confirms what's actually there.

**Fix:**
```yaml
backend:
  service:
    name: web
    port: { number: 80 }
```

**Lesson:**
- **404 from the cluster's default backend** usually means *the Ingress didn't match any rule.* (Wrong host? Wrong path? Wrong class?)
- **503** usually means *the Ingress matched, but the backend Service has no available endpoints.* (Wrong service name? Wrong port? No pods running?)
- For deeper debugging, check controller logs:
  ```bash
  kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=100
  ```
