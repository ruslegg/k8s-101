# Exercises — Lesson 02

## TODO

- [ ] **1. Verify the cluster.** Run each command and note what you see:
  ```bash
  kubectl get nodes -o wide
  kubectl get pods --all-namespaces
  kubectl get namespaces
  kubectl version
  ```

- [ ] **2. Read system pods.** Look at the pods in the `kube-system` namespace. Identify:
  - which one handles cluster DNS (hint: starts with "core")
  - which one handles network routing (hint: "proxy")
  - which one *is* the brain's memory (hint: starts with "etc")

- [ ] **3. Use `kubectl explain`.** Run:
  ```bash
  kubectl explain pod
  kubectl explain pod.spec
  kubectl explain pod.spec.containers
  ```
  Bookmark this — it's the most useful command you'll forget about.

- [ ] **4. Tear down and rebuild.** Run:
  ```bash
  kind delete cluster --name k8s-101
  kind create cluster --name k8s-101 --config cluster.yaml
  ```
  Confirm you can do this in under 2 minutes. You'll do it often.

## What "done" looks like

You can run `kubectl get nodes` and see at least one `Ready` node. You know that pods can live in different namespaces. You know `kubectl explain` exists.

When done, see [`SOLUTION.md`](SOLUTION.md).
