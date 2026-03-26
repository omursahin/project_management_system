import { useMutation } from "@tanstack/react-query";
import { login, persistAuthSession, register } from "../services/auth.js";

export const useLoginMutation = (options = {}) => {
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: login,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      persistAuthSession(data);
      onSuccess?.(data, variables, context);
    },
  });
};

export const useRegisterMutation = (options = {}) => {
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: register,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      persistAuthSession(data);
      onSuccess?.(data, variables, context);
    },
  });
};
