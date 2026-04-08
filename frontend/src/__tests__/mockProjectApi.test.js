import { describe, it, expect, vi, beforeEach } from "vitest";
import { installMockProjectApi } from "../services/mockProjectApi";

function createFakeAxios() {
  const handlers = [];
  return {
    interceptors: {
      request: {
        use: (fn) => handlers.push(fn),
      },
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

describe("mockProjectApi", () => {
  let fakeAxios;

  beforeEach(() => {
    fakeAxios = createFakeAxios();
    installMockProjectApi(fakeAxios);
  });

  it("GET /api/group-project/ tüm projeleri döner", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group-project/", method: "get" });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(3);
  });

  it("GET /api/group-project/1/ tek proje döner", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group-project/1/", method: "get" });
    expect(res.status).toBe(200);
    expect(res.data.id).toBe(1);
    expect(res.data.title).toBe("Üniversite Portalı");
  });

  it("GET /api/group-project/999/ 404 fırlatır", async () => {
    await expect(
      fakeAxios.simulate({ url: "/api/group-project/999/", method: "get" })
    ).rejects.toThrow();
  });

  it("POST /api/group-project/ yeni proje oluşturur", async () => {
    const res = await fakeAxios.simulate({
      url: "/api/group-project/",
      method: "post",
      data: JSON.stringify({ title: "Yeni Proje", description: "Test", group: 1, group_name: "Test Grup" }),
    });
    expect(res.status).toBe(201);
    expect(res.data.title).toBe("Yeni Proje");
    expect(res.data.status).toBe("pending");
    expect(res.data.id).toBeGreaterThanOrEqual(4);
  });

  it("PUT /api/group-project/1/ proje günceller", async () => {
    const res = await fakeAxios.simulate({
      url: "/api/group-project/1/",
      method: "put",
      data: JSON.stringify({ title: "Güncellenmiş Başlık" }),
    });
    expect(res.status).toBe(200);
    expect(res.data.title).toBe("Güncellenmiş Başlık");
  });

  it("DELETE /api/group-project/1/ proje siler", async () => {
    const res = await fakeAxios.simulate({ url: "/api/group-project/1/", method: "delete" });
    expect(res.status).toBe(204);

    const listRes = await fakeAxios.simulate({ url: "/api/group-project/", method: "get" });
    const found = listRes.data.find((p) => p.id === 1);
    expect(found).toBeUndefined();
  });

  it("mock olmayan URL'ler için config'i aynen döner", async () => {
    await expect(
      fakeAxios.simulate({ url: "/api/other-endpoint/", method: "get" })
    ).rejects.toThrow("No adapter set");
  });
});
