"use client"

import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ImageIcon, Upload, Trash2, X } from "lucide-react"

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`
}

export default function ImagesPage() {
  const [images, setImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageToDelete, setImageToDelete] = useState(null)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)

  // Fetch images from API
  const fetchImages = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/images')
      const data = await response.json()
      if (response.ok) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const totalSize = useMemo(() => images.reduce((acc, i) => acc + (i.size || 0), 0), [images])

  const onDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    if (e.type === "dragleave") setDragActive(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length) setSelectedFiles((prev) => [...prev, ...files])
  }

  const onFileSelect = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : []
    const files = list.filter((f) => f.type.startsWith("image/"))
    if (files.length) setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeSelected = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const clearSelected = () => setSelectedFiles([])

  const uploadSelected = async () => {
    if (!selectedFiles.length) return
    const filesToUpload = [...selectedFiles]
    setIsUploading(true)
    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/images', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          console.error('Failed to upload:', file.name)
        }
      }
      toast.success(`${filesToUpload.length} image${filesToUpload.length > 1 ? 's' : ''} uploaded successfully!`)
      setSelectedFiles([])
      await fetchImages() // Refresh the list
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("An error occurred during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return
    try {
      const response = await fetch(`/api/images/${encodeURIComponent(imageToDelete)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Image deleted successfully.")
        setImages((prev) => prev.filter((img) => img.id !== imageToDelete))
      } else {
        toast.error("Failed to delete image.")
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error("An error occurred while deleting the image.")
    } finally {
      setImageToDelete(null)
    }
  }

  const handleClearAllConfirm = async () => {
    try {
      const imageIds = images.map(img => img.id)
      const deletePromises = imageIds.map(id =>
        fetch(`/api/images/${encodeURIComponent(id)}`, { method: 'DELETE' })
      )

      const results = await Promise.allSettled(deletePromises)
      const failedCount = results.filter(r => r.status === 'rejected' || !r.value.ok).length

      for (const img of images) {
        await fetch(`/api/images/${encodeURIComponent(img.id)}`, {
          method: 'DELETE',
        })
      }

      if (failedCount > 0) {
        toast.error(`Failed to delete ${failedCount} image(s).`)
      } else {
        toast.success("All images have been deleted.")
      }
      await fetchImages()
    } catch (error) {
      console.error('Clear all error:', error)
      toast.error("An error occurred while clearing images.")
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Image Library</h1>
          <p className="text-muted-foreground">Upload and manage image</p>
        </div>
        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowClearAllDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>Drag & drop or browse files. Images are saved to Cloudinary.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300"
              }`}
            onDragEnter={onDrag}
            onDragOver={onDrag}
            onDragLeave={onDrag}
            onDrop={onDrop}
          >
            <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <p className="text-lg font-medium">Drag and drop image files here</p>
            <p className="text-sm text-muted-foreground">or</p>
            <div className="mt-4">
              <Label htmlFor="file-input">
                <Button asChild variant="outline">
                  <span>Browse Files</span>
                </Button>
              </Label>
              <Input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={onFileSelect} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Supported: JPG, PNG, GIF, WebP</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Selected ({selectedFiles.length}) • {formatBytes(selectedFiles.reduce((a, f) => a + f.size, 0))}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearSelected} disabled={isUploading}>
                    Clear
                  </Button>
                  <Button onClick={uploadSelected} disabled={isUploading}>
                    {isUploading
                      ? "Uploading..."
                      : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`}
                  </Button>
                </div>
              </div>
              <ul className="max-h-52 overflow-auto divide-y rounded-md border">
                {selectedFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSelected(i)}
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Images</h2>
          <p className="text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? "item" : "items"} • {formatBytes(totalSize)}
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">Loading images...</p>
            </CardContent>
          </Card>
        ) : images.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No images yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upload images above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((img) => (
              <Card key={img.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="shadow"
                      onClick={() => setImageToDelete(img.id)}
                      aria-label={`Delete ${img.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="truncate font-medium" title={img.name}>
                    {img.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatBytes(img.size)}</span>
                    <time dateTime={img.createdAt}>
                      {new Date(img.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image from Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {images.length} images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}