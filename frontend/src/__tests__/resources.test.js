import { describe, it, expect } from "vitest";
import { groupsTransforms } from "../services/resources.js";

describe("groups.toClient", () => {
  it("backend memberships'i frontend members'a çevirir", () => {
    const serverData = {
      id: 1,
      title: "Alpha",
      description: "Desc",
      invitation_code: "ABC123",
      max_size: 5,
      status: "active",
      owner: 10,
      term_lesson: 7,
      memberships: [
        { id: 100, user: 10, user_email: "leader@x.com", user_name: "Lead", status: "accepted" },
        { id: 101, user: 11, user_email: "m@x.com", user_name: "Mem", status: "accepted" },
        { id: 102, user: 12, user_email: "p@x.com", user_name: "Pend", status: "pending" },
      ],
    };
    const c = groupsTransforms.toClient(serverData);
    expect(c.id).toBe(1);
    expect(c.name).toBe("Alpha");
    expect(c.invite_code).toBe("ABC123");
    expect(c.max_members).toBe(5);
    expect(c.term_lesson).toBe(7);
    expect(c.members).toHaveLength(3);
    expect(c.members[0].role).toBe("leader");
    expect(c.members[1].role).toBe("member");
    expect(c.member_count).toBe(2);
  });

  it("memberships yoksa boş üye listesi döner", () => {
    const c = groupsTransforms.toClient({
      id: 1, title: "X", description: "", invitation_code: "Y",
      max_size: 3, status: "active", owner: 1, term_lesson: 1,
    });
    expect(c.members).toEqual([]);
    expect(c.member_count).toBe(0);
  });
});

describe("groups.toServer", () => {
  it("frontend alanlarını backend alanlarına çevirir", () => {
    const s = groupsTransforms.toServer({
      name: "Alpha",
      description: "Desc",
      max_members: 5,
      term_lesson: 7,
    });
    expect(s.title).toBe("Alpha");
    expect(s.description).toBe("Desc");
    expect(s.max_size).toBe(5);
    expect(s.term_lesson).toBe(7);
    expect(s.status).toBe("active");
  });
});
