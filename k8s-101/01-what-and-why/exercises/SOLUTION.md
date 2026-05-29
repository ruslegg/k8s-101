# Solutions — Lesson 01

## 1. Pick the right tool

1. **Neither.** A static host (Netlify, S3+CloudFront, GitHub Pages) is faster and cheaper. Don't overbuild.
2. **Kubernetes.** Multiple services, scaling, rolling updates — this is the canonical use case.
3. **Neither** (or plain Docker locally). A PaaS like Fly / Railway / Render is faster to ship.
4. **Plain Docker.** Containerize for consistency, but no orchestrator needed for one box. Docker Compose for local dev is fine.
5. **Kubernetes** (or a managed PaaS that uses K8s under the hood). Self-service + many small workloads + observability is what K8s is built for.

## 2. Control loop, in words

A control loop continuously compares what you want (declared in YAML) to what's actually happening in the cluster, and takes action to make them match. If a pod dies, the loop notices the count is too low and starts a new one. You don't issue imperative commands — you change the desired state, and K8s figures out the diff.

## 3. Diagram check

The key distinction: **containers share the host OS kernel**; VMs each carry a full guest OS. That's why containers are smaller and start in milliseconds.

## 4. Vocabulary

- "smallest deployable unit" → **Pod**
- "keeps a desired number of copies running" → **Deployment** (technically the ReplicaSet that the Deployment manages, but Deployment is the answer in 99% of contexts)
- "gives pods a stable network endpoint" → **Service**
