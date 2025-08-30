import React from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const MessagesSection = ({ channel, isAdmin }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Messages
      </h3>
      <span className="text-sm text-gray-500">Coming soon...</span>
    </div>

    <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
      <CardContent className="p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Messages Coming Soon
        </h4>
        <p className="text-gray-600 mb-4">
          The messaging system is under development. You'll be able to send and
          receive messages here.
        </p>
        <Button variant="outline" disabled>
          <MessageSquare className="w-4 h-4 mr-2" />
          Start Messaging
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default MessagesSection;
