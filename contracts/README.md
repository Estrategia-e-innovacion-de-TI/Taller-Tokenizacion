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

## Direcciones desplegadas

<!-- DEPLOYED_ADDRESSES_START -->
**Red:** ethereum-sepolia (chainId `11155111`) · actualizado: 2026-08-06 21:20 UTC

| Contrato | Address |
|----------|----------|
| COPW | `0x55815499F210C97187d242C63b6377D8F55b0553` |
| RENT | `0xd2AAB3ce00eCC5BA6cc954638c5cB7f27833E8Ef` |
| YieldDistributor | `0x5916d8e775Bb899656A59cBB65F0B8b937A1b353` |
| PropertySale | `0xcc3DB7e558F801a3048e305Fc6b762869FB93051` |
| Treasury | `0x9A8D3f1D52a8018D4f01f04DB8845C8a58Cc6d4a` |

Para el frontend (`frontend/.env`):

```env
VITE_COPW_ADDRESS=0x55815499F210C97187d242C63b6377D8F55b0553
VITE_RENT_ADDRESS=0xd2AAB3ce00eCC5BA6cc954638c5cB7f27833E8Ef
VITE_DISTRIBUTOR_ADDRESS=0x5916d8e775Bb899656A59cBB65F0B8b937A1b353
VITE_SALE_ADDRESS=0xcc3DB7e558F801a3048e305Fc6b762869FB93051
```
<!-- DEPLOYED_ADDRESSES_END -->

Archivos generados tras el deploy:

- [`deployments/latest.json`](deployments/latest.json)
- [`deployments/ethereum-sepolia.json`](deployments/ethereum-sepolia.json) (este deploy)
- [`deployments/ADDRESSES.md`](deployments/ADDRESSES.md)
