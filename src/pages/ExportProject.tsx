import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ExportProject() {
  const getAllFiles = useAction(api.exportProject.getAllFiles);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllFiles();
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(result, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `TrustTrade-Project-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success("Project exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export project");
    } finally {
      setIsExporting(false);
    }
  };

  const reconstructScript = `
// Save this as "reconstruct.js" and run with: node reconstruct.js
const fs = require('fs');
const path = require('path');

// Load the exported JSON file
const projectData = JSON.parse(fs.readFileSync('TrustTrade-Project-[DATE].json', 'utf8'));

// Create directories and files
Object.entries(projectData.files).forEach(([filePath, content]) => {
  const fullPath = path.join('.', filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  fs.mkdirSync(dir, { recursive: true });
  
  // Write file
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created:', filePath);
});

console.log('Project reconstruction complete!');
`;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6" />
            Export TrustTrade Project
          </CardTitle>
          <CardDescription>
            Download all project files as a JSON bundle that can be reconstructed locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            size="lg"
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting Project...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Project Files
              </>
            )}
          </Button>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">How to use the exported file:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click the button above to download the project JSON file</li>
              <li>Create a new folder for your project</li>
              <li>Save the reconstruction script below as <code>reconstruct.js</code></li>
              <li>Place both files in the same folder</li>
              <li>Run: <code>node reconstruct.js</code></li>
              <li>Follow the setup instructions in the README</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Reconstruction Script:</h3>
            <pre className="bg-black text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
              {reconstructScript}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
