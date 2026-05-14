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
export const groups = createResource("groups", "/api/group/");

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
