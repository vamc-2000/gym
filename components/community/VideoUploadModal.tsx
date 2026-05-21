"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Film, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { triggerToast } from "@/components/NotificationManager";
import { apiClient } from "@/lib/api";

interface VideoUploadModalProps {
  onClose: () => void;
  onUploadSuccess: (newReel: any) => void;
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunk sizes

export default function VideoUploadModal({ onClose, onUploadSuccess }: VideoUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // 1. Type validation
    if (!selectedFile.type.startsWith("video/")) {
      triggerToast("Format Error", "Supported formats: MP4, MOV, WebM video nodes only", "error");
      return;
    }

    // 2. Size validation (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      triggerToast("File Size Error", "Reels telemetry payload cannot exceed 100MB limit", "error");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Convert blob slice to base64
  const readChunkAsBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  };

  // Upload runner using Chunked Upload Protocol
  const startChunkedUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setStatusMessage("Establishing connection...");

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      // 1. Initialize Upload
      const initRes = await apiClient<any>("/reels/upload", {
        method: "POST",
        body: {
          action: "init",
          filename: file.name,
          totalChunks,
          fileSize: file.size
        }
      });

      if (!initRes.success || !initRes.data?.uploadId) {
        throw new Error(initRes.error || "Session handshake failed");
      }

      const { uploadId } = initRes.data;

      // 2. Upload chunks sequentially with 3 retries per chunk
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);
        
        setStatusMessage(`Transmitting chunk ${i + 1}/${totalChunks}...`);
        
        const base64Data = await readChunkAsBase64(chunkBlob);

        let success = false;
        let attempts = 0;
        
        while (!success && attempts < 3) {
          attempts++;
          try {
            const chunkRes = await apiClient<any>("/reels/upload", {
              method: "POST",
              body: {
                action: "chunk",
                uploadId,
                chunkIndex: i,
                chunkData: base64Data
              }
            });

            if (chunkRes.success) {
              success = true;
            } else {
              throw new Error(chunkRes.error || "Chunk rejected");
            }
          } catch (err) {
            console.warn(`Retry chunk #${i} - Attempt ${attempts}/3 failed:`, err);
            if (attempts >= 3) {
              throw new Error(`Connection severed at chunk #${i + 1} after 3 attempts`);
            }
            // exponential backoff
            await new Promise((resolve) => setTimeout(resolve, attempts * 1000));
          }
        }

        setUploadProgress(Math.round(((i + 1) / totalChunks) * 90)); // Save last 10% for processing completion
      }

      // 3. Assemble and Optimize Video
      setStatusMessage("Running optimization pipeline...");
      const completeRes = await apiClient<any>("/reels/upload", {
        method: "POST",
        body: {
          action: "complete",
          uploadId,
          caption: caption.trim() || "PR Workout deployment"
        }
      });

      if (!completeRes.success || !completeRes.data) {
        throw new Error(completeRes.error || "Compression failed");
      }

      setUploadProgress(100);
      setStatusMessage("Sync complete!");
      triggerToast("Transmitted", "Reel deployed on grid", "success");
      onUploadSuccess(completeRes.data);
      onClose();
    } catch (error: any) {
      console.error("Transmission error:", error);
      triggerToast("Upload Failed", error.message || "An error occurred", "error");
      setStatusMessage("Sync failed");
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0a0a14] border border-cyan-500/15 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col"
      >
        {/* Neon Glow Bars */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-blue via-purple-500 to-neon-yellow opacity-40 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-blue animate-pulse" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Transmit Reel Node</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {!file && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                dragActive
                  ? "border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  : "border-white/10 bg-white/[0.01] hover:border-white/25 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                <UploadCloud className="w-7 h-7 text-neon-blue" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  Drag & Drop Video File
                </p>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1">
                  or click to browse local storage
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-3 py-1 rounded-full text-[7px] font-bold text-white/40 uppercase tracking-widest mt-2">
                <AlertCircle className="w-3 h-3 text-neon-yellow" />
                MP4/MOV up to 100MB (Max 60s)
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
                  <Film className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">
                    {file.name}
                  </p>
                  <p className="text-[8px] font-bold text-white/40 uppercase">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setFile(null)}
                    className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 text-[8px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Caption field */}
              <div className="space-y-2">
                <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.25em] block">
                  Reel Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Relay your heavy set deployment parameters (e.g. Squat 200kg)..."
                  rows={3}
                  disabled={uploading}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] text-white placeholder-white/20 focus:border-neon-blue/40 outline-none transition-all resize-none font-medium"
                />
              </div>

              {/* Uploading progress indicator */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                    <span className="text-neon-blue animate-pulse">{statusMessage}</span>
                    <span className="text-white/60">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-blue via-purple-500 to-neon-yellow"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Trigger */}
              {!uploading && (
                <button
                  onClick={startChunkedUpload}
                  className="w-full py-3.5 bg-neon-blue text-dash-bg font-black text-[9px] uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <UploadCloud className="w-4 h-4" />
                  Initiate Upload Stream
                </button>
              )}

              {uploading && (
                <div className="w-full py-3.5 bg-white/5 border border-white/5 text-white/30 font-black text-[9px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 select-none">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                  Uploading telemetry packet...
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
