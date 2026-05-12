import { apiClient } from "@/lib/api";

export const uploadService = {
  async uploadFile(file: File): Promise<{ success: boolean; url: string; error?: string }> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/file", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Upload Error:", error);
      return { success: false, url: "", error: "Failed to upload file" };
    }
  },

  async getPresignedUrl(fileName: string, contentType: string) {
    return apiClient<{ signedUrl: string; publicUrl: string; fileName: string }>("/upload/signed-url", {
      method: "POST",
      body: { fileName, contentType },
    });
  }
};
