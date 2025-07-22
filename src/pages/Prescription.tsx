import { useState, useRef } from "react";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Prescription = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a prescription image first",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically upload to your storage service
    toast({
      title: "Prescription uploaded successfully",
      description: "Our team will review your prescription and contact you soon.",
    });
    
    // Reset form
    removeFile();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-medical text-primary-foreground">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Upload Prescription</h1>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="px-6 mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Upload Your Prescription
          </h2>
          
          {!selectedFile ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-6">
                Upload a clear image of your prescription. Our team will review it and suggest appropriate tests.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                >
                  <Camera className="h-6 w-6" />
                  <span>Take Photo</span>
                </Button>
                
                <Button
                  onClick={handleFileUpload}
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                >
                  <Upload className="h-6 w-6" />
                  <span>Upload from Gallery</span>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Supported formats: JPG, PNG, PDF</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Ensure prescription is clearly visible</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl!}
                  alt="Prescription preview"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{selectedFile.name}</p>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              
              <Button
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Submit Prescription
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Hidden file inputs */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Prescription;