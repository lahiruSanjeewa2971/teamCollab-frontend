import React from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Helper function to get member initials
const getMemberInitials = (user) => {
  if (!user) return "U";
  const name = user.name || "";
  const firstChar = name.charAt(0);
  const lastChar = name.charAt(name.length - 1);
  return `${firstChar}${lastChar}`;
};

const MembersSection = ({ channel, isAdmin, isManageMode, onAddMember, onRemoveMember }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-600" />
        Members ({channel.members?.length || 0})
      </h3>
      {isAdmin && isManageMode && (
        <Button
          onClick={onAddMember}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      )}
    </div>

    <div className="grid gap-3">
      {channel.members?.map((member) => (
        <Card
          key={member._id || member.userId}
          className="hover:shadow-sm transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.userId?.avatarUrl} />
                  <AvatarFallback>
                    {getMemberInitials(member.userId)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium text-gray-900">
                    {member.userId?.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {member.userId?.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                  className={
                    member.role === "admin"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  {member.role === "admin" ? "Admin" : "Member"}
                </Badge>

                {isAdmin && isManageMode && member.role !== "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove member"
                    onClick={() => onRemoveMember(member)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default MembersSection;
