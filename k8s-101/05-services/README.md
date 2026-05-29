# Lesson 05 — Services

> Pods come and go and change IPs. Services give them a stable address — and a way to talk to each other.

## The problem

Your Deployment runs 3 nginx pods. Each pod has its own IP. Pods die and get replaced — new pods get new IPs. **How does anything reliably reach your app?**

The answer: a **Service**. It's a stable virtual IP + DNS name that load-balances across all pods matching a label selector.

```
                ┌─────────────────────┐
                │  Service: web       │            ┌───────────┐
   client ─────▶│  ClusterIP + DNS    │──────────▶│ Pod app=web│
   http://web   │  selector: app=web  │    ┌─────▶│ Pod app=web│
                │                     │────┘ ┌───▶│ Pod app=web│
                └─────────────────────┘      │    └───────────┘
                                             │
                              round-robin────┘
```

The Service is a **label-driven load balancer with a stable name.**

## Service types

| Type           | Where reachable                       | Use for                              |
| -------------- | ------------------------------------- | ------------------------------------ |
| `ClusterIP`    | Inside cluster only (default)         | Internal service-to-service traffic  |
| `NodePort`     | On every node's IP at a high port     | Quick external access, dev/test      |
| `LoadBalancer` | External IP from cloud LB             | Production external traffic          |
| `ExternalName` | DNS alias to external host            | Aliasing external services           |

For most internal traffic, you want `ClusterIP`. For real external traffic in prod, you almost always end up using **Ingress** (Lesson 8) rather than per-Service LoadBalancers.

## Create a ClusterIP service

Read [`service.yaml`](service.yaml):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web              # matches pods from our Deployment
  ports:
    - port: 80            # the Service's port
      targetPort: 80      # the container's port
```

This requires the `web` Deployment from Lesson 04 to be running (or any Deployment whose pods have `app: web`). The included [`deployment.yaml`](deployment.yaml) is a copy of the one from Lesson 04 for convenience.

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

kubectl get svc
# NAME   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
# web    ClusterIP   10.96.142.18    <none>        80/TCP    5s

kubectl get endpoints web
# NAME   ENDPOINTS                             AGE
# web    10.244.0.5:80,10.244.0.6:80,...       5s
```

The **endpoints** are the actual pod IPs the Service routes to. If endpoints are empty, your selector doesn't match any pods.

## Test it from inside the cluster

```bash
kubectl run tester --rm -it --image=curlimages/curl --restart=Never -- sh
# inside the pod:
curl http://web
# <html>...Welcome to nginx!...</html>
```

## DNS inside the cluster

Every Service is automatically registered in cluster DNS. From any pod, you can reach it three ways:

| Name                              | When to use                                     |
| --------------------------------- | ----------------------------------------------- |
| `web`                             | Same namespace                                  |
| `web.default`                     | Any namespace, short form                       |
| `web.default.svc.cluster.local`   | Fully qualified                                 |

## Reaching the service from your laptop

ClusterIPs are unreachable from outside. For local development, port-forward:

```bash
kubectl port-forward svc/web 8080:80
# now visit http://localhost:8080 in your browser
```

`port-forward` is your best friend during development. For production-style external access you use **Ingress** (Lesson 8).

## Exercise

See [`exercises/TODO.md`](exercises/TODO.md).

## Next

➡️  [Lesson 06 — Config & Secrets](../06-config/README.md)
