# Contratos del taller — RENT / COPW

Foundry · Ethereum Sepolia.

## Contratos

| Contrato | Rol |
|----------|-----|
| `COPW` | Pesos de demo + faucet (5.000.000 COP) |
| `RENT` | Participación del inmueble (max 50.000) |
| `PropertySale` | Compra primaria (100.000 COP / RENT) |
| `YieldDistributor` | Rentas proporcionales |

## Comandos

```bash
make env          # .env con RPC y Etherscan
make install
make test
make deploy           # pide PK; broadcast + verify Etherscan; actualiza README
make addresses        # re-sincroniza este README desde deployments/
```

Taller nuevo (saldos RENT/yield en cero, COPW intacto):

```bash
COPW_ADDRESS=0x55815499F210C97187d242C63b6377D8F55b0553 make deploy
```

Luego copia las nuevas addresses a `frontend/.env` (`VITE_RENT_ADDRESS`, `VITE_SALE_ADDRESS`, `VITE_DISTRIBUTOR_ADDRESS`). `VITE_COPW_ADDRESS` no cambia.

## Direcciones desplegadas

<!-- DEPLOYED_ADDRESSES_START -->
**Red:** ethereum-sepolia (chainId `11155111`) · actualizado: 2026-10-09 19:44 UTC

| Contrato | Address |
|----------|----------|
| COPW | `0x55815499F210C97187d242C63b6377D8F55b0553` |
| RENT | `0xf6ba61f597053FDd786221A9a1E6E9B5bBE4De36` |
| YieldDistributor | `0xEF297eA7373dedBd64E1bb602459E2E45393BEb5` |
| PropertySale | `0xd15d69963F292343964602B8Ace27058e57d6b6B` |
| Treasury | `0x9A8D3f1D52a8018D4f01f04DB8845C8a58Cc6d4a` |

Para el frontend (`frontend/.env`):

```env
VITE_COPW_ADDRESS=0x55815499F210C97187d242C63b6377D8F55b0553
VITE_RENT_ADDRESS=0xf6ba61f597053FDd786221A9a1E6E9B5bBE4De36
VITE_DISTRIBUTOR_ADDRESS=0xEF297eA7373dedBd64E1bb602459E2E45393BEb5
VITE_SALE_ADDRESS=0xd15d69963F292343964602B8Ace27058e57d6b6B
```
<!-- DEPLOYED_ADDRESSES_END -->

Archivos generados tras el deploy:

- [`deployments/latest.json`](deployments/latest.json)
- [`deployments/ethereum-sepolia.json`](deployments/ethereum-sepolia.json) (este deploy)
- [`deployments/ADDRESSES.md`](deployments/ADDRESSES.md)
