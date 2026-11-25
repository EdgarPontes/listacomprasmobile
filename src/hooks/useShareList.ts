import { useMutation, useQueryClient } from '@tanstack/react-query';

import { findUserByEmail, shareList, type SharePermission } from '@/api/share';

interface ShareListVariables {
  listId: string;
  email: string;
  permissions: SharePermission;
}

export function useShareList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, email, permissions }: ShareListVariables) => {
      const user = await findUserByEmail(email);
      await shareList(listId, user.id, permissions);
      return user;
    },
    onSuccess: (_user, { listId }) => {
      void queryClient.invalidateQueries({ queryKey: ['list', listId] });
    },
  });
}
