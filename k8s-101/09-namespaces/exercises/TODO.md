# Exercises — Lesson 09

## TODO

- [ ] **1. Create and inspect the dev namespace.**
  ```bash
  kubectl apply -f quota.yaml
  kubectl get ns
  kubectl describe ns dev
  kubectl get resourcequota -n dev
  ```

- [ ] **2. Try to deploy WITHOUT resource requests.** The deployment in `exercises/no-resources.yaml` doesn't declare resources. Apply it to `dev`:
  ```bash
  kubectl apply -f exercises/no-resources.yaml -n dev
  kubectl get pods -n dev
  ```
  Note: the *Deployment* applies, but the *pods* are rejected. Check:
  ```bash
  kubectl describe deployment greedy -n dev
  kubectl get rs -n dev
  kubectl describe rs -n dev
  # look at "ReplicaFailure" condition
  ```

- [ ] **3. Add a LimitRange and re-try.**
  ```bash
  kubectl apply -f limitrange.yaml
  kubectl rollout restart deployment/greedy -n dev
  kubectl get pods -n dev
  ```
  Now pods get the default resources from the LimitRange.

- [ ] **4. Try to exceed the quota.** Edit `exercises/no-resources.yaml`, set `replicas: 25`, and apply. What happens?

- [ ] **5. Health probes.**
  ```bash
  kubectl apply -f deployment-with-probes.yaml
  kubectl get pods -l app=probed
  kubectl describe pod -l app=probed | grep -A3 'Probe'
  ```

- [ ] **6. Break a probe.** Look at `exercises/broken-probe.yaml`. Apply it. Pods will keep restarting. Diagnose why and fix.

- [ ] **7. Clean up.**
  ```bash
  kubectl delete -f deployment-with-probes.yaml --ignore-not-found
  kubectl delete -f exercises/ -n dev --ignore-not-found
  kubectl delete -f exercises/ --ignore-not-found
  kubectl delete -f quota.yaml --ignore-not-found
  kubectl delete -f limitrange.yaml --ignore-not-found
  kubectl config set-context --current --namespace=default
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
