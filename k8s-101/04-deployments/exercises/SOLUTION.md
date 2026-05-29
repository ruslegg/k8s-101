# Solutions — Lesson 04

## broken-1.yaml — selector ↔ template label mismatch

**Symptom:**
```
$ kubectl apply -f broken-1.yaml
The Deployment "broken-one" is invalid: spec.template.metadata.labels:
  Invalid value: map[string]string{"app":"brokenone"}: `selector` does not match template `labels`
```

**What's wrong:** `selector.matchLabels.app` is `broken-one` (with a hyphen), but `template.metadata.labels.app` is `brokenone` (no hyphen). The Deployment needs them to match — otherwise it can't tell which pods it owns.

**Fix:** change either side so they agree. Conventionally, fix the template:

```yaml
template:
  metadata:
    labels:
      app: broken-one    # match the selector
```

**Lesson:** the selector tells a controller "I own anything wearing this label." The template says "I produce pods wearing this label." If they disagree, the Deployment would create pods it doesn't even own — so the API server stops you before you make a mess.

---

## broken-2.yaml — `OOMKilled`

**Symptom:**
```
$ kubectl get pods -l app=broken-two
NAME                          READY   STATUS      RESTARTS   AGE
broken-two-7b8c89-2lqxv      0/1     OOMKilled   2          45s
broken-two-7b8c89-9p4tr      1/1     Running     1          45s
```

You might catch them in `Running` for a few seconds, then they get killed. `RESTARTS` keeps climbing.

`kubectl describe pod <name>` shows:
```
Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**What's wrong:** the memory limit is `4Mi`. Nginx alone needs more than that to start. The Linux kernel sees a process trying to use more than its cgroup allows, and kills it. K8s reports this as `OOMKilled`.

**Fix:** raise the limit. A reasonable starting point for nginx:

```yaml
resources:
  requests:
    cpu: 50m
    memory: 32Mi
  limits:
    cpu: 200m
    memory: 128Mi
```

**Lesson:**
- Exit code **137** = killed by SIGKILL = usually OOM.
- Memory limits are a hard cap. CPU limits cause throttling (slow); memory limits cause death.
- Set limits, but set them with measurement — not guesses. Tools like `kubectl top pod` (or Prometheus) tell you actual usage. Then add headroom.
