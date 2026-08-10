# Taller Tokenización · RENT

Demo educativa de **tokenización de un inmueble** orientada a ejecutivos de banca en Colombia (con apoyo técnico).

> Demo en testnet. **No** es oferta pública ni producto autorizado por la SFC.

## Caso

| Parámetro | Valor |
|-----------|--------|
| Token | **RENT** |
| Valor del inmueble | 5.000.000.000 COP |
| Ticket mínimo | 100.000 COP = 1 RENT |
| Supply | 50.000 |
| Dinero de demo | **COPW** (faucet 5.000.000 COP) |
| Rentas | Proporcionales al RENT |

## Stack

- **Contratos:** Foundry (`contracts/`) — COPW, RENT, PropertySale, YieldDistributor
- **Frontend:** Vite + React + TypeScript + Tailwind (`frontend/`) → GitHub Pages
- **Auth:** Turnkey (email, Auth Proxy) o billetera caliente
- **AA / gas:** permissionless (Kernel) + Pimlico — el usuario solo firma

## Estructura

```
contracts/     Foundry
frontend/      SPA (Demo / Conceptos)
docs/          Guion y conceptos
recursos/      Enlaces RWA (global + Colombia)
```

## Contratos

```bash
cd contracts
make env              # crea .env (SEPOLIA_RPC_URL, ETHERSCAN_API_KEY, TREASURY opcional)
# edita .env
make install
make test
make deploy           # pide PK; despliega + verifica en Etherscan (requiere ETHERSCAN_API_KEY)
```

Tras el deploy, las addresses quedan en [`contracts/README.md`](contracts/README.md) y `contracts/deployments/`. Cópialas al `frontend/.env`.

## Frontend

```bash
cd frontend
make env              # crea .env desde .env.example
make install
make check-env
make dev
# make build && make preview
```

Atajos desde la raíz: `make help`.

## Agenda sugerida

1. Contexto RWA (15–20 min) — ver `recursos/Enlaces_de_interes.md`
2. Demo guiada `/demo` — cuenta → faucet → comprar → depositar → claim
3. Conceptos `/conceptos` para Q&A (casos banca, AA, contratos)

Guion: [`docs/01-guion-demo.md`](docs/01-guion-demo.md) · Guía RWA: [`docs/05-guia-rwa.md`](docs/05-guia-rwa.md)
