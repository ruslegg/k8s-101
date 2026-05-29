# Exercises — Lesson 05

## TODO

- [ ] **1. Apply Deployment + Service.**
  ```bash
  kubectl apply -f deployment.yaml
  kubectl apply -f service.yaml
  kubectl get svc,endpoints web
  ```

- [ ] **2. Verify load balancing.** From a tester pod, hit the service many times:
  ```bash
  kubectl run tester --rm -it --image=curlimages/curl --restart=Never -- sh -c \
    'for i in $(seq 1 10); do curl -s http://web | head -1; done'
  ```
  Then check pod access logs:
  ```bash
  kubectl logs -l app=web --tail=20
  ```
  Confirm requests are spread across pods.

- [ ] **3. Port-forward and curl from your laptop.**
  ```bash
  kubectl port-forward svc/web 8080:80
  # in another terminal:
  curl http://localhost:8080
  ```
  Press Ctrl-C to stop the port-forward.

- [ ] **4. Debug the broken services.**

  - `exercises/broken-1.yaml` — applies, but no traffic reaches anything. Look at endpoints.
  - `exercises/broken-2.yaml` — applies, endpoints look right, but `curl` returns "Connection refused". Why?

  Useful commands:
  ```bash
  kubectl get svc,endpoints
  kubectl describe svc <name>
  kubectl get pods --show-labels
  ```

- [ ] **5. Bonus: discover via DNS.** From a tester pod:
  ```bash
  nslookup web
  nslookup web.default.svc.cluster.local
  ```

- [ ] **6. Clean up.**
  ```bash
  kubectl delete -f deployment.yaml -f service.yaml
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
