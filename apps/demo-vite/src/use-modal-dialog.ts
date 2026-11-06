import { useEffect, useRef } from "react";

const useModalDialog = (open: boolean) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return dialogRef;
};

export { useModalDialog };
