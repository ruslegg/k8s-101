# Exercises — Lesson 06

## TODO

- [ ] **1. Wire up config and verify.**
  ```bash
  kubectl apply -f configmap.yaml -f secret.yaml -f deployment-with-config.yaml
  POD=$(kubectl get pod -l app=api -o jsonpath='{.items[0].metadata.name}')
  kubectl exec $POD -- env | grep -E 'LOG_LEVEL|DB_PASS'
  kubectl exec $POD -- cat /etc/app/app.conf
  ```

- [ ] **2. Prove the reload gotcha.**
  ```bash
  kubectl edit configmap app-config
  # change LOG_LEVEL to "warn", save
  kubectl exec $POD -- env | grep LOG_LEVEL
  # still says debug! why?

  kubectl exec $POD -- cat /etc/app/app.conf
  # the file ALSO won't change immediately — wait ~60s and re-check
  ```

- [ ] **3. Trigger a clean reload.**
  ```bash
  kubectl rollout restart deployment/api
  kubectl rollout status deployment/api
  POD=$(kubectl get pod -l app=api -o jsonpath='{.items[0].metadata.name}')
  kubectl exec $POD -- env | grep LOG_LEVEL
  # now says warn
  ```

- [ ] **4. Debug the broken setups.**

  - `exercises/broken-1.yaml` — pod won't start. Why? (`kubectl describe pod` is your friend)
  - `exercises/broken-2.yaml` — pod starts, but the value inside is wrong. Spot the bug by reading the file vs the env output.

- [ ] **5. Clean up.**
  ```bash
  kubectl delete -f configmap.yaml -f secret.yaml -f deployment-with-config.yaml
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
