# Lesson 01 — What & Why

> Before you orchestrate, you should know what's being orchestrated — and why anyone bothered to invent this.

## The 60-second story

You have an app. It runs on your laptop. Now you need it to run on 10 servers, survive crashes, scale up on Black Friday, and roll out updates without downtime. Doing this by hand is misery. **Kubernetes is a robot that does it for you.**

More precisely: Kubernetes (K8s) is a system that takes a description of what you want — "run 3 copies of my API, expose it on port 80, restart if it crashes" — and makes reality match. It's a **declarative orchestrator** for containers.

## Containers vs VMs vs Bare Metal

```
BARE METAL          VIRTUAL MACHINES         CONTAINERS
┌──────────┐        ┌──────────┐             ┌──────────┐
│   App    │        │  App │ App│            │ App│App│App│
├──────────┤        │  OS  │ OS │            ├──────────┤
│    OS    │        │  Libs│Libs│            │ Host OS  │
├──────────┤        ├──────────┤             ├──────────┤
│ Hardware │        │ Hypervisor│            │ Hardware │
└──────────┘        ├──────────┤             └──────────┘
                    │ Hardware │
                    └──────────┘
```

A container is your app plus everything it needs to run, packaged together (the "image"). It boots in milliseconds and runs anywhere the runtime exists. Docker is the most famous tool for building containers; Kubernetes runs them at scale.

## What Kubernetes actually does

Kubernetes is a control loop:

1. You tell it the **desired state** (3 copies of my API, please)
2. It observes the **actual state**
3. If they differ, it acts to reconcile

```
  ┌────────────────┐       ┌──────────────┐       ┌────────────────┐
  │ Desired State  │──────▶│ Control Loop │──────▶│  Actual State  │
  │  (your YAML)   │       │  reconciler  │       │ (live cluster) │
  └────────────────┘       └──────────────┘       └────────────────┘
                                  ▲                       │
                                  └───────observe─────────┘
```

This pattern is everywhere in Kubernetes. Once you internalize it, the whole system makes sense.

## Key vocabulary (you'll meet all of these in the next lessons)

| Term         | What it is                                                           |
| ------------ | -------------------------------------------------------------------- |
| Cluster      | A set of machines (nodes) running Kubernetes                         |
| Node         | One machine (VM or physical) in the cluster                          |
| Pod          | The smallest deployable unit — one or more containers, scheduled together |
| Deployment   | A controller that keeps a desired number of pods running             |
| Service      | A stable network endpoint that load-balances across pods             |
| Namespace    | A virtual partition inside a cluster                                 |
| Manifest     | A YAML file describing what you want                                 |
| `kubectl`    | The CLI you use to talk to a cluster                                 |

## When you do NOT need Kubernetes

Kubernetes is a complexity multiplier. It pays off when you have *real* distributed-system needs. Don't reach for it because it's on a resume; reach for it because you have a problem it solves.

You probably don't need it when:

- Your app fits on one server and doesn't need to scale
- You don't run multiple services that need to talk to each other
- A managed platform (Vercel, Fly, Railway, App Runner) already handles this for you

You probably do need it when:

- You have multiple services with complex interdependencies
- You need zero-downtime rollouts and automated rollbacks
- You need to run the same stack reliably across dev / staging / prod
- Your traffic is spiky and you want autoscaling

## Exercise

Open [`exercises/TODO.md`](exercises/TODO.md) and work through the questions. There's no code to run yet — just decisions to make.

## Next

➡️  [Lesson 02 — Setup](../02-setup/README.md)
