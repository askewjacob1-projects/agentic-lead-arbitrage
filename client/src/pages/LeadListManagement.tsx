import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Edit2, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface LeadList {
  id: number;
  title: string;
  leadCount: number;
  price: number;
  csvFileKey: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeadListManagement() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    leadCount: 50,
    price: 60,
    csvFile: null as File | null,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        csvFile: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.csvFile) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would upload to S3 and create a database record
      const newLeadList: LeadList = {
        id: Date.now(),
        title: formData.title,
        leadCount: formData.leadCount,
        price: formData.price,
        csvFileKey: `lead-lists/${Date.now()}-${formData.csvFile.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLeadLists(prev => [newLeadList, ...prev]);
      setFormData({ title: "", leadCount: 50, price: 60, csvFile: null });
      setShowForm(false);
      toast.success("Lead list created successfully");
    } catch (error) {
      toast.error("Failed to create lead list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this lead list?")) {
      setLeadLists(prev => prev.filter(list => list.id !== id));
      toast.success("Lead list deleted");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only administrators can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lead List Management</h1>
            <p className="text-muted-foreground">Create and manage your lead list inventory</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Lead List
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Lead List</CardTitle>
              <CardDescription>Upload a CSV file and set pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Lead List Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Tech Recruiters - Q2 2026"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadCount">Number of Leads</Label>
                    <Input
                      id="leadCount"
                      name="leadCount"
                      type="number"
                      min="1"
                      value={formData.leadCount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {isLoading ? "Uploading..." : "Create Lead List"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lead Lists Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Lists</CardTitle>
            <CardDescription>
              {leadLists.length} lead list{leadLists.length !== 1 ? "s" : ""} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leadLists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No lead lists yet</p>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Lead List
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>File Key</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadLists.map(list => (
                      <TableRow key={list.id}>
                        <TableCell className="font-medium">{list.title}</TableCell>
                        <TableCell>{list.leadCount}</TableCell>
                        <TableCell className="font-semibold">${list.price.toFixed(2)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {list.csvFileKey.substring(0, 30)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(list.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => setEditingId(list.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => handleDelete(list.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">CSV File Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Required Columns:</strong> company_name, contact_name, email, phone, title, company_size, hiring_intent, location, industry, linkedin_url
              </p>
              <p>
                <strong>File Format:</strong> CSV (comma-separated values) with headers in the first row
              </p>
              <p>
                <strong>Data Quality:</strong> Ensure all email addresses are verified and contact information is current
              </p>
              <p>
                <strong>File Size:</strong> Maximum 10MB per file
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
