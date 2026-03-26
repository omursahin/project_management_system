import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services/department.js";

export const departmentQueryKeys = {
  all: ["departments"],
};

export const useDepartmentsQuery = (options = {}) =>
  useQuery({
    queryKey: departmentQueryKeys.all,
    queryFn: getDepartments,
    ...options,
  });
