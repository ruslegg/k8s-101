# Exercises — Lesson 03

## TODO

- [ ] **1. Apply the working pod.** From this lesson's folder:
  ```bash
  kubectl apply -f pod.yaml
  kubectl get pods
  ```
  Make sure `hello` reaches `Running`.

- [ ] **2. Shell into it.**
  ```bash
  kubectl exec -it hello -- sh
  ```
  Inside, run `curl localhost`. You should see the nginx welcome page HTML.

- [ ] **3. Debug the broken pods.** This is the important one.

  In `exercises/` you'll find three broken pod manifests:

  - `broken-1.yaml`
  - `broken-2.yaml`
  - `broken-3.yaml`

  For each one:

  1. Try to apply it: `kubectl apply -f exercises/broken-N.yaml`
  2. Some will fail at apply time. Some will apply but then fail at runtime. Use:
     ```bash
     kubectl get pods
     kubectl describe pod <name>
     kubectl logs <name>
     ```
     to figure out what's wrong.
  3. Edit the file to fix it.
  4. Re-apply and confirm the pod reaches `Running`.

  > **Hint workflow:** when stuck, look at the `Events:` section of `kubectl describe pod`. That's where K8s tells you what went wrong, in plain English.

- [ ] **4. Write a pod from scratch.** Create `my-shell.yaml` for a pod named `shell` running `busybox:latest` with the command `["sleep", "3600"]`. Apply it, exec in, and run `wget -qO- http://example.com | head`.

- [ ] **5. Clean up.**
  ```bash
  kubectl delete pod hello shell --ignore-not-found
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, check [`SOLUTION.md`](SOLUTION.md).
