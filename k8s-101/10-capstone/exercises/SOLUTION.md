# Solutions — Lesson 10 Capstone (Part C)

These cover the three broken manifests in `exercises/broken/`.

---

## broken-1-db.yaml — Secret rotation gotcha

**Symptom:** after applying, the DB pod restarts (the Secret change propagates), but the API logs fill with:
```
DB error: password authentication failed for user "app"
```

**What's happening:**

The Secret has new credentials. The API picks them up (via env from secretRef + a pod restart). But the **Postgres data directory was initialized the first time `db-0` started**, using the *original* password. Postgres ignores `POSTGRES_PASSWORD` after the first init — the password is stored *inside* the data directory. So now:

- API thinks the password is `differentpassword`
- Postgres thinks the password is `supersecret` (baked into the PVC)
- Auth fails

**Two valid fixes:**

**Option A: revert the Secret to the original.**
```bash
kubectl apply -f k8s/01-db-secret.yaml
kubectl -n capstone rollout restart deployment/api
```

**Option B: actually rotate the DB password.**
Apply the new Secret, then change the Postgres password manually:
```bash
make psql
# in psql:
\password app
# enter "differentpassword" twice
\q
kubectl -n capstone rollout restart deployment/api
```

**Option C (destructive): factory reset the DB.**
```bash
kubectl -n capstone delete statefulset db
kubectl -n capstone delete pvc -l app=db
kubectl apply -f k8s/02-db.yaml
```

**Lesson:**
- "Just rotate the secret" is not enough when the secret was used to *bootstrap* state. You also need to migrate the state.
- This is a really common production trap — applies to DB passwords, encryption keys, anything baked into persistent storage.
- Tools like External Secrets + an init pattern that runs `ALTER USER ... PASSWORD` on rotation are how mature teams handle this.

---

## broken-2-api.yaml — wrong probe port + wrong DB host

**Symptom:**
```
$ kubectl -n capstone get pods -l app=api
NAME              READY   STATUS    RESTARTS   AGE
api-old-xxx       1/1     Running   0          1h     ← from working RS
api-old-yyy       1/1     Running   0          1h
api-new-aaa       0/1     Running   3          2m     ← new RS, not Ready
api-new-bbb       0/1     Running   3          2m
```

The rollout is stuck — old pods stay because new ones never become Ready.

**Two bugs:**

**Bug 1: probe port.** The probes target port `3000`, but the API listens on `8080`. `kubectl describe pod` shows:
```
Warning  Unhealthy  ... Readiness probe failed: dial tcp ...:3000: connect: connection refused
```

**Fix:**
```yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

**Bug 2: wrong DB host.** Even after probes pass, the API can't reach Postgres because `PGHOST` is `database` but the Service is named `db`. Logs:
```
DB error: getaddrinfo ENOTFOUND database
```

**Fix:**
```yaml
- name: PGHOST
  value: "db"
```

**Lesson:**
- A failed readiness probe stops a rollout in its tracks — that's the safety net working as designed. The old pods don't get torn down until new ones are ready.
- Healthz endpoints intentionally don't check the DB. That's why probe failures here are about the *pod's own listening port*, not connectivity to dependencies.
- Two unrelated bugs in one file is realistic. Real outages are usually multi-cause.

---

## broken-3-ingress.yaml — missing ingressClass + bad pathType

**Symptom:**
```
$ curl -i http://app.localtest.me/
HTTP/1.1 404 Not Found
```

`kubectl get ingress -n capstone` shows the `CLASS` column as `<none>`.

**Bug 1: missing `ingressClassName`.** Without it, no controller picks up the Ingress. Routing reverts to whatever default the controller has — usually 404.

**Fix:**
```yaml
spec:
  ingressClassName: nginx
```

**Bug 2: `pathType: Exact` on `/api`.** With `Exact`, the rule only matches the literal string `/api`. It does NOT match `/api/time`, `/api/`, etc. So even after fixing bug 1, `/api/time` falls through to the `/` rule and hits the web service (which 404s on the SPA's `try_files` fallback).

**Fix:**
```yaml
- path: /api
  pathType: Prefix    # was Exact
```

**Lesson:**
- Always set `ingressClassName`. The `<none>` class is a footgun.
- `Exact` rarely does what you want for URL routing. `Prefix` is the default-good choice.
- When something doesn't route, work from the outside in: `curl -v` to see headers, `kubectl get ingress`, `kubectl describe ingress`, controller logs.

---

## After all fixes

To restore the canonical working manifests:
```bash
kubectl apply -f k8s/
```
