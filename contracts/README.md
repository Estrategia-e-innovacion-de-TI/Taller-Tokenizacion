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
**Red:** ethereum-sepolia (chainId `11155111`) · actualizado: 2026-08-20 15:35 UTC

| Contrato | Address |
|----------|----------|
| COPW | `0x55815499F210C97187d242C63b6377D8F55b0553` |
| RENT | `0x51CB22C6A1A51D57c0f112C6100e7b7Ffe7F24ba` |
| YieldDistributor | `0x121fD2529dC422183d389BCbaD99C4FF60A4B46f` |
| PropertySale | `0x3900f8c6BaB4F1301A5feCaAdb5EB73D026aA526` |
| Treasury | `0x9A8D3f1D52a8018D4f01f04DB8845C8a58Cc6d4a` |

Para el frontend (`frontend/.env`):

```env
VITE_COPW_ADDRESS=0x55815499F210C97187d242C63b6377D8F55b0553
VITE_RENT_ADDRESS=0x51CB22C6A1A51D57c0f112C6100e7b7Ffe7F24ba
VITE_DISTRIBUTOR_ADDRESS=0x121fD2529dC422183d389BCbaD99C4FF60A4B46f
VITE_SALE_ADDRESS=0x3900f8c6BaB4F1301A5feCaAdb5EB73D026aA526
```
<!-- DEPLOYED_ADDRESSES_END -->

Archivos generados tras el deploy:

- [`deployments/latest.json`](deployments/latest.json)
- [`deployments/ethereum-sepolia.json`](deployments/ethereum-sepolia.json) (este deploy)
- [`deployments/ADDRESSES.md`](deployments/ADDRESSES.md)
