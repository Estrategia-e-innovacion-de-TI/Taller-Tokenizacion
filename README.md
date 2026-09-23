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
- **Auth:** Privy (email, Pages) o billetera caliente. Plan B: rama `turnkey-fallback`
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

## GitHub Pages

Una sola URL. Push a `main` publica **Privy**. Si el email falla en el taller, republica Turnkey (misma URL, ~2 min):

1. GitHub → **Actions** → **Deploy Turnkey fallback to GitHub Pages** → **Run workflow**
2. O: `gh workflow run pages-turnkey.yml`

La rama `turnkey-fallback` es el sitio Turnkey que ya funciona. No la mezcles con `main`. El secret `VITE_PRIVY_APP_ID` tiene que existir antes del primer deploy Privy.

## Agenda sugerida

1. Contexto RWA (15–20 min) — ver `recursos/Enlaces_de_interes.md`
2. Demo guiada `/demo` — cuenta → faucet → comprar → depositar → claim
3. Conceptos `/conceptos` para Q&A (casos banca, AA, contratos)

Guion: [`docs/01-guion-demo.md`](docs/01-guion-demo.md) · Guía RWA: [`docs/05-guia-rwa.md`](docs/05-guia-rwa.md)
