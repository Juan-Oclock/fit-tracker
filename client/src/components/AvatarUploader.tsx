import { useState } from "react";
import { supabase } from "../lib/supabaseClient"; // Adjust path if needed

interface AvatarUploaderProps {
  user: {
    id: string;
  };
}

export default function AvatarUploader({ user }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}.${fileExt}`;

    // Upload to Supabase Storage (upsert: true allows overwrite)
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // Get the public URL
    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Update the user's profile_image_url in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      setError("Profile update failed: " + updateError.message);
    } else {
      setError(null);
      alert("Avatar uploaded and profile updated!");
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
