import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { Loading } from '@/components/ui/Loading';
import { useLists } from '@/hooks/useLists';
import { formatCurrency } from '@/lib/nfce';
import type { ShoppingList } from '@/types/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: lists, isLoading, isError, error, refetch, isRefetching } = useLists();

  return (
    <View className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-zinc-900">Minhas listas</Text>
          {user?.email ? (
            <Text className="text-xs text-zinc-500" numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>
        <Button
          label="Sair"
          variant="outline"
          className="px-3 py-2"
          onPress={() => {
            void signOut();
          }}
        />
      </View>

      {isLoading ? <Loading /> : null}

      {!isLoading && isError ? (
        <ErrorView
          message={getApiErrorMessage(error)}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && lists ? (
        lists.length === 0 ? (
          <EmptyState
            title="Nenhuma lista ainda"
            description="Crie sua primeira lista e importe os itens do cupom fiscal."
            actionLabel="Nova lista"
            onAction={() => router.push('/lists/new')}
          />
        ) : (
          <FlatList
            data={lists}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  void refetch();
                }}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir lista ${item.title}`}
                onPress={() => router.push({ pathname: '/lists/[id]', params: { id: item.id } })}
                className="active:opacity-70">
                <ListCard list={item} />
              </Pressable>
            )}
          />
        )
      ) : null}

      <View className="absolute bottom-6 right-5">
        <Button label="+ Nova lista" onPress={() => router.push('/lists/new')} />
      </View>
    </View>
  );
}

function ListCard({ list }: { list: ShoppingList }) {
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-zinc-900">{list.title}</Text>
          {list.permission !== 'owner' ? (
            <Text className="mt-1 self-start rounded-full bg-primary-muted px-2 py-0.5 text-xs text-primary">
              Compartilhada ({list.permission === 'edit' ? 'edição' : 'leitura'})
            </Text>
          ) : null}
        </View>
        <Text className="text-lg font-bold text-primary">
          {formatCurrency(list.total_value)}
        </Text>
        <Text className="text-xl text-zinc-400">›</Text>
      </View>
    </Card>
  );
}
