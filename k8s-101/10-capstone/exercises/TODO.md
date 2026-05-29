# Exercises — Lesson 10 Capstone

The whole-stack app from the README should be running. If not, `make all` first.

These exercises put everything from the tutorial together. Lots of "break it and fix it" so the layers stay distinct in your head.

## Part A: scale, roll, observe

- [ ] **A1. Scale the API.**
  ```bash
  kubectl -n capstone scale deployment/api --replicas=5
  kubectl -n capstone get pods -l app=api
  ```

- [ ] **A2. Watch the load balancing.** Open the app in your browser; the UI polls `/api/time` every 3 seconds. The "Served by pod" field should rotate. With 5 replicas you should see 5 distinct names over a minute.

- [ ] **A3. Zero-downtime rollout.** In a terminal:
  ```bash
  while true; do curl -s -o /dev/null -w "%{http_code}\n" http://app.localtest.me/api/time; sleep 0.2; done
  ```
  In another terminal, force a rollout:
  ```bash
  kubectl -n capstone rollout restart deployment/api
  ```
  Watch the first terminal. With `replicas: 5` and `maxUnavailable: 0`, you should see only `200`s.

- [ ] **A4. Now drop to 1 replica and rerun A3.** Do you see a brief outage during restart? If yes — that's why multi-replica matters for zero downtime.

## Part B: failure recovery

- [ ] **B1. Kill an API pod.**
  ```bash
  kubectl -n capstone delete pod $(kubectl -n capstone get pod -l app=api -o jsonpath='{.items[0].metadata.name}')
  ```
  How long until a replacement is `Ready`?

- [ ] **B2. Kill the DB pod.**
  ```bash
  kubectl -n capstone delete pod db-0
  ```
  Watch the UI — you should see brief error messages, then recovery. Inspect API logs while it happens:
  ```bash
  make logs-api
  ```

- [ ] **B3. Crash the DB harder.** Delete the StatefulSet but NOT the PVC:
  ```bash
  kubectl -n capstone delete statefulset db
  kubectl -n capstone get pvc        # PVC is still there
  kubectl apply -f k8s/02-db.yaml    # bring it back
  ```
  When db-0 comes back, does the data survive? (Hint: yes. The PVC outlives the StatefulSet.)

- [ ] **B4. Now do something destructive.** Delete the PVC too:
  ```bash
  kubectl -n capstone delete statefulset db
  kubectl -n capstone delete pvc -l app=db
  kubectl apply -f k8s/02-db.yaml
  ```
  Fresh data. This is what you would do for a "factory reset."

## Part C: debug broken manifests

In `exercises/broken/`, you'll find three intentionally-broken variants of capstone manifests. Each represents a real failure mode for a real layer.

For each:
1. Apply it (overlay on top of the working capstone).
2. Use `kubectl describe` / `kubectl logs` / the UI / API curl to diagnose.
3. Fix the file.
4. Re-apply and confirm the app works end-to-end again.

- [ ] **C1. The DB tier.** `exercises/broken/broken-1-db.yaml` — apply it, then look at the API pod logs and the database pod. Why is the API suddenly broken?

  ```bash
  kubectl apply -f exercises/broken/broken-1-db.yaml
  make logs-api
  ```

- [ ] **C2. The API tier.** `exercises/broken/broken-2-api.yaml` — apply it. The deployment rolls forward but new pods never become Ready.

  ```bash
  kubectl apply -f exercises/broken/broken-2-api.yaml
  kubectl -n capstone get pods -l app=api
  kubectl -n capstone describe pod -l app=api | tail -30
  ```

- [ ] **C3. The Ingress tier.** `exercises/broken/broken-3-ingress.yaml` — apply it. Now hitting the app returns 404 or routes wrong.

  ```bash
  kubectl apply -f exercises/broken/broken-3-ingress.yaml
  curl -i http://app.localtest.me/
  curl -i http://app.localtest.me/api/time
  ```

After fixing each, restore the working version:
```bash
kubectl apply -f k8s/
```

## Part D: extend the app

These are open-ended. No solutions in `SOLUTION.md` — they're for sharpening the skills.

- [ ] **D1.** Add a counter table to Postgres. Make the `/api/time` endpoint also increment and return a request count. (Hint: `make psql` to open a SQL shell.)

- [ ] **D2.** Add a new endpoint `/api/version` that returns the git SHA. Build the SHA into the Docker image at build time using an `ARG`.

- [ ] **D3.** Add a HorizontalPodAutoscaler for the API. Use `kubectl top pod` to watch utilization. (You may need to install the metrics-server: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml` and patch it with `--kubelet-insecure-tls` for kind.)

- [ ] **D4.** Add a NetworkPolicy so only the api pods can talk to the db. Verify by trying to connect to db from the web pod and failing.

## Cleanup

```bash
make clean
# or full reset
kind delete cluster --name k8s-101
```

See [`SOLUTION.md`](SOLUTION.md) for answers to Part C.
