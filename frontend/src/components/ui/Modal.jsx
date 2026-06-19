import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@chakra-ui/react";

/**
 * Standart modal sarmalayicisi. Chakra v3'te DialogBackdrop ve DialogPositioner
 * olmadan dialog inline render olur — bu bilesen dogru kurulumu garantiler.
 *
 * Kullanim:
 *   <Modal open={x} onClose={() => setX(false)} title="Baslik">
 *     ...icerik...
 *   </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  ...rest
}) {
  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => !e.open && onClose?.()}
      size={size}
      closeOnInteractOutside={closeOnOverlayClick}
      {...rest}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent>
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          <DialogBody pb={6}>{children}</DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
