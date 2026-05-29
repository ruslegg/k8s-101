# Exercises — Lesson 04

## TODO

- [ ] **1. Deploy and inspect.**
  ```bash
  kubectl apply -f deployment.yaml
  kubectl get deployment,rs,pods -l app=web
  ```
  Notice the ReplicaSet name (e.g. `web-6f8b9b59cf`). Notice each pod name starts with that same prefix. That's how the ReplicaSet "owns" them.

- [ ] **2. Self-heal.**
  ```bash
  POD=$(kubectl get pods -l app=web -o jsonpath='{.items[0].metadata.name}')
  kubectl delete pod $POD
  kubectl get pods -l app=web
  ```
  Watch a replacement appear. Time how long it takes (usually < 5s on kind).

- [ ] **3. Scale up.**
  ```bash
  kubectl scale deployment/web --replicas=5
  kubectl get pods -l app=web
  ```

- [ ] **4. Roll a new version.**
  Edit `deployment.yaml`, change `nginx:1.25-alpine` to `nginx:1.27-alpine`, then:
  ```bash
  kubectl apply -f deployment.yaml
  kubectl rollout status deployment/web
  kubectl rollout history deployment/web
  ```
  Pay attention: how many old pods are still up while new ones come in?

- [ ] **5. Roll back.**
  ```bash
  kubectl rollout undo deployment/web
  kubectl rollout status deployment/web
  ```

- [ ] **6. Debug the broken deployments.**

  - `exercises/broken-1.yaml` — applies but no pods come up. Why?
  - `exercises/broken-2.yaml` — applies, pods come up briefly, then it all goes wrong. Watch carefully.

  Diagnose with:
  ```bash
  kubectl describe deployment <name>
  kubectl get rs                   # are there ReplicaSets?
  kubectl get pods                 # are there pods?
  kubectl describe pod <name>
  ```

- [ ] **7. Clean up.**
  ```bash
  kubectl delete -f deployment.yaml
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
