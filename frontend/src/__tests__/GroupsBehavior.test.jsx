import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { render } from "../test/test-utils";
import Groups from "../pages/Groups";

vi.mock("../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import api from "../services/api.js";

const ownerGroups = [
  {
    id: 1,
    name: "Alpha Takımı",
    description: "Proje grubu",
    invite_code: "ALPH2026",
    max_members: 5,
    member_count: 3,
    owner: 1,
    owner_name: "Ahmet",
    is_member: true,
  },
];

const memberGroups = [
  {
    id: 2,
    name: "Beta Projesi",
    description: "Mobil ekip",
    invite_code: "BETA8899",
    max_members: 4,
    member_count: 2,
    owner: 99,
    owner_name: "Başkası",
    is_member: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("user", JSON.stringify({ id: 1 }));
});

afterEach(() => {
  localStorage.clear();
});

describe("Groups - Grup Oluşturma", () => {
  it("boş grup adıyla oluşturmaya çalışınca hata gösterir ve API çağrılmaz", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    fireEvent.click(screen.getByRole("button", { name: /Oluştur/i }));

    expect(await screen.findByText("Grup adı zorunludur.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("geçerli form ile POST /api/group/ çağrılır ve liste yenilenir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.post.mockResolvedValue({ data: { id: 99 } });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    fireEvent.change(screen.getByPlaceholderText("Örn: Proje Takımı Alpha"), { target: { value: "Gamma Takımı" } });
    fireEvent.change(screen.getByPlaceholderText("Grup hakkında kısa bilgi..."), { target: { value: "Test açıklama" } });
    fireEvent.click(screen.getByRole("button", { name: /Oluştur/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/group/", expect.objectContaining({
        name: "Gamma Takımı",
        description: "Test açıklama",
      }));
    });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it("İptal butonuna basınca form kapanır", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    expect(screen.getByText("Yeni Grup Oluştur")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /İptal/i }));
    expect(screen.queryByText("Yeni Grup Oluştur")).not.toBeInTheDocument();
  });

  it("API hatası döndüğünde hata mesajı gösterir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.post.mockRejectedValue({ response: { data: { name: ["Bu isimde grup zaten var."] } } });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Yeni Grup/i }));
    fireEvent.change(screen.getByPlaceholderText("Örn: Proje Takımı Alpha"), { target: { value: "Duplicate" } });
    fireEvent.click(screen.getByRole("button", { name: /Oluştur/i }));

    expect(await screen.findByText("Bu isimde grup zaten var.")).toBeInTheDocument();
  });
});

describe("Groups - Gruba Katılma", () => {
  it("boş davet koduyla katılmaya çalışınca hata gösterir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Katıl$/i }));

    expect(await screen.findByText("Davet kodu zorunludur.")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("geçerli kodla POST /api/group/join/ çağrılır ve kod uppercase'e çevrilir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.post.mockResolvedValue({ data: { detail: "Gruba katıldın." } });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    fireEvent.change(screen.getByPlaceholderText("Örn: A1B2C3D4"), { target: { value: "abcd1234" } });
    fireEvent.click(screen.getByRole("button", { name: /^Katıl$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/group/join/", { invite_code: "ABCD1234" });
    });
  });

  it("404 döndüğünde 'grup bulunamadı' hatası gösterir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.post.mockRejectedValue({ response: { status: 404, data: {} } });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    fireEvent.change(screen.getByPlaceholderText("Örn: A1B2C3D4"), { target: { value: "XXXX9999" } });
    fireEvent.click(screen.getByRole("button", { name: /^Katıl$/i }));

    expect(await screen.findByText("Bu davet koduna ait bir grup bulunamadı.")).toBeInTheDocument();
  });

  it("400 döndüğünde sunucu hata mesajını gösterir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.post.mockRejectedValue({ response: { status: 400, data: { detail: "Zaten bu grubun üyesisin." } } });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Davet Koduyla Katıl/i }));
    fireEvent.change(screen.getByPlaceholderText("Örn: A1B2C3D4"), { target: { value: "ALPH2026" } });
    fireEvent.click(screen.getByRole("button", { name: /^Katıl$/i }));

    expect(await screen.findByText("Zaten bu grubun üyesisin.")).toBeInTheDocument();
  });
});

describe("Groups - Üye Listeleme", () => {
  it("Üyeleri Gör butonuna tıklayınca GET /api/group/:id/ çağrılır", async () => {
    api.get
      .mockResolvedValueOnce({ data: ownerGroups })
      .mockResolvedValueOnce({
        data: {
          ...ownerGroups[0],
          members: [
            { id: 1, full_name: "Ahmet Yılmaz", role: "leader" },
            { id: 2, full_name: "Elif Demir", role: "member" },
          ],
        },
      });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Üyeleri Gör/i }));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/api/group/1/");
    });
    expect(await screen.findByText("Ahmet Yılmaz")).toBeInTheDocument();
    expect(screen.getByText("Elif Demir")).toBeInTheDocument();
  });

  it("üye listesi açıkken tekrar tıklayınca gizler", async () => {
    api.get
      .mockResolvedValueOnce({ data: ownerGroups })
      .mockResolvedValueOnce({
        data: { ...ownerGroups[0], members: [{ id: 1, full_name: "Ahmet", role: "leader" }] },
      });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Üyeleri Gör/i }));
    await screen.findByText("Ahmet");

    fireEvent.click(screen.getByRole("button", { name: /Üyeleri Gizle/i }));
    expect(screen.queryByText("ÜYELER")).not.toBeInTheDocument();
  });
});

describe("Groups - Sahiplik ve Aksiyonlar", () => {
  it("owner olan kullanıcıya 'Lider' badge'i gösterilir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");
    expect(screen.getByText("Lider")).toBeInTheDocument();
  });

  it("owner olan kullanıcıya 'Grubu Sil' butonu gösterilir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    render(<Groups />);
    await screen.findByText("Alpha Takımı");
    expect(screen.getByRole("button", { name: /Grubu Sil/i })).toBeInTheDocument();
  });

  it("owner olmayan kullanıcıya 'Ayrıl' butonu gösterilir", async () => {
    api.get.mockResolvedValue({ data: memberGroups });
    render(<Groups />);
    await screen.findByText("Beta Projesi");
    expect(screen.getByRole("button", { name: /Ayrıl/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Grubu Sil/i })).not.toBeInTheDocument();
  });

  it("silme onaylanınca DELETE çağrılır ve liste yenilenir", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    api.delete.mockResolvedValue({ data: null });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Grubu Sil/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/api/group/1/");
    });
    expect(api.get).toHaveBeenCalledTimes(2);
    window.confirm.mockRestore();
  });

  it("silme iptal edilirse DELETE çağrılmaz", async () => {
    api.get.mockResolvedValue({ data: ownerGroups });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Groups />);
    await screen.findByText("Alpha Takımı");

    fireEvent.click(screen.getByRole("button", { name: /Grubu Sil/i }));
    expect(api.delete).not.toHaveBeenCalled();
    window.confirm.mockRestore();
  });

  it("ayrılma onaylanınca POST leave çağrılır", async () => {
    api.get.mockResolvedValue({ data: memberGroups });
    api.post.mockResolvedValue({ data: { detail: "Ayrıldın." } });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<Groups />);
    await screen.findByText("Beta Projesi");

    fireEvent.click(screen.getByRole("button", { name: /Ayrıl/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/group/2/leave/");
    });
    window.confirm.mockRestore();
  });
});

describe("Groups - Hata Durumları", () => {
  it("API hatası durumunda hata mesajı gösterir", async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });
    render(<Groups />);

    expect(await screen.findByText("Gruplar yüklenirken bir hata oluştu.")).toBeInTheDocument();
  });

  it("kapasite dolu gruba maksimum üye badge'i kırmızı gösterilir", async () => {
    api.get.mockResolvedValue({
      data: [{ ...ownerGroups[0], member_count: 5, max_members: 5 }],
    });
    render(<Groups />);
    expect(await screen.findByText("5/5 üye")).toBeInTheDocument();
  });
});
