# Frontend — Vite / React
# Uso: make help

.DEFAULT_GOAL := help

NPM_FLAGS ?= --legacy-peer-deps
PORT      ?= 5173

.PHONY: help install install-ci dev build preview lint typecheck clean \
	env check-env serve

help: ## Muestra esta ayuda
	@echo "Frontend (Vite + React)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Variables opcionales:"
	@echo "  PORT=5173     Puerto de vite / preview"
	@echo "  NPM_FLAGS     Flags de npm (default: --legacy-peer-deps)"

install: ## Instala dependencias npm
	npm install $(NPM_FLAGS)

install-ci: ## Install reproducible (CI / Pages)
	npm ci $(NPM_FLAGS)

env: ## Crea .env desde .env.example si no existe
	@if [ -f .env ]; then \
		echo ".env ya existe"; \
	else \
		cp .env.example .env; \
		echo "Creado .env — completa las VITE_* (addresses, Pimlico, Turnkey)"; \
	fi

check-env: ## Avisa si faltan addresses en .env
	@if [ ! -f .env ]; then echo "Falta .env — corre: make env"; exit 1; fi
	@missing=0; \
	for key in VITE_COPW_ADDRESS VITE_RENT_ADDRESS VITE_SALE_ADDRESS VITE_DISTRIBUTOR_ADDRESS; do \
		val=$$(grep -E "^$$key=" .env | cut -d= -f2-); \
		if [ -z "$$val" ]; then echo "  vacío: $$key"; missing=1; fi; \
	done; \
	if [ "$$missing" = "1" ]; then \
		echo "Completa las addresses tras el deploy Foundry."; \
	else \
		echo "Addresses presentes en .env"; \
	fi

dev: ## Servidor de desarrollo
	npm run dev -- --port $(PORT) --host

build: ## Build de producción (dist/)
	npm run build

preview: build ## Preview del build
	npm run preview -- --port $(PORT) --host

serve: preview ## Alias de preview

lint: ## Oxlint
	npm run lint

typecheck: ## Solo TypeScript (tsc)
	npx tsc -b --pretty false

clean: ## Limpia dist y caches
	rm -rf dist node_modules/.tmp *.tsbuildinfo
	@echo "Listo. Para borrar node_modules: rm -rf node_modules && make install"
