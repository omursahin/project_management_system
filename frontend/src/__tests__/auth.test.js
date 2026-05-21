import { describe, it, expect, beforeEach } from "vitest";
import { getUserRole, isAdmin, isInstructor, isStudent, isCoordinator } from "../services/auth.js";

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

  it("is_staff=true, is_superuser=false ise 'instructor' döner", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: false,
    }));
    expect(getUserRole()).toBe("instructor");
  });

  it("is_staff=false ise 'student' döner", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: false, is_superuser: false,
    }));
    expect(getUserRole()).toBe("student");
  });

  it("isAdmin sadece superuser için true", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: true,
    }));
    expect(isAdmin()).toBe(true);
    expect(isInstructor()).toBe(false);
    expect(isStudent()).toBe(false);
  });

  it("isInstructor sadece staff (superuser olmayan) için true", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: false,
    }));
    expect(isInstructor()).toBe(true);
    expect(isAdmin()).toBe(false);
    expect(isStudent()).toBe(false);
  });

  it("isStudent regular user için true", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: false, is_superuser: false,
    }));
    expect(isStudent()).toBe(true);
  });

  it("isCoordinator alias hala isInstructor gibi calisir", () => {
    localStorage.setItem("user", JSON.stringify({
      id: 1, is_staff: true, is_superuser: false,
    }));
    expect(isCoordinator()).toBe(true);
  });
});
