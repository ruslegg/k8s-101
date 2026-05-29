# Lesson 07 — Storage

> Pods are ephemeral. Data isn't. How to persist things in a world that loves to delete pods.

## The three layers

| Object                          | What it is                                                                  |
| ------------------------------- | --------------------------------------------------------------------------- |
| `Volume`                        | A directory mounted into a pod. Various backends.                            |
| `PersistentVolume` (PV)         | An actual chunk of storage the cluster knows about. Lifetime is independent of pods. |
| `PersistentVolumeClaim` (PVC)   | A pod's *request* for storage. Cluster matches it to a PV.                  |

```
   ┌────────┐  uses  ┌─────┐  binds  ┌────┐
   │  Pod   │───────▶│ PVC │────────▶│ PV │
   │ mounts │        │"1Gi"│         │disk│
   │ /data  │        └─────┘         └────┘
   └────────┘
```

In a real cloud, you almost never write PVs by hand. A **StorageClass** dynamically provisions them when a PVC is created (e.g., EBS volumes on AWS). kind ships with a default StorageClass, so you can use PVCs out of the box.

## Access modes

| Mode               | Meaning                                          |
| ------------------ | ------------------------------------------------ |
| `ReadWriteOnce` (RWO) | One node can mount it for read+write at a time |
| `ReadOnlyMany` (ROX)  | Many nodes can mount it read-only              |
| `ReadWriteMany` (RWX) | Many nodes can mount it read+write             |

`ReadWriteOnce` is what 95% of databases use. `ReadWriteMany` requires a backend that supports it (NFS, CephFS, EFS) — most cloud block storage does not.

## Example: persistent storage

Read [`pvc.yaml`](pvc.yaml) and [`writer.yaml`](writer.yaml).

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
  # storageClassName left blank → uses the cluster's default
```

```yaml
# writer.yaml — a Deployment that writes to /data every 5s
apiVersion: apps/v1
kind: Deployment
metadata:
  name: writer
spec:
  replicas: 1
  selector:
    matchLabels: { app: writer }
  template:
    metadata:
      labels: { app: writer }
    spec:
      containers:
        - name: app
          image: busybox
          command: ["sh", "-c", "while true; do date >> /data/log.txt; sleep 5; done"]
          volumeMounts:
            - name: store
              mountPath: /data
      volumes:
        - name: store
          persistentVolumeClaim:
            claimName: data
```

Apply and observe:

```bash
kubectl apply -f pvc.yaml -f writer.yaml
kubectl get pvc,pv
kubectl exec deploy/writer -- tail /data/log.txt

# now kill the pod
kubectl delete pod -l app=writer
kubectl exec deploy/writer -- tail /data/log.txt
# the new pod sees the old data. That's the point.
```

## StatefulSets — when pod identity matters

For databases and anything where pod identity matters (stable names, ordered startup, per-pod storage), use a **StatefulSet** instead of a Deployment. Key differences:

- Pods get **stable names** (`db-0`, `db-1`, `db-2`) rather than random hashes
- Pods get **stable DNS** when paired with a headless Service
- **`volumeClaimTemplates`** auto-creates a PVC per pod (each replica gets its own disk)
- Pods are created and deleted **in order**

We use a StatefulSet for Postgres in the capstone (Lesson 10).

## When NOT to run your database on Kubernetes

> 💡 Running databases *on* Kubernetes is harder than running them next to it. For a starting team, prefer managed databases (RDS, Cloud SQL, Neon) and let K8s handle your stateless workloads. The capstone runs Postgres in K8s purely for learning.

## Reclaim policies

What happens to the underlying storage when you delete a PVC?

- `Delete` (default for dynamically provisioned PVs) — the disk is destroyed
- `Retain` — the disk stays around for manual cleanup

For data you can't lose, use a StorageClass with `reclaimPolicy: Retain` or use snapshots.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 08 — Ingress](../08-ingress/README.md)
