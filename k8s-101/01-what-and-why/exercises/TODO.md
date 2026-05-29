# Exercises — Lesson 01

## TODO

- [ ] **1. Pick the right tool.** For each scenario, decide: **Kubernetes**, **plain Docker**, or **Neither**.

  1. A static marketing site, 50 visits a day.
  2. A backend API + Postgres + Redis + worker queue, ~10 microservices, needs zero-downtime deploys.
  3. A weekend hobby project: one Node.js server.
  4. A monolith you deploy to one VPS but want to package consistently.
  5. A team of 4 deploying ~30 internal tools, wants self-service deploys and unified observability.

- [ ] **2. Explain the control loop in your own words.** Write 2–3 sentences. If you can't, re-read the README.

- [ ] **3. Sketch the diagram from memory.** Draw containers vs VMs vs bare metal on paper. Don't peek.

- [ ] **4. Match the vocabulary.** Without looking at the table:
  - Which object is "the smallest deployable unit"?
  - Which object "keeps a desired number of copies running"?
  - Which object "gives pods a stable network endpoint"?

When done, check your answers in [`SOLUTION.md`](SOLUTION.md).
