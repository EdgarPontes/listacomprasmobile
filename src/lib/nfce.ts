import type { CreateListItem, NfceProduto } from '@/types/api';

/**
 * Converte os produtos do cupom fiscal em itens aceitos pelo backend.
 *
 * O banco armazena `quantity` como inteiro >= 1. Quando o cupom traz uma
 * quantidade fracionária (ex.: 0,750 kg), arredondamos e preservamos o valor
 * total ajustando o preço unitário.
 */
export function mapNfceToItems(produtos: NfceProduto[]): CreateListItem[] {
  return produtos.map(produto => {
    const rawQuantity =
      typeof produto.quantidade === 'number' && produto.quantidade > 0
        ? produto.quantidade
        : 1;

    const quantity = Math.max(1, Math.round(rawQuantity));

    const totalFromReceipt =
      typeof produto.valor_total === 'number' && Number.isFinite(produto.valor_total)
        ? produto.valor_total
        : null;

    const unitFromReceipt =
      typeof produto.valor_unitario === 'number' && Number.isFinite(produto.valor_unitario)
        ? produto.valor_unitario
        : null;

    const unitPrice =
      quantity !== rawQuantity && totalFromReceipt !== null
        ? Number((totalFromReceipt / quantity).toFixed(2))
        : unitFromReceipt ?? totalFromReceipt ?? 0;

    return {
      productName: produto.descricao || 'Produto',
      barcode: produto.codigo || '',
      quantity,
      unitPrice: Number(unitPrice.toFixed(2)),
    };
  });
}

export function formatCurrency(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
