# Taller Tokenización — atajos raíz
.DEFAULT_GOAL := help

.PHONY: help contracts-install contracts-test contracts-deploy \
	frontend-install frontend-dev frontend-build

help: ## Ayuda
	@echo "Taller Tokenización"
	@echo ""
	@echo "  make contracts-install   Dependencias Foundry"
	@echo "  make contracts-test      Tests de contratos"
	@echo "  make contracts-deploy    Deploy (pide PK interactiva)"
	@echo "  make frontend-install    npm install"
	@echo "  make frontend-dev        Vite dev server"
	@echo "  make frontend-build      Build SPA"
	@echo ""
	@echo "Detalle: cd contracts && make help | cd frontend && make help"

contracts-install:
	$(MAKE) -C contracts install

contracts-test:
	$(MAKE) -C contracts test

contracts-deploy:
	$(MAKE) -C contracts deploy

frontend-install:
	$(MAKE) -C frontend install

frontend-dev:
	$(MAKE) -C frontend env dev

frontend-build:
	$(MAKE) -C frontend build
