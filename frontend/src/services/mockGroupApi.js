/**
 * Grup API Simülasyonu
 * Backend hazır olunca api.js'teki import satırını silmen yeterli.
 */

let groups = [
  {
    id: 1,
    name: "Alpha Takımı",
    description: "Web programlama proje grubu",
    invite_code: "ALPH2026",
    max_members: 5,
    owner: 1,
    owner_name: "Ahmet Yılmaz",
    term_lesson: null,
    created_at: "2026-03-15T10:00:00Z",
    members: [
      { id: 1, user: 1, user_email: "ahmet@example.com", full_name: "Ahmet Yılmaz", role: "leader", joined_at: "2026-03-15T10:00:00Z" },
      { id: 2, user: 2, user_email: "elif@example.com", full_name: "Elif Demir", role: "member", joined_at: "2026-03-16T09:00:00Z" },
      { id: 3, user: 3, user_email: "can@example.com", full_name: "Can Kaya", role: "member", joined_at: "2026-03-17T14:00:00Z" },
    ],
  },
  {
    id: 2,
    name: "Beta Projesi",
    description: "Mobil uygulama geliştirme ekibi",
    invite_code: "BETA8899",
    max_members: 4,
    owner: 2,
    owner_name: "Elif Demir",
    term_lesson: null,
    created_at: "2026-03-20T08:00:00Z",
    members: [
      { id: 4, user: 2, user_email: "elif@example.com", full_name: "Elif Demir", role: "leader", joined_at: "2026-03-20T08:00:00Z" },
      { id: 5, user: 1, user_email: "ahmet@example.com", full_name: "Ahmet Yılmaz", role: "member", joined_at: "2026-03-21T11:00:00Z" },
    ],
  },
];

let nextId = 3;
let nextMemberId = 6;

function currentUserId() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id || 1;
  } catch {
    return 1;
  }
}

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function enrichGroup(g) {
  return {
    ...g,
    member_count: g.members.length,
    is_member: g.members.some((m) => m.user === currentUserId()),
  };
}

// Axios response şeklinde sarmalama
function ok(data, status = 200) {
  return { data, status, statusText: "OK", headers: {}, config: {} };
}

function err(status, detail) {
  const error = new Error(detail);
  error.response = { status, data: { detail } };
  throw error;
}

export function installMockGroupApi(apiInstance) {
  apiInstance.interceptors.request.use(async (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    // Sadece /api/group ile başlayan istekleri yakala
    if (!url.startsWith("/api/group")) return config;

    await delay();

    // POST /api/group/join/
    if (url === "/api/group/join/" && method === "post") {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const code = (body.invite_code || "").toUpperCase();
      const group = groups.find((g) => g.invite_code === code);
      if (!group) err(404, "Bu davet koduna ait bir grup bulunamadı.");
      const uid = currentUserId();
      if (group.members.some((m) => m.user === uid)) err(400, "Zaten bu grubun üyesisin.");
      if (group.members.length >= group.max_members) err(400, "Grup kapasitesi dolu.");
      group.members.push({
        id: nextMemberId++,
        user: uid,
        user_email: `user${uid}@example.com`,
        full_name: `Kullanıcı ${uid}`,
        role: "member",
        joined_at: new Date().toISOString(),
      });
      config.adapter = () => Promise.resolve(ok({ detail: "Gruba katıldın." }));
      return config;
    }

    // POST /api/group/:id/leave/
    const leaveMatch = url.match(/^\/api\/group\/(\d+)\/leave\/$/);
    if (leaveMatch && method === "post") {
      const group = groups.find((g) => g.id === Number(leaveMatch[1]));
      if (!group) err(404, "Grup bulunamadı.");
      const uid = currentUserId();
      group.members = group.members.filter((m) => m.user !== uid);
      config.adapter = () => Promise.resolve(ok({ detail: "Gruptan ayrıldın." }));
      return config;
    }

    // GET /api/group/:id/
    const detailMatch = url.match(/^\/api\/group\/(\d+)\/$/);
    if (detailMatch && method === "get") {
      const group = groups.find((g) => g.id === Number(detailMatch[1]));
      if (!group) err(404, "Grup bulunamadı.");
      config.adapter = () => Promise.resolve(ok(enrichGroup(group)));
      return config;
    }

    // DELETE /api/group/:id/
    if (detailMatch && method === "delete") {
      groups = groups.filter((g) => g.id !== Number(detailMatch[1]));
      config.adapter = () => Promise.resolve(ok(null, 204));
      return config;
    }

    // GET /api/group/
    if ((url === "/api/group/" || url === "/api/group") && method === "get") {
      const uid = currentUserId();
      const myGroups = groups
        .filter((g) => g.members.some((m) => m.user === uid))
        .map(enrichGroup);
      config.adapter = () => Promise.resolve(ok(myGroups));
      return config;
    }

    // POST /api/group/
    if ((url === "/api/group/" || url === "/api/group") && method === "post") {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const uid = currentUserId();
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const newGroup = {
        id: nextId++,
        name: body.name,
        description: body.description || "",
        invite_code: code,
        max_members: body.max_members || 5,
        owner: uid,
        owner_name: `Kullanıcı ${uid}`,
        term_lesson: null,
        created_at: new Date().toISOString(),
        members: [
          {
            id: nextMemberId++,
            user: uid,
            user_email: `user${uid}@example.com`,
            full_name: `Kullanıcı ${uid}`,
            role: "leader",
            joined_at: new Date().toISOString(),
          },
        ],
      };
      groups.push(newGroup);
      config.adapter = () => Promise.resolve(ok(enrichGroup(newGroup), 201));
      return config;
    }

    return config;
  });
}
