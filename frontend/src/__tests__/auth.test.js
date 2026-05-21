import { describe, it, expect, beforeEach } from "vitest";
import { getUserRole, isAdmin, isCoordinator } from "../services/auth.js";

beforeEach(() => {
  localStorage.clear();
});

describe("getUserRole", () => {
  it("kullanıcı yoksa 'user' döner", () => {
    expect(getUserRole()).toBe("user");
  });

  it("is_superuser=true ise 'admin' döner", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: true,
    }));
    expect(getUserRole()).toBe("admin");
  });

  it("is_staff=true, is_superuser=false ise 'coordinator' döner", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: false,
    }));
    expect(getUserRole()).toBe("coordinator");
  });

  it("is_staff=false ise 'user' döner", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: false, is_superuser: false,
    }));
    expect(getUserRole()).toBe("user");
  });

  it("isAdmin sadece superuser için true", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: true,
    }));
    expect(isAdmin()).toBe(true);
    expect(isCoordinator()).toBe(false);
  });

  it("isCoordinator sadece staff (superuser olmayan) için true", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: false,
    }));
    expect(isCoordinator()).toBe(true);
    expect(isAdmin()).toBe(false);
  });
});
