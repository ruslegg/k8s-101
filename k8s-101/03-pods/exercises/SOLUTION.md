# Solutions — Lesson 03

## broken-1.yaml — structural YAML error

**Symptom:**
```
error: error validating "broken-1.yaml": error validating data:
  ValidationError(Pod.spec): invalid type for io.k8s.api.core.v1.PodSpec.containers:
  got "map", expected "array"
```

**What's wrong:** `containers` must be a **list**, but the file has it as a single map. Each container needs a `-` in front to make it a list item.

**Fix:**
```yaml
spec:
  containers:
    - name: web              # ← the leading "- " is the fix
      image: nginx:alpine
      ports:
        - containerPort: 80
```

**Lesson:** YAML is whitespace-sensitive. `containers` is plural for a reason — even a single-container pod uses list syntax. The API server validates types before the pod is ever scheduled. This is your friend.

---

## broken-2.yaml — `ImagePullBackOff`

**Symptom:**
```
$ kubectl get pods
NAME         READY   STATUS             RESTARTS   AGE
broken-two   0/1     ImagePullBackOff   0          30s
```

`kubectl describe pod broken-two` Events section:
```
Failed to pull image "nginx:alpne": rpc error: ... manifest unknown
```

**What's wrong:** `image: nginx:alpne` is a typo — should be `nginx:alpine`.

**Fix:**
```yaml
image: nginx:alpine
```

**Lesson:** K8s can't pull what doesn't exist. `ImagePullBackOff` always means *the image name or tag is wrong* OR *the registry needs auth you didn't provide*. The `describe` Events section will tell you which.

---

## broken-3.yaml — `CrashLoopBackOff`

**Symptom:**
```
$ kubectl get pods
NAME            READY   STATUS             RESTARTS   AGE
broken-three    0/1     CrashLoopBackOff   3          1m
```

`kubectl logs broken-three`:
```
starting
```

`kubectl describe pod broken-three` (relevant slice):
```
State:          Waiting
  Reason:       CrashLoopBackOff
Last State:     Terminated
  Reason:       Error
  Exit Code:    1
```

**What's wrong:** The `command:` is `["sh", "-c", "echo starting; exit 1"]`. The container runs `echo`, then `exit 1`, and the process is done. Kubernetes restarts it. It exits again. Backoff begins.

**Fix:** remove the `command:` line so nginx uses its image default:

```yaml
spec:
  containers:
    - name: web
      image: nginx:alpine
      ports:
        - containerPort: 80
```

**Lesson:**
- A container = a process. When the main process exits, the container exits. When the container exits, the pod restarts (if `restartPolicy: Always`, the default).
- Don't override `command:` unless you really need to. The image author usually got it right.
- `kubectl logs --previous` is essential for crashed containers.

---

## Working `my-shell.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shell
spec:
  containers:
    - name: box
      image: busybox:latest
      command: ["sleep", "3600"]
```

The `sleep 3600` keeps the container alive for an hour so you can exec into it. A common trick for "give me a shell in the cluster".
