import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminContent {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [content, setContent] = useState<AdminContent[]>([]);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState<"audio" | "pdf">("audio");
  const [contentType, setContentType] = useState<"music" | "book" | "quote" | "tilawat" | "ayat">("music");
  const [mood, setMood] = useState<"relax" | "sad" | "happy" | "stressed" | "motivated">("relax");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("mindease.baust@gmail.com");
  const [password, setPassword] = useState("Admin11");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      console.log("Admin check response:", {
        userId: user.id,
        data,
        error,
      });

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
      setCheckingAdmin(false);
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    } else if (!checkingAdmin && !isAdmin && user) {
      (async () => {
        try {
          const { data: latest, error: latestErr } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (latestErr) {
            console.error("Error re-checking admin role:", latestErr);
          }

          if (latest) {
            setIsAdmin(true);
            return;
          }
        } catch (e) {
          console.error("Failed to re-check admin role:", e);
        }
        navigate("/");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
      })();
    }
  }, [authLoading, user, checkingAdmin, isAdmin, navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Signed in",
        description: "Welcome back! Checking permissions...",
      });
    } catch (err: any) {
      console.error("Sign in error:", err);
      toast({
        title: "Sign in failed",
        description: err.message || "Unable to sign in.",
        variant: "destructive",
      });
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadContent();
    }
  }, [isAdmin]);

  const loadContent = async () => {
    setLoadingContent(true);
    const { data, error } = await supabase
      .from("admin_content")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive",
      });
    } else {
      setContent(data || []);
    }
    setLoadingContent(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const bucketName = fileType === "audio" ? "admin-audio" : "admin-pdfs";
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const fileInsertPayload: any = {
        title,
        description: description.trim() || null,
        file_type: fileType,
        content_type: contentType,
        mood: mood,
        file_url: publicUrl,
        file_name: file.name,
        uploaded_by: user!.id,
      };

  
      const safeInsert = async (payload: any) => {
        const res1: any = await (supabase as any).from('admin_content').insert(payload);
        if (!res1?.error) return res1;

        const msg: string = res1.error?.message || '';
        const missingCols: string[] = [];
        const re = /could not find the "([^"]+)" column/gi;
        let m;
        while ((m = re.exec(msg)) !== null) {
          if (m[1]) missingCols.push(m[1]);
        }

        if (missingCols.length === 0) return res1;

        const cleaned = { ...payload };
        missingCols.forEach((col) => {
          if (col in cleaned) delete cleaned[col];
        });

        const res2: any = await (supabase as any).from('admin_content').insert(cleaned);
        return res2;
      };

      const { error: dbError } = await safeInsert(fileInsertPayload);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

      setTitle("");
      setDescription("");
      setBody("");
      setFile(null);
      loadContent();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({ title: "Error", description: "Please provide a title.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const textPayload: any = {
        title,
        description: body.trim() || description.trim() || null,
        content_type: contentType,
        mood,
        file_type: contentType === 'music' ? 'audio' : 'pdf',
        file_url: null,
        file_name: '',
        uploaded_by: user!.id,
      };

      const safeInsert = async (payload: any) => {
        const res1: any = await (supabase as any).from('admin_content').insert(payload);
        if (!res1?.error) return res1;

        const msg: string = res1.error?.message || '';
        const missingCols: string[] = [];
        const re = /could not find the "([^"]+)" column/gi;
        let m;
        while ((m = re.exec(msg)) !== null) {
          if (m[1]) missingCols.push(m[1]);
        }

        if (missingCols.length === 0) return res1;

        const cleaned = { ...payload };
        missingCols.forEach((col) => {
          if (col in cleaned) delete cleaned[col];
        });

        const res2: any = await (supabase as any).from('admin_content').insert(cleaned);
        return res2;
      };

      const { error } = await safeInsert(textPayload);
      if (error) throw error;

      toast({ title: 'Success', description: 'Content uploaded successfully!' });
      setTitle(''); setDescription(''); setBody('');
      loadContent();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to upload content.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string, fileType: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    try {
      const bucketName = fileType === "audio" ? "admin-audio" : "admin-pdfs";
      const filePath = fileUrl.split("/").pop();

      if (filePath) {
        await supabase.storage.from(bucketName).remove([filePath]);
      }

      const { error } = await supabase
        .from("admin_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully!",
      });

      loadContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Sign In</CardTitle>
            <CardDescription>Sign in with admin credentials to manage content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={signingIn}>
                {signingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Content</CardTitle>
            <CardDescription>Upload audio files or PDFs to the database</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              // Use file upload for music/books with a file, otherwise use text upload
              if (contentType === 'quote' || contentType === 'ayat' || (contentType === 'book' && !file)) {
                handleTextUpload(e);
              } else {
                handleFileUpload(e);
              }
            }} className="space-y-4">
              <div>
                <Label htmlFor="mood">Mood</Label>
                <select id="mood" value={mood} onChange={(e) => setMood(e.target.value as any)} className="w-full rounded-md border p-2">
                  <option value="relax">Relax</option>
                  <option value="sad">Sad</option>
                  <option value="happy">Happy</option>
                  <option value="stressed">Stressed</option>
                  <option value="motivated">Motivated</option>
                </select>
              </div>

              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <select id="contentType" value={contentType} onChange={(e) => setContentType(e.target.value as any)} className="w-full rounded-md border p-2">
                  <option value="music">Music</option>
                  <option value="book">Book (PDF or text)</option>
                  <option value="quote">Quote</option>
                  <option value="tilawat">Tilawat</option>
                  <option value="ayat">Ayat</option>
                </select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter content description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="fileType">File Type</Label>
                <Select value={fileType} onValueChange={(value: "audio" | "pdf") => setFileType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show file input only for music or PDF books */}
              {(contentType === 'music' || (contentType === 'book')) && (
                <div>
                  <Label htmlFor="file">File (required for music or PDF books)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={contentType === 'music' ? 'audio/*' : '.pdf'}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required={contentType === 'music'}
                  />
                </div>
              )}

              {/* Show body textarea for quotes, ayat, or text books */}
              {(contentType === 'quote' || contentType === 'ayat' || (contentType === 'book' && !file)) && (
                <div>
                  <Label htmlFor="body">Content</Label>
                  <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Enter quote, ayat, or book text" rows={6} />
                </div>
              )}

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Content</CardTitle>
            <CardDescription>Manage all uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingContent ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : content.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No content uploaded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="capitalize">{item.file_type}</TableCell>
                      <TableCell>{item.file_name}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.file_url, "_blank")}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.file_url, item.file_type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
