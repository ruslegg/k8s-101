# Solutions — Lesson 07

## broken-1.yaml — missing StorageClass

**Symptom:**
```
$ kubectl get pvc broken-pvc
NAME         STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
broken-pvc   Pending                                      fast-ssd       30s

$ kubectl get pods -l app=broken-one
NAME                          READY   STATUS    RESTARTS   AGE
broken-one-xxx                0/1     Pending   0          30s
```

`kubectl describe pvc broken-pvc`:
```
Events:
  Warning  ProvisioningFailed  ...  storageclass.storage.k8s.io "fast-ssd" not found
```

**What's wrong:** The PVC specifies `storageClassName: fast-ssd`, but kind only ships with a StorageClass called `standard`. Verify:
```bash
kubectl get storageclass
```

**Fix:** either remove the line (use the default), or set it to a class that exists:

```yaml
# option A: drop the line entirely → uses default
spec:
  accessModes: [ReadWriteOnce]
  resources: { requests: { storage: 1Gi } }

# option B: specify an existing class
spec:
  storageClassName: standard
```

**Lesson:**
- A `Pending` PVC blocks any pod that mounts it. The pod will also be Pending, with an Events message like *"pod has unbound immediate PersistentVolumeClaims"*.
- Always check `kubectl get storageclass` to know what your cluster offers.
- In production, you'll have multiple StorageClasses (e.g. `gp3`, `io2`, `fast-ssd`, `standard`). Naming is per-cluster — never assume.

---

## broken-2.yaml — `mountPath` ≠ where the app writes

**Symptom:** PVC binds, pod runs, no errors. But the file the app writes (`/data/log.txt`) disappears every time the pod restarts.

**What's wrong:** The volume is mounted at `/var/storage`, but the app writes to `/data/log.txt`. The directory `/data` exists inside the container's writable layer — which is ephemeral. So writes go to a temporary location that vanishes with the container.

**Fix:** make the `mountPath` match where the app actually writes:

```yaml
volumeMounts:
  - name: store
    mountPath: /data        # match the app's write path
```

**Lesson:**
- A volume mount only persists data written *inside that mount path*. Anything else lives on the container's ephemeral overlay filesystem.
- When debugging "where did my data go", `kubectl exec ... -- find / -name <filename>` is a quick way to locate things.
- For real apps you don't control: read the docs for "data directory" or check the Dockerfile for `VOLUME` declarations.
