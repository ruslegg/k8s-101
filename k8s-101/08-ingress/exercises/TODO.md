# Exercises — Lesson 08

## TODO

- [ ] **0. Prereq.** Confirm the ingress controller is running:
  ```bash
  kubectl get pods -n ingress-nginx
  ```
  If not, install per the README.

- [ ] **1. Deploy and test.**
  ```bash
  kubectl apply -f web-deployment.yaml -f api-deployment.yaml -f ingress.yaml
  kubectl get ingress
  curl http://app.localtest.me/
  curl http://app.localtest.me/api
  ```

- [ ] **2. Watch routing in action.**
  ```bash
  for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
    http://app.localtest.me/$([ $((i%2)) = 0 ] && echo "api" || echo ""); done
  ```

- [ ] **3. Add a third app.** Create a new Deployment + Service named `bye` (use `hashicorp/http-echo:1.0` with `-text=goodbye world`). Then add a new path to `ingress.yaml`:
  ```yaml
  - path: /bye
    pathType: Prefix
    backend:
      service:
        name: bye
        port: { number: 80 }
  ```
  Re-apply and `curl http://app.localtest.me/bye`.

- [ ] **4. Debug the broken ingresses.**

  - `exercises/broken-1.yaml` — applies but `curl` returns 404. Why?
  - `exercises/broken-2.yaml` — applies but `curl` returns 503. Why?

  Useful commands:
  ```bash
  kubectl describe ingress <name>
  kubectl get svc
  kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=50
  ```

- [ ] **5. Clean up.**
  ```bash
  kubectl delete -f web-deployment.yaml -f api-deployment.yaml -f ingress.yaml
  kubectl delete -f exercises/ --ignore-not-found
  ```

When done, see [`SOLUTION.md`](SOLUTION.md).
