# Rendimientos

Patrón **dividend-per-token** en `YieldDistributor`:

1. `depositYield(amount)` actualiza `dividendPerToken`.
2. `pendingYield(user) = balance(RENT) * dividendPerToken - correcciones`.
3. `PropertySale` llama `onMint` para que tokens nuevos no cobren renta pasada.
4. `claim()` retira COPW proporcional.

Narrativa: cada depósito = un “mes” de arriendo.
