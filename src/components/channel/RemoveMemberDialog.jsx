import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const RemoveMemberDialog = ({
  isOpen,
  onClose,
  channel,
  memberToRemove,
  isRemoving,
  onRemoveMember,
}) => {
  if (!isOpen) return null;

  const memberName = memberToRemove?.userId?.name || memberToRemove?.userId?.email || "this user";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you absolutely sure you want to remove{" "}
            <span className="font-semibold">{memberName}</span>{" "}
            from the channel?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove{" "}
            {memberName} from the channel. The user will remain a member of the team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isRemoving}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onRemoveMember}
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRemoving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 h-4 border-b-2 border-white"></div>
                Removing...
              </div>
            ) : (
              "Remove Member"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveMemberDialog;
