# ═══════════════════════════════════════════════════════════════════════════════
#  Curve Comfort – Docker Makefile
#
#  Usage:  make <target>
#  List:   make help
# ═══════════════════════════════════════════════════════════════════════════════

DEV_FILE  := docker-compose.dev.yml
PROD_FILE := docker-compose.prod.yml

# ── Development ────────────────────────────────────────────────────────────────

.PHONY: dev
dev:
	docker compose -f $(DEV_FILE) up --build -d

.PHONY: dev-up
dev-up:
	docker compose -f docker-compose.dev.yml up -d

.PHONY: dev-down
dev-down:
	docker compose -f $(DEV_FILE) down

.PHONY: dev-down-v
dev-down-v:
	docker compose -f $(DEV_FILE) down -v

.PHONY: dev-build
dev-build:
	docker compose -f $(DEV_FILE) build

.PHONY: dev-logs
dev-logs:
	docker compose -f $(DEV_FILE) logs -f

.PHONY: dev-ps
dev-ps:
	docker compose -f $(DEV_FILE) ps

.PHONY: dev-seed-landing
dev-seed-landing:
	docker compose -f $(DEV_FILE) exec backend node seed.js

# ── Production ─────────────────────────────────────────────────────────────────

.PHONY: prod
prod:
	docker compose -f $(PROD_FILE) up --build -d

.PHONY: prod-up
prod-up:
	docker compose -f $(PROD_FILE) up -d

.PHONY: prod-down
prod-down:
	docker compose -f $(PROD_FILE) down

.PHONY: prod-build
prod-build:
	docker compose -f $(PROD_FILE) build

.PHONY: prod-logs
prod-logs:
	docker compose -f $(PROD_FILE) logs -f

.PHONY: prod-ps
prod-ps:
	docker compose -f $(PROD_FILE) ps

# ── Individual image builds ────────────────────────────────────────────────────
.PHONY: build-backend-dev
build-backend-dev:
	docker build --target development -t curve_comfort-backend:dev ./backend

.PHONY: build-backend-prod
build-backend-prod:
	docker build --target production -t curve_comfort-backend:prod ./backend

.PHONY: build-frontend-dev
build-frontend-dev:
	docker build --target development -t curve_comfort-frontend:dev ./frontend

.PHONY: build-frontend-prod
build-frontend-prod:
	docker build --target production -t curve_comfort-frontend:prod ./frontend

# ── Shell access ───────────────────────────────────────────────────────────────
.PHONY: shell-backend
shell-backend:
	docker exec -it curve_comfort-backend-dev sh

.PHONY: shell-frontend
shell-frontend:
	docker exec -it curve_comfort-frontend-dev sh

.PHONY: shell-mongo
shell-mongo:
	docker exec -it curve_comfort-mongo-dev mongosh -u admin -p secret --authenticationDatabase admin

# ── Cleanup ────────────────────────────────────────────────────────────────────
.PHONY: clean
clean:
	docker container prune -f
	docker image prune -f

.PHONY: clean-all
clean-all:
	docker system prune -af --volumes
