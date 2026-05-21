import Modal from "../ui/Modal.jsx";
import TermLessonStudentsPanel from "./TermLessonStudentsPanel.jsx";

/**
 * TermLessonStudentsPanel'i modal icinde sunar.
 */
export default function TermLessonStudentsDialog({ open, onClose, termLesson, displayTitle }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Öğrenciler — ${displayTitle || `TermLesson #${termLesson?.id ?? ""}`}`}
      size="lg"
    >
      {open && <TermLessonStudentsPanel termLesson={termLesson} />}
    </Modal>
  );
}
