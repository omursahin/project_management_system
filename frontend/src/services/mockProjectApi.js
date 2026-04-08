let projects = [
  {
    id: 1,
    group: 1,
    group_name: "Alpha Takımı",
    title: "Üniversite Portalı",
    description: "Öğrenci ve akademisyenlerin ders, proje ve grup yönetimi yapabildiği kapsamlı bir web platformu.",
    status: "in_progress",
    is_approved: true,
    created_at: "2026-03-18T10:00:00Z",
    reports: [
      { id: 1, report_name: "Ara Rapor", is_submitted: true, plagiarism_rate: 4.2, version: 1 },
    ],
    members: [
      { id: 1, full_name: "Ahmet Yılmaz", role: "leader" },
      { id: 2, full_name: "Elif Demir", role: "member" },
      { id: 3, full_name: "Can Kaya", role: "member" },
    ],
  },
  {
    id: 2,
    group: 2,
    group_name: "Beta Projesi",
    title: "Mobil Sağlık Takip",
    description: "Kronik hastaların günlük sağlık verilerini kaydettiği ve doktorlarıyla paylaştığı mobil uygulama.",
    status: "pending",
    is_approved: false,
    created_at: "2026-03-22T08:00:00Z",
    reports: [],
    members: [
      { id: 4, full_name: "Elif Demir", role: "leader" },
      { id: 5, full_name: "Ahmet Yılmaz", role: "member" },
    ],
  },
  {
    id: 3,
    group: 1,
    group_name: "Alpha Takımı",
    title: "Akıllı Otopark Sistemi",
    description: "IoT sensörleri ile gerçek zamanlı park yeri takibi ve yönlendirme sistemi.",
    status: "completed",
    is_approved: true,
    created_at: "2026-02-10T12:00:00Z",
    reports: [
      { id: 2, report_name: "Ara Rapor", is_submitted: true, plagiarism_rate: 2.1, version: 2 },
      { id: 3, report_name: "Final Rapor", is_submitted: true, plagiarism_rate: 5.8, version: 1 },
    ],
    members: [
      { id: 1, full_name: "Ahmet Yılmaz", role: "leader" },
      { id: 2, full_name: "Elif Demir", role: "member" },
      { id: 3, full_name: "Can Kaya", role: "member" },
    ],
  },
];

let nextId = 4;

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function ok(data, status = 200) {
  return { data, status, statusText: "OK", headers: {}, config: {} };
}

function err(status, detail) {
  const error = new Error(detail);
  error.response = { status, data: { detail } };
  throw error;
}

export function installMockProjectApi(apiInstance) {
  apiInstance.interceptors.request.use(async (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    if (!url.startsWith("/api/group-project")) return config;

    await delay();

    const detailMatch = url.match(/^\/api\/group-project\/(\d+)\/$/);

    if (detailMatch && method === "get") {
      const project = projects.find((p) => p.id === Number(detailMatch[1]));
      if (!project) err(404, "Proje bulunamadı.");
      config.adapter = () => Promise.resolve(ok(project));
      return config;
    }

    if (detailMatch && method === "put") {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const idx = projects.findIndex((p) => p.id === Number(detailMatch[1]));
      if (idx === -1) err(404, "Proje bulunamadı.");
      projects[idx] = { ...projects[idx], ...body };
      config.adapter = () => Promise.resolve(ok(projects[idx]));
      return config;
    }

    if (detailMatch && method === "delete") {
      projects = projects.filter((p) => p.id !== Number(detailMatch[1]));
      config.adapter = () => Promise.resolve(ok(null, 204));
      return config;
    }

    if ((url === "/api/group-project/" || url === "/api/group-project") && method === "get") {
      config.adapter = () => Promise.resolve(ok(projects));
      return config;
    }

    if ((url === "/api/group-project/" || url === "/api/group-project") && method === "post") {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const newProject = {
        id: nextId++,
        group: body.group,
        group_name: body.group_name || "Grup",
        title: body.title,
        description: body.description || "",
        status: "pending",
        is_approved: false,
        created_at: new Date().toISOString(),
        reports: [],
        members: [],
      };
      projects.push(newProject);
      config.adapter = () => Promise.resolve(ok(newProject, 201));
      return config;
    }

    return config;
  });
}
