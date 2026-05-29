# Capstone build/deploy automation.
#
# Targets you'll use:
#   make all      build + load + deploy + wait
#   make build    build web and api images
#   make load     load images into the kind cluster
#   make deploy   apply all manifests
#   make wait     block until everything is Ready
#   make status   show the current state of all resources
#   make logs-api tail the api logs
#   make logs-web tail the web logs
#   make logs-db  tail the db logs
#   make psql     open a psql shell in the db pod
#   make clean    delete the app (keeps the cluster)
#   make nuke     delete the whole kind cluster

CLUSTER  ?= k8s-101
NS       ?= capstone
WEB_IMG  ?= k8s-101/web:dev
API_IMG  ?= k8s-101/api:dev

.PHONY: all build build-web build-api load load-web load-api deploy wait status \
        logs-api logs-web logs-db psql clean nuke help

all: build load deploy wait status
	@echo ""
	@echo "✅ Capstone deployed."
	@echo "👉 Open http://app.localtest.me in your browser."

# ---------- build ----------
build: build-web build-api

build-web:
	@echo "🔨 Building web image..."
	docker build -t $(WEB_IMG) ./web

build-api:
	@echo "🔨 Building api image..."
	docker build -t $(API_IMG) ./api

# ---------- load into kind ----------
# kind clusters can't pull from your local Docker daemon by default —
# we have to explicitly load images into the cluster's node containers.
load: load-web load-api

load-web:
	@echo "📦 Loading web image into kind cluster '$(CLUSTER)'..."
	kind load docker-image $(WEB_IMG) --name $(CLUSTER)

load-api:
	@echo "📦 Loading api image into kind cluster '$(CLUSTER)'..."
	kind load docker-image $(API_IMG) --name $(CLUSTER)

# ---------- deploy ----------
deploy:
	@echo "🚀 Applying manifests..."
	kubectl apply -f k8s/

wait:
	@echo "⏳ Waiting for Postgres..."
	kubectl -n $(NS) rollout status statefulset/db --timeout=180s
	@echo "⏳ Waiting for api..."
	kubectl -n $(NS) rollout status deployment/api --timeout=120s
	@echo "⏳ Waiting for web..."
	kubectl -n $(NS) rollout status deployment/web --timeout=60s

status:
	@echo "📊 Current state:"
	@kubectl -n $(NS) get all,ingress,pvc,configmap,secret
	@echo ""
	@echo "🌐 Ingress:"
	@kubectl -n $(NS) get ingress -o wide

# ---------- logs / shells ----------
logs-api:
	kubectl -n $(NS) logs -l app=api -f --tail=100

logs-web:
	kubectl -n $(NS) logs -l app=web -f --tail=100

logs-db:
	kubectl -n $(NS) logs db-0 -f --tail=100

psql:
	kubectl -n $(NS) exec -it db-0 -- psql -U app -d app

# ---------- teardown ----------
clean:
	@echo "🧹 Deleting capstone resources..."
	kubectl delete namespace $(NS) --ignore-not-found
	@echo "Done. (Cluster still running. To wipe the cluster too: make nuke)"

nuke:
	@echo "💥 Deleting kind cluster '$(CLUSTER)'..."
	kind delete cluster --name $(CLUSTER)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
