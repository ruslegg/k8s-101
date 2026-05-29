# Lesson 06 — Config & Secrets

> Twelve-factor config: separate code from configuration. Kubernetes has two purpose-built objects for this.

## ConfigMap: non-sensitive config

A ConfigMap is a key-value store you mount into pods as environment variables or files.

Read [`configmap.yaml`](configmap.yaml):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: debug
  FEATURE_X: "true"
  app.conf: |
    server.port=8080
    cache.ttl=300
```

## Secret: sensitive config

Same idea, but base64-encoded and treated more carefully by the system.

> ⚠️ Out of the box, Secrets are **base64-encoded, not encrypted**. Anyone with cluster read access can decode them. In production, enable encryption at rest, use RBAC, and consider a real secrets manager (Vault, AWS Secrets Manager, External Secrets Operator).

Easiest way to create one:

```bash
kubectl create secret generic db-creds \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASS=s3cret

kubectl get secret db-creds -o yaml
# you'll see DB_USER: YWRtaW4= (base64 of "admin")
```

Or declarative — see [`secret.yaml`](secret.yaml) for an example using `stringData` (K8s base64-encodes for you).

## Consuming config in a Pod

Two patterns:

| Pattern        | Best for                                              |
| -------------- | ----------------------------------------------------- |
| Env vars       | Simple keys consumed at process start                 |
| File mounts    | Config files (nginx.conf, application.yaml) that apps re-read |

See [`deployment-with-config.yaml`](deployment-with-config.yaml) for both patterns in one file.

### Env vars from ConfigMap / Secret

```yaml
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: LOG_LEVEL
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: db-creds
        key: DB_PASS
```

### Whole ConfigMap as env vars

```yaml
envFrom:
  - configMapRef:
      name: app-config
  - secretRef:
      name: db-creds
```

### Mount as files

```yaml
volumeMounts:
  - name: conf
    mountPath: /etc/app
volumes:
  - name: conf
    configMap:
      name: app-config
```

Each key in the ConfigMap becomes a file at `/etc/app/<key>`.

## Apply and test

```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f deployment-with-config.yaml

POD=$(kubectl get pod -l app=api -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POD -- env | grep -E 'LOG_LEVEL|DB_'
kubectl exec $POD -- cat /etc/app/app.conf
```

## The reload gotcha

Changing a ConfigMap does **not** automatically restart pods. Env-var consumers won't notice. File mounts will eventually see updated content (within ~60s) but apps must re-read the file.

To force fresh pods that pick up new config:

```bash
kubectl rollout restart deployment/api
```

This is why many teams version their ConfigMaps (e.g. `app-config-v2`) and update the Deployment to reference the new name — making the rollout explicit and rollback trivial.

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 07 — Storage](../07-storage/README.md)
