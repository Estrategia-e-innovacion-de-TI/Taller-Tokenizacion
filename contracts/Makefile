# Contracts — Foundry
# Uso: make help | make env | make deploy

.DEFAULT_GOAL := help

# Carga contracts/.env si existe (RPC, Etherscan, TREASURY).
# La private key NO va en .env: se pide en make deploy.
ifneq (,$(wildcard .env))
include .env
export
endif

RPC_URL        ?= $(or $(SEPOLIA_RPC_URL),$(BASE_SEPOLIA_RPC_URL),https://rpc.sepolia.org)
SCRIPT         ?= script/Deploy.s.sol:Deploy
TREASURY       ?=
ETHERSCAN_KEY  ?= $(ETHERSCAN_API_KEY)

.PHONY: help env check-env install build test test-v test-gas clean fmt snapshot \
	anvil deploy deploy-dry sizes coverage addresses

help: ## Muestra esta ayuda
	@echo "Contratos (Foundry)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Configura en .env (make env):"
	@echo "  SEPOLIA_RPC_URL        RPC de Ethereum Sepolia"
	@echo "  ETHERSCAN_API_KEY      API key Etherscan (requerida en make deploy)"
	@echo "  TREASURY               (opcional) receptor del capital de venta"
	@echo "  COPW_ADDRESS           (opcional) reusa COPW; redeploy RENT/sale/yield"
	@echo ""
	@echo "make deploy = broadcast + verify en Etherscan (pide PK interactiva)."
	@echo "Taller nuevo: COPW_ADDRESS=<addr> make deploy  (mantiene saldos COPW)."
	@echo "Tras deploy, las addresses quedan en README.md y deployments/."

env: ## Crea .env desde .env.example si no existe
	@if [ -f .env ]; then \
		echo ".env ya existe"; \
	else \
		cp .env.example .env; \
		echo "Creado .env — completa SEPOLIA_RPC_URL y ETHERSCAN_API_KEY"; \
	fi

check-env: ## Verifica variables mínimas en .env
	@if [ ! -f .env ]; then echo "Falta .env — corre: make env"; exit 1; fi
	@ok=1; \
	if [ -z "$(SEPOLIA_RPC_URL)" ] && [ -z "$(BASE_SEPOLIA_RPC_URL)" ]; then echo "  vacío: SEPOLIA_RPC_URL"; ok=0; fi; \
	if [ -z "$(ETHERSCAN_API_KEY)" ]; then echo "  vacío: ETHERSCAN_API_KEY (necesario para make deploy)"; ok=0; fi; \
	if [ "$$ok" = "1" ]; then echo "RPC OK ($(RPC_URL)) · Etherscan OK"; fi

install: ## Instala dependencias (forge-std, OpenZeppelin)
	forge install

build: ## Compila contratos
	forge build

test: ## Corre tests
	forge test

test-v: ## Tests con logs (-vvv)
	forge test -vvv

test-gas: ## Tests con reporte de gas
	forge test --gas-report

snapshot: ## Snapshot de gas
	forge snapshot

fmt: ## Formatea Solidity
	forge fmt

clean: ## Limpia cache y artifacts
	forge clean
	rm -rf cache out broadcast

sizes: ## Tamaño de contratos
	forge build --sizes

coverage: ## Cobertura
	forge coverage

anvil: ## Nodo local Anvil
	anvil

# --- Deploy ---
# PK interactiva. RPC / Etherscan / TREASURY desde .env

deploy-dry: build check-env ## Simula deploy (sin broadcast)
	@echo ">>> Simulación de deploy en $(RPC_URL)"
	@if [ -n "$(TREASURY)" ]; then export TREASURY="$(TREASURY)"; fi; \
	 if [ -n "$(COPW_ADDRESS)" ]; then export COPW_ADDRESS="$(COPW_ADDRESS)"; fi; \
	 forge script $(SCRIPT) --rpc-url "$(RPC_URL)"

deploy: build check-env ## Deploy + verify en Etherscan; pide la PK de forma interactiva
	@echo ">>> Deploy + verify en $(RPC_URL)"
	@echo ">>> La private key NO se guarda; solo se usa en esta sesión."
	@if [ -n "$(TREASURY)" ]; then echo ">>> Treasury: $(TREASURY)"; else echo ">>> Treasury: deployer (msg.sender)"; fi
	@if [ -n "$(COPW_ADDRESS)" ]; then echo ">>> Reusa COPW: $(COPW_ADDRESS)"; else echo ">>> COPW: contrato nuevo"; fi
	@bash -c 'set -euo pipefail; \
		read -r -s -p "Private key: " DEPLOYER_PK; echo; \
		if [ -z "$$DEPLOYER_PK" ]; then echo "Error: PK vacía"; exit 1; fi; \
		case "$$DEPLOYER_PK" in 0x*|0X*) ;; *) DEPLOYER_PK="0x$$DEPLOYER_PK" ;; esac; \
		if [ -n "$(TREASURY)" ]; then export TREASURY="$(TREASURY)"; fi; \
		if [ -n "$(COPW_ADDRESS)" ]; then export COPW_ADDRESS="$(COPW_ADDRESS)"; fi; \
		forge script $(SCRIPT) \
			--rpc-url "$(RPC_URL)" \
			--broadcast \
			--verify \
			--etherscan-api-key "$(ETHERSCAN_KEY)" \
			--private-key "$$DEPLOYER_PK"; \
		unset DEPLOYER_PK'
	@$(MAKE) addresses

addresses: ## Actualiza README.md con addresses de deployments/
	@chmod +x scripts/update-readme-addresses.sh
	@./scripts/update-readme-addresses.sh
