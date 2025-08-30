import React, { useState, useEffect } from "react";
import { Settings, Lock, Save, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { updateChannelSchema } from "../../lib/teamSchemas";
import { useDispatch, useSelector } from "react-redux";
import { updateChannel, selectIsUpdatingChannel, selectUpdateChannelError } from "../../redux/slices/channelsSlice";
import { toast } from "react-toastify";

const SettingsSection = ({ channel, isAdmin, isManageMode }) => {
  const dispatch = useDispatch();
  const isUpdating = useSelector(selectIsUpdatingChannel);
  const updateError = useSelector(selectUpdateChannelError);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    type: "public"
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data when channel changes
  useEffect(() => {
    if (channel) {
      setFormData({
        name: channel.name || "",
        displayName: channel.displayName || "",
        description: channel.description || "",
        type: channel.type || "public"
      });
      setIsDirty(false);
      setErrors({});
    }
  }, [channel]);

  // Track form changes
  useEffect(() => {
    if (channel) {
      const hasChanges = 
        formData.name !== (channel.name || "") ||
        formData.displayName !== (channel.displayName || "") ||
        formData.description !== (channel.description || "") ||
        formData.type !== (channel.type || "public");
      
      setIsDirty(hasChanges);
    }
  }, [formData, channel]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      updateChannelSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    try {
      const fieldSchema = updateChannelSchema.pick({ [fieldName]: true });
      fieldSchema.parse({ [fieldName]: value });
      return "";
    } catch (error) {
      return error.errors?.[0]?.message || "";
    }
  };

  // Validate field on blur (when user leaves the field)
  const handleFieldBlur = (field) => {
    const fieldError = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      // Only send fields that have actually changed
      const updateData = {};
      if (formData.name !== (channel.name || "")) updateData.name = formData.name;
      if (formData.displayName !== (channel.displayName || "")) updateData.displayName = formData.displayName;
      if (formData.description !== (channel.description || "")) updateData.description = formData.description;
      if (formData.type !== (channel.type || "public")) updateData.type = formData.type;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      await dispatch(updateChannel({ 
        channelId: channel._id, 
        updateData 
      })).unwrap();

      setIsDirty(false);
    } catch (error) {
      console.error("Failed to update channel:", error);
    }
  };

  const handleReset = () => {
    if (channel) {
      setFormData({
        name: channel.name || "",
        displayName: channel.displayName || "",
        description: channel.description || "",
        type: channel.type || "public"
      });
      setIsDirty(false);
      setErrors({});
    }
  };

  // Temporary test function to debug validation
  const testValidation = () => {
    console.log('Current errors:', errors);
    console.log('Current formData:', formData);
    
    // Test validation manually
    const testData = { ...formData, name: "" };
    try {
      updateChannelSchema.parse(testData);
    } catch (error) {
      console.log('Validation error:', error);
      const newErrors = {};
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
      }
      console.log('Parsed errors:', newErrors);
      setErrors(newErrors);
    }
  };

  if (!isAdmin || !isManageMode) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-600" />
        Channel Settings
      </h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Channel Name */}
               <div className="space-y-2">
                 <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                   Channel Name *
                 </Label>
                 <Input
                   id="name"
                   type="text"
                   value={formData.name}
                   onChange={(e) => handleInputChange("name", e.target.value)}
                   onBlur={() => handleFieldBlur("name")}
                   className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
                   placeholder="Enter channel name"
                 />
                 <div className="min-h-[20px]">
                   {errors.name && (
                     <div className="flex items-center gap-2 text-sm text-red-600">
                       <AlertCircle className="w-4 h-4" />
                       {errors.name}
                     </div>
                   )}
                 </div>
               </div>

                             {/* Display Name */}
               <div className="space-y-2">
                 <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                   Display Name
                 </Label>
                 <Input
                   id="displayName"
                   type="text"
                   value={formData.displayName}
                   onChange={(e) => handleInputChange("displayName", e.target.value)}
                   onBlur={() => handleFieldBlur("displayName")}
                   className={errors.displayName ? "border-red-500 focus:ring-red-500" : ""}
                   placeholder="Enter display name (optional)"
                 />
                 <div className="min-h-[20px]">
                   {errors.displayName && (
                     <div className="flex items-center gap-2 text-sm text-red-600">
                       <AlertCircle className="w-4 h-4" />
                       {errors.displayName}
                     </div>
                   )}
                 </div>
               </div>

                             {/* Channel Type */}
               <div className="space-y-2">
                 <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                   Channel Type
                 </Label>
                 <Select
                   value={formData.type}
                   onValueChange={(value) => handleInputChange("type", value)}
                   onOpenChange={(open) => {
                     if (!open) {
                       handleFieldBlur("type");
                     }
                   }}
                 >
                   <SelectTrigger className={errors.type ? "border-red-500 focus:ring-red-500" : ""}>
                     <SelectValue placeholder="Select channel type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="public">
                       <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-green-600" />
                         Public
                       </div>
                     </SelectItem>
                     <SelectItem value="private">
                       <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-red-600" />
                         Private
                       </div>
                     </SelectItem>
                   </SelectContent>
                 </Select>
                 <div className="min-h-[20px]">
                   {errors.type && (
                     <div className="flex items-center gap-2 text-sm text-red-600">
                       <AlertCircle className="w-4 h-4" />
                       {errors.type}
                     </div>
                   )}
                 </div>
                 <p className="text-xs text-gray-500">
                   {channel?.type === "private" 
                     ? "Private channels cannot be converted to public"
                     : "Public channels can be converted to private"
                   }
                 </p>
               </div>

                             {/* Description */}
               <div className="md:col-span-2 space-y-2">
                 <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                   Description
                 </Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) => handleInputChange("description", e.target.value)}
                   onBlur={() => handleFieldBlur("description")}
                   className={errors.description ? "border-red-500 focus:ring-red-500" : ""}
                   placeholder="Enter channel description (optional)"
                   rows={3}
                 />
                 <div className="min-h-[20px]">
                   {errors.description && (
                     <div className="flex items-center gap-2 text-sm text-red-600">
                       <AlertCircle className="w-4 h-4" />
                       {errors.description}
                     </div>
                   )}
                 </div>
               </div>
            </div>

                         {/* Action Buttons */}
             <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
               {/* Validation Summary */}
               {Object.keys(errors).some(key => errors[key]) && (
                 <div className="flex items-center gap-2 text-sm text-red-600">
                   <AlertCircle className="w-4 h-4" />
                   Please fix validation errors before saving
                 </div>
               )}
               
               {/* Test Validation Button - Temporary */}
               <Button
                 type="button"
                 variant="outline"
                 onClick={testValidation}
                 className="bg-yellow-500 hover:bg-yellow-600 text-white"
               >
                 Test Validation
               </Button>
               
               <Button
                 type="submit"
                 disabled={!isDirty || isUpdating || Object.keys(errors).some(key => errors[key])}
                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
               >
                 {isUpdating ? (
                   <div className="flex items-center gap-2">
                     <div className="animate-spin rounded-full h-4 h-4 border-b-2 border-white"></div>
                     Saving...
                   </div>
                 ) : (
                   <>
                     <Save className="w-4 h-4 mr-2" />
                     Save Changes
                   </>
                 )}
               </Button>
               
               {isDirty && (
                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleReset}
                   disabled={isUpdating}
                 >
                   Reset
                 </Button>
               )}
             </div>

                         {/* Error Display */}
             {updateError && (
               <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                 <AlertCircle className="w-4 h-4 text-red-600" />
                 <span className="text-sm text-red-700">{updateError}</span>
               </div>
             )}

             {/* Debug Info - Temporary */}
             <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
               <h4 className="font-semibold text-sm text-gray-700 mb-2">Debug Info:</h4>
               <div className="text-xs text-gray-600 space-y-1">
                 <div>Errors: {JSON.stringify(errors)}</div>
                 <div>Form Data: {JSON.stringify(formData)}</div>
                 <div>Is Dirty: {isDirty.toString()}</div>
                 <div>Has Validation Errors: {Object.keys(errors).some(key => errors[key]).toString()}</div>
               </div>
             </div>
           </form>
         </CardContent>
       </Card>
     </div>
   );
 };

export default SettingsSection;
