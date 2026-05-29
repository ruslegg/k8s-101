# Solutions — Lesson 06

## broken-1.yaml — `CreateContainerConfigError`

**Symptom:**
```
$ kubectl get pods -l app=broken-one
NAME                          READY   STATUS                       RESTARTS   AGE
broken-one-86f6...            0/1     CreateContainerConfigError   0          30s
```

`kubectl describe pod` Events:
```
Warning  Failed  ...  Error: configmap "missing-config" not found
```

**What's wrong:** the Deployment refers to a ConfigMap named `missing-config` that doesn't exist.

**Fix:** either change the reference to an existing ConfigMap, or create the missing one:

```bash
kubectl create configmap missing-config --from-literal=LOG_LEVEL=debug
```

Then the pod will start. Alternatively, mark the reference as `optional: true` and the env var will simply be empty when the source is missing.

**Lesson:**
- `CreateContainerConfigError` ≈ "I can't build the env you asked for." Always a ConfigMap / Secret reference issue.
- K8s is great at telling you *which* dependency is missing. Read the Events.

---

## broken-2.yaml — wrong key (silenced by `optional: true`)

**Symptom:** pod runs, but the log output reads `LOG_LEVEL=` (empty).

**What's wrong:** the ConfigMap has key `LOG_LEVEL` (uppercase), but the reference asks for `log_level` (lowercase). Because `optional: true` was set, Kubernetes silently sets the env var to empty instead of failing.

**Fix:**
```yaml
key: LOG_LEVEL    # match the actual key
```

Or drop `optional: true` while developing so you'd catch the typo with a `CreateContainerConfigError`.

**Lesson:**
- Keys in ConfigMaps/Secrets are case-sensitive.
- `optional: true` is occasionally useful (e.g. for features that may not be configured yet), but it hides bugs. Default to omitting it.
- "Empty env var" bugs are notoriously hard to spot in logs — favor failing loud.
