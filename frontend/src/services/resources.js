import { createResource } from "../hooks/useApiResource.js";

/**
 * Tum REST kaynaklari burada tanimlanir.
 *
 * Yeni bir modul eklemek icin:
 *   export const myEntity = createResource("myEntity", "/api/my-entity/");
 *
 * Sonra bilesende:
 *   import { myEntity } from "../services/resources.js";
 *   const { data, isLoading } = myEntity.useList();
 *   const create = myEntity.useCreate();
 */

// Universiteler - backend (title, city_code, description) <-> client (name, city, detail) donusumu
export const universities = createResource("universities", "/api/university/", {
  toClient: (s) => ({
    id: s.id,
    name: s.title,
    city: s.city_code,
    type: s.type,
    detail: s.description,
  }),
  toServer: (c) => ({
    title: c.name,
    description: c.detail,
    city_code: c.city,
    type: c.type,
  }),
});

// Gruplar
export const groupsTransforms = {
  toClient: (s) => ({
    id: s.id,
    name: s.title,
    description: s.description,
    invite_code: s.invitation_code,
    max_members: s.max_size,
    status: s.status,
    owner: s.owner,
    term_lesson: s.term_lesson,
    members: (s.memberships || []).map((m) => ({
      id: m.id,
      user: m.user,
      user_email: m.user_email,
      full_name: m.user_name,
      status: m.status,
      role: m.user === s.owner ? "leader" : "member",
    })),
    member_count: (s.memberships || []).filter((m) => m.status === "accepted").length,
  }),
  toServer: (c) => ({
    title: c.name,
    description: c.description,
    max_size: c.max_members,
    term_lesson: c.term_lesson,
    status: c.status || "active",
  }),
};

export const groups = createResource("groups", "/api/group/", groupsTransforms);

// Bolumler
export const departments = createResource("departments", "/api/department/");

// Fakulteler
export const faculties = createResource("faculties", "/api/faculty/");

// Donemler
export const terms = createResource("terms", "/api/term/");

// Dersler
export const lessons = createResource("lessons", "/api/lesson/");

// Donem dersleri
export const termLessons = createResource("termLessons", "/api/term-lesson/");

// Donem ders ogrencileri
export const termLessonStudents = createResource("termLessonStudents", "/api/term-lesson-student/");

// Grup uyeleri
export const groupMembers = createResource("groupMembers", "/api/group-member/");

// Grup projeleri
export const groupProjects = createResource("groupProjects", "/api/group-project/");
