import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { channelSchema } from "../../lib/channelSchemas.js";
import {
  createChannel,
  clearCreateError,
} from "../../redux/slices/channelsSlice.js";
import { selectTeamsWhereUserIsOwner } from "../../redux/slices/teamSlice.js";
import {
  selectIsCreatingChannel,
  selectCreateChannelError,
} from "../../redux/slices/channelsSlice.js";
import { useSocket } from "../../contexts/SocketContext.jsx";

// shadcn/ui components
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Textarea } from "../ui/textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group.jsx";
import { Separator } from "../ui/separator.jsx";
import { ScrollArea } from "../ui/scroll-area.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";

const CreateChannelDialog = ({ isOpen, onClose, currentTeamId = null }) => {
  const dispatch = useDispatch();
  const { socketService } = useSocket();
  const teams = useSelector(selectTeamsWhereUserIsOwner);
  const isCreating = useSelector(selectIsCreatingChannel);
  const createError = useSelector(selectCreateChannelError);

  // Use only teams where user is the owner (can create channels)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(channelSchema),
    mode: "onChange",
    defaultValues: {
      teamId: currentTeamId || "",
      name: "",
      displayName: "",
      description: "",
      type: "public",
    },
  });

  const watchedName = watch("name");
  const watchedTeamId = watch("teamId");

  // Clear form errors when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      clearErrors();
      dispatch(clearCreateError());
      if (currentTeamId) {
        setValue("teamId", currentTeamId);
      }
    } else {
      reset();
    }
  }, [isOpen, currentTeamId, clearErrors, setValue, reset, dispatch]);

  // Handle 409 conflict error
  useEffect(() => {
    if (createError?.code === "CHANNEL_NAME_TAKEN") {
      setError("name", {
        type: "manual",
        message: createError.message,
      });
    }
  }, [createError, setError]);

  const onSubmit = async (data) => {
    try {
      // Clean up empty optional fields
      const cleanData = {
        ...data,
        displayName: data.displayName?.trim() || undefined,
        description: data.description?.trim() || undefined,
      };

      // Ensure user is in the team room for real-time updates
      if (socketService?.isConnected && data.teamId) {
        socketService.joinTeamRoom(data.teamId);
      }

      await dispatch(
        createChannel({
          teamId: data.teamId,
          channelData: cleanData,
        })
      ).unwrap();

      // Success - close dialog and reset form
      onClose();
      reset();
      toast.success("Channel created successfully!");
    } catch (error) {
      // Error handling is done in the slice
      console.error("Failed to create channel:", error);
    }
  };

  const handleCancel = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Add a new channel to organize team discussions and collaboration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Team Selection */}
              <div className="space-y-2">
                <Label htmlFor="teamId">Team *</Label>
                <Select
                  value={watchedTeamId}
                  onValueChange={(value) => setValue("teamId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!watchedTeamId && (
                  <p className="text-sm text-muted-foreground">
                    Please select a team to create a channel
                  </p>
                )}
                {errors.teamId && (
                  <p className="text-sm text-red-500">
                    {errors.teamId.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Channel Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Channel name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., frontend-dev"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {watchedName && (
                  <p className="text-sm text-muted-foreground">
                    Will be displayed as:{" "}
                    <span className="font-mono">#{watchedName}</span>
                  </p>
                )}
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name (optional)</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Frontend Development"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-500">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this channel about?"
                  {...register("description")}
                  maxLength={300}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Max 300 characters</span>
                  <span>{watch("description")?.length || 0}/300</span>
                </div>
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Channel Type */}
              <div className="space-y-2">
                <Label>Channel type</Label>
                <RadioGroup
                  value={watch("type")}
                  onValueChange={(value) => setValue("type", value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public">
                      Public - All team members can see and join
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private">
                      Private - Only invited members can access
                    </Label>
                  </div>
                </RadioGroup>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isCreating || !watchedTeamId}
            >
              {isCreating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                "Create Channel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelDialog;
