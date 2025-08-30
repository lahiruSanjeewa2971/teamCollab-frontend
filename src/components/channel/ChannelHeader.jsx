import React from "react";
import { ArrowLeft, Hash, Lock, Users, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const ChannelHeader = ({ channel, isAdmin, isManageMode, onBack }) => (
  <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="p-2 hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          {channel.type === "private" ? (
            <Lock className="w-6 h-6 text-white" />
          ) : (
            <Hash className="w-6 h-6 text-white" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">#{channel.name}</h1>
          {channel.displayName && (
            <p className="text-gray-600 text-lg">{channel.displayName}</p>
          )}
          {/* Show current mode - LOCKED, NO SWITCHING */}
          {/* <div className="mt-2">
            <Badge
              variant="outline"
              className={
                isManageMode 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }
            >
              {isManageMode ? "🔒 Manage Mode" : "🔒 Open Channel Mode"}
            </Badge>
          </div> */}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {isAdmin && (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 border-green-200"
        >
          <Settings className="w-4 h-4 mr-1" />
          Admin
        </Badge>
      )}

      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        <Users className="w-4 h-4 mr-1" />
        {channel.members?.length || 0} members
      </Badge>
    </div>
  </div>
);

export default ChannelHeader;
