# Exercises — Lesson 07

## TODO

- [ ] **1. Provision storage.**
  ```bash
  kubectl apply -f pvc.yaml -f writer.yaml
  kubectl get pvc,pv
  ```
  Notice: even though you only defined a PVC, a PV was created automatically by the cluster's default StorageClass.

- [ ] **2. Verify writes.**
  ```bash
  sleep 30
  kubectl exec deploy/writer -- wc -l /data/log.txt
  ```
  Note the line count.

- [ ] **3. Kill the pod, prove the data survives.**
  ```bash
  kubectl delete pod -l app=writer
  # wait a few seconds for the replacement
  kubectl get pods -l app=writer
  kubectl exec deploy/writer -- wc -l /data/log.txt
  # line count should be HIGHER than step 2 — same disk, kept growing
  ```

- [ ] **4. Delete the Deployment but not the PVC. Recreate. Data should survive.**
  ```bash
  kubectl delete -f writer.yaml
  kubectl get pvc
  # PVC still there, still Bound
  kubectl apply -f writer.yaml
  kubectl exec deploy/writer -- wc -l /data/log.txt
  # still growing on the same data
  ```

- [ ] **5. Now delete the PVC too. Data is gone.**
  ```bash
  kubectl delete -f writer.yaml -f pvc.yaml
  kubectl apply -f pvc.yaml -f writer.yaml
  sleep 10
  kubectl exec deploy/writer -- wc -l /data/log.txt
  # back to a small number — fresh disk
  ```

- [ ] **6. Debug the broken setups.**

  - `exercises/broken-1.yaml` — the pod is stuck in `Pending`. Look at the PVC.
  - `exercises/broken-2.yaml` — applies, but the volume isn't where the app expects it.

- [ ] **7. Clean up.**
  ```bash
  kubectl delete -f writer.yaml -f pvc.yaml --ignore-not-found
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
