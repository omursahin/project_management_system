import { describe, it, expect, vi, beforeEach } from "vitest";
import { installMockGroupApi } from "../services/mockGroupApi";

function createFakeAxios() {
  const handlers = [];
  return {
    interceptors: {
      request: { use: (fn) => handlers.push(fn) },
    },
    async simulate(config) {
      let cfg = { ...config, method: config.method || "get" };
      for (const handler of handlers) {
        cfg = await handler(cfg);
      }
      if (cfg.adapter) return cfg.adapter();
      throw new Error("No adapter set");
    },
  };
}

beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
});

describe("mockGroupApi", () => {
  let fakeAxios;

  beforeEach(() => {
    fakeAxios = createFakeAxios();
    installMockGroupApi(fakeAxios);
  });

  it("GET /api/group/ sadece mevcut kullanıcının üye olduğu grupları döner", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group/", method: "get" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    res.data.forEach((g) => {
      expect(g.is_member).toBe(true);
      expect(g.member_count).toBeGreaterThan(0);
    });
  });

  it("GET /api/group/1/ detay ve üye listesi döner", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group/1/", method: "get" });
    expect(res.data.id).toBe(1);
    expect(res.data.members.length).toBeGreaterThan(0);
    expect(res.data.invite_code).toBeTruthy();
  });

  it("GET /api/group/999/ 404 fırlatır", async () => {
    await expect(
      fakeAxios.simulate({ url: "/api/group/999/", method: "get" })
    ).rejects.toThrow();
  });

  it("POST /api/group/ yeni grup oluşturur, owner mevcut kullanıcıdır", async () => {
    const res = await fakeAxios.simulate({
      url: "/api/group/",
      method: "post",
      data: JSON.stringify({ name: "Yeni Grup", description: "Test", max_members: 3 }),
    });
    expect(res.status).toBe(201);
    expect(res.data.name).toBe("Yeni Grup");
    expect(res.data.owner).toBe(1);
    expect(res.data.members.length).toBe(1);
    expect(res.data.members[0].role).toBe("leader");
  });

  it("POST /api/group/join/ geçerli kodla gruba katılır", async () => {
    localStorage.setItem("user", JSON.stringify({ id: 99 }));
    const res = await fakeAxios.simulate({
      url: "/api/group/join/",
      method: "post",
      data: JSON.stringify({ invite_code: "ALPH2026" }),
    });
    expect(res.status).toBe(200);

    const detail = await fakeAxios.simulate({ url: "/api/group/1/", method: "get" });
    const newMember = detail.data.members.find((m) => m.user === 99);
    expect(newMember).toBeTruthy();
    expect(newMember.role).toBe("member");
  });

  it("POST /api/group/join/ geçersiz kodla 404 fırlatır", async () => {
    await expect(
      fakeAxios.simulate({
        url: "/api/group/join/",
        method: "post",
        data: JSON.stringify({ invite_code: "XXXX0000" }),
      })
    ).rejects.toThrow();
  });

  it("POST /api/group/join/ zaten üye olunan gruba 400 fırlatır", async () => {
    await expect(
      fakeAxios.simulate({
        url: "/api/group/join/",
        method: "post",
        data: JSON.stringify({ invite_code: "ALPH2026" }),
      })
    ).rejects.toThrow();
  });

  it("POST /api/group/:id/leave/ gruptan ayrılır", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group/1/leave/", method: "post" });
    expect(res.status).toBe(200);

    const detail = await fakeAxios.simulate({ url: "/api/group/1/", method: "get" });
    const removed = detail.data.members.find((m) => m.user === 1);
    expect(removed).toBeUndefined();
  });

  it("DELETE /api/group/1/ grubu siler", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group/1/", method: "delete" });
    expect(res.status).toBe(204);

    await expect(
      fakeAxios.simulate({ url: "/api/group/1/", method: "get" })
    ).rejects.toThrow();
  });
});
