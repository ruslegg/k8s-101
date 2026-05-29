# Solutions — Lesson 02

## 2. System pods

- DNS: `coredns-*`
- Network routing: `kube-proxy-*`
- Brain's memory: `etcd-k8s-101-control-plane`

You'll also see `kube-apiserver`, `kube-scheduler`, `kube-controller-manager`, and `kindnet-*` (the CNI plugin kind uses for pod networking).

**Important realization:** Kubernetes is itself built on Kubernetes. The control plane components run as pods, managed by the same scheduler they're a part of.

## 3. `kubectl explain`

This is built-in, offline reference documentation for every field of every Kubernetes object. Examples:

```bash
kubectl explain deployment.spec.strategy
kubectl explain service.spec.ports
kubectl explain pod.spec.containers.resources
```

Beats googling YAML field names. Returns exact type, required/optional, and short description.

## 4. Teardown / rebuild

If you can do this quickly, you're in great shape — you'll do it many times when experimenting. The cluster state lives in Docker containers, so `kind delete cluster` removes everything cleanly.

A useful habit: when something is *really* broken and you don't know why, delete the cluster and start fresh. It's a 90-second reset.
