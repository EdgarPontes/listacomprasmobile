import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/client';
import { ItemFormModal, type ItemFormValues } from '@/components/ItemFormModal';
import { RenameListModal } from '@/components/RenameListModal';
import { ShareListModal } from '@/components/ShareListModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorView } from '@/components/ui/ErrorView';
import { Loading } from '@/components/ui/Loading';
import { useCreateListItem } from '@/hooks/useCreateListItem';
import { useDeleteList } from '@/hooks/useDeleteList';
import { useDeleteListItem } from '@/hooks/useDeleteListItem';
import { useList } from '@/hooks/useList';
import { useUpdateList } from '@/hooks/useUpdateList';
import { useUpdateListItem } from '@/hooks/useUpdateListItem';
import { formatCurrency } from '@/lib/nfce';
import type { ListItem, ShoppingList } from '@/types/api';

export default function ListDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const listId = Array.isArray(params.id) ? params.id[0] : params.id;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: list, isLoading, isError, error, refetch, isRefetching } = useList(listId);

  const createItem = useCreateListItem();
  const updateItem = useUpdateListItem();
  const deleteItem = useDeleteListItem();
  const renameList = useUpdateList();
  const removeList = useDeleteList();

  const [formItem, setFormItem] = useState<ListItem | 'new' | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function handleToggle(item: ListItem) {
    if (!listId || updateItem.isPending) return;

    try {
      await updateItem.mutateAsync({
        listId,
        itemId: item.id,
        input: { checked: !item.checked },
      });
    } catch (toggleError) {
      Alert.alert('Erro', getApiErrorMessage(toggleError));
    }
  }

  async function handleSaveItem(values: ItemFormValues) {
    if (!listId) return;

    try {
      if (formItem === 'new') {
        await createItem.mutateAsync({
          listId,
          input: {
            productName: values.productName,
            barcode: values.barcode || undefined,
            quantity: values.quantity,
            unitPrice: values.unitPrice,
          },
        });
      } else if (formItem) {
        await updateItem.mutateAsync({
          listId,
          itemId: formItem.id,
          input: {
            productName: values.productName,
            barcode: values.barcode || null,
            quantity: values.quantity,
            unitPrice: values.unitPrice,
          },
        });
      }

      setFormItem(null);
    } catch (saveError) {
      Alert.alert('Erro', getApiErrorMessage(saveError));
    }
  }

  function confirmRemoveItem(item: ListItem) {
    Alert.alert('Remover item', `Remover "${item.product_name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!listId) return;

            try {
              await deleteItem.mutateAsync({ listId, itemId: item.id });
            } catch (deleteError) {
              Alert.alert('Erro', getApiErrorMessage(deleteError));
            }
          })();
        },
      },
    ]);
  }

  async function handleRename(title: string) {
    if (!listId) return;

    try {
      await renameList.mutateAsync({ listId, title });
      setRenameOpen(false);
    } catch (renameError) {
      Alert.alert('Erro', getApiErrorMessage(renameError));
    }
  }

  function confirmDeleteList(current: ShoppingList) {
    Alert.alert(
      'Excluir lista',
      `Excluir a lista "${current.title}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await removeList.mutateAsync(current.id);
                router.replace('/');
              } catch (deleteError) {
                Alert.alert('Erro', getApiErrorMessage(deleteError));
              }
            })();
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Lista' }} />
        <Loading />
      </>
    );
  }

  if (isError || !list) {
    return (
      <>
        <Stack.Screen options={{ title: 'Lista' }} />
        <ErrorView
          message={isError ? getApiErrorMessage(error) : 'Lista não encontrada.'}
          onRetry={() => {
            void refetch();
          }}
        />
      </>
    );
  }

  const items = list.items ?? [];
  const checkedCount = items.filter(item => item.checked).length;
  const canEdit = list.permission !== 'view';
  const isOwner = list.permission === 'owner';

  const pendingItemId = updateItem.isPending
    ? updateItem.variables?.itemId
    : deleteItem.isPending
      ? deleteItem.variables?.itemId
      : undefined;

  const savingItem = createItem.isPending || updateItem.isPending;

  return (
    <>
      <Stack.Screen options={{ title: list.title }} />
      <View className="flex-1 bg-zinc-50">
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: 20,
            gap: 12,
            paddingBottom: insets.bottom + (canEdit ? 120 : 40),
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
            />
          }
          ListHeaderComponent={
            <View className="gap-3">
              <ListSummary list={list} checkedCount={checkedCount} />

              {canEdit ? (
                <View className="gap-2">
                  <View className="flex-row gap-2">
                    {isOwner ? (
                      <Button
                        label="Compartilhar"
                        variant="outline"
                        className="flex-1 px-3 py-2"
                        onPress={() => setShareOpen(true)}
                      />
                    ) : null}
                    <Button
                      label="Renomear"
                      variant="outline"
                      className="flex-1 px-3 py-2"
                      onPress={() => setRenameOpen(true)}
                    />
                  </View>

                  {isOwner ? (
                    <Button
                      label="Excluir lista"
                      variant="ghostDanger"
                      className="px-3 py-2"
                      loading={removeList.isPending}
                      onPress={() => confirmDeleteList(list)}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <Card className="items-center gap-2 py-8">
              <Text className="text-lg font-semibold text-zinc-900">Nenhum item ainda</Text>
              <Text className="text-center text-zinc-500">
                {canEdit
                  ? 'Adicione o primeiro item pelo botão abaixo.'
                  : 'Esta lista ainda não possui itens.'}
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              canEdit={canEdit}
              pending={pendingItemId === item.id}
              onToggle={() => {
                void handleToggle(item);
              }}
              onEdit={() => setFormItem(item)}
              onRemove={() => confirmRemoveItem(item)}
            />
          )}
        />

        {canEdit ? (
          <View
            className="border-t border-zinc-200 bg-white px-5 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}>
            <Button label="+ Adicionar item" onPress={() => setFormItem('new')} />
          </View>
        ) : null}
      </View>

      {formItem ? (
        <ItemFormModal
          key={formItem === 'new' ? 'new' : formItem.id}
          title={formItem === 'new' ? 'Adicionar item' : 'Editar item'}
          submitLabel={formItem === 'new' ? 'Adicionar' : 'Salvar'}
          initialValues={formItem === 'new' ? undefined : formItem}
          loading={savingItem}
          onClose={() => {
            if (!savingItem) setFormItem(null);
          }}
          onSubmit={values => {
            void handleSaveItem(values);
          }}
        />
      ) : null}

      {renameOpen ? (
        <RenameListModal
          currentTitle={list.title}
          loading={renameList.isPending}
          onClose={() => {
            if (!renameList.isPending) setRenameOpen(false);
          }}
          onSubmit={title => {
            void handleRename(title);
          }}
        />
      ) : null}

      {shareOpen ? (
        <ShareListModal
          listId={list.id}
          listTitle={list.title}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </>
  );
}

function ListSummary({ list, checkedCount }: { list: ShoppingList; checkedCount: number }) {
  const items = list.items ?? [];

  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-xl font-bold text-zinc-900">{list.title}</Text>
        <Text className="text-xl font-bold text-primary">
          {formatCurrency(list.total_value)}
        </Text>
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <Text className="rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Text>
        <Text className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
          {checkedCount} de {items.length} comprados
        </Text>
        {list.permission !== 'owner' ? (
          <Text className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
            Compartilhada ({list.permission === 'edit' ? 'edição' : 'leitura'})
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

interface ItemRowProps {
  item: ListItem;
  canEdit: boolean;
  pending: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function ItemRow({ item, canEdit, pending, onToggle, onEdit, onRemove }: ItemRowProps) {
  return (
    <Card className={`gap-2 ${item.checked ? 'opacity-60' : ''}`}>
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.checked, disabled: !canEdit || pending }}
          accessibilityLabel={`Marcar ${item.product_name} como comprado`}
          disabled={!canEdit || pending}
          hitSlop={8}
          onPress={onToggle}
          className={`mt-0.5 h-6 w-6 items-center justify-center rounded-md border ${
            item.checked ? 'border-primary bg-primary' : 'border-zinc-300 bg-white'
          } ${!canEdit || pending ? 'opacity-50' : 'active:opacity-70'}`}>
          {item.checked ? <Text className="text-sm font-bold text-white">✓</Text> : null}
        </Pressable>

        <View className="flex-1 gap-1">
          <Text
            className={`text-base font-semibold text-zinc-900 ${
              item.checked ? 'line-through' : ''
            }`}>
            {item.product_name}
          </Text>
          <Text className="text-xs text-zinc-500">
            {item.quantity} × {formatCurrency(item.unit_price)}
          </Text>
          {item.barcode ? (
            <Text className="text-xs text-zinc-400">Cód. {item.barcode}</Text>
          ) : null}

          {canEdit ? (
            <View className="mt-1 flex-row gap-1">
              <Button
                label="Editar"
                variant="ghost"
                className="px-2 py-1"
                disabled={pending}
                onPress={onEdit}
              />
              <Button
                label="Remover"
                variant="ghostDanger"
                className="px-2 py-1"
                disabled={pending}
                onPress={onRemove}
              />
            </View>
          ) : null}
        </View>

        <Text className="text-base font-bold text-primary">
          {formatCurrency(item.total_price)}
        </Text>
      </View>
    </Card>
  );
}
