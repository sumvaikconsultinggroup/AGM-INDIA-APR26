// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useState } from "react";
// import { Button } from "@/src/components/ui/button";
// import { Input } from "@/src/components/ui/input";
// import { Label } from "@/src/components/ui/label";
// import { Textarea } from "@/src/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/src/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
// import { Upload, MapPin, AlertTriangle } from "lucide-react";
// import { registrationSchema } from "@/lib/validation";
// import Image from "next/image";
// import AdminPanel from "@/components/admin-panel";

// export default function DikshRegistrationForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitMessage, setSubmitMessage] = useState("");
//   const [whatsappStatus, setWhatsappStatus] = useState(null);
//   const [fileUploads, setFileUploads] = useState({
//     aadhaarDocument: null,
//     recentPhoto: null,
//     referenceLetter: null,
//   });

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//     reset,
//   } = useForm({
//     resolver: zodResolver(registrationSchema),
//   });

//   const handleFileUpload = async (file, type) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         const { url } = await response.json();
//         setFileUploads((prev) => ({ ...prev, [type]: url }));
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//     }
//   };

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     setSubmitMessage("");

//     try {
//       const response = await fetch("/api/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           formData: data,
//           aadhaarDocumentUrl: fileUploads.aadhaarDocument,
//           recentPhotoUrl: fileUploads.recentPhoto,
//           referenceLetterUrl: fileUploads.referenceLetter,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setSubmitMessage("Registration submitted successfully!");
//         setWhatsappStatus(
//           result.whatsappSent ? "WhatsApp confirmation sent!" : "Registration complete"
//         );
//         reset();
//         setFileUploads({
//           aadhaarDocument: null,
//           recentPhoto: null,
//           referenceLetter: null,
//         });
//       } else {
//         setSubmitMessage(result.error || "Registration failed");
//       }
//     } catch (error) {
//       setSubmitMessage("Registration failed. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">
//       {/* Header Section */}
//       <div className="bg-gradient-to-r from-orange-200 to-orange-300 p-8 rounded-b-3xl">
//         <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
//           <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
//             <Image
//               src="/guru-image.png"
//               alt="Swami Ardheshanand Giri Ji"
//               fill
//               className="object-cover"
//             />
//           </div>
//           <div className="text-center md:text-left">
//             <blockquote className="text-lg italic text-gray-700 mb-4">
//               "The Guru lights the lamp of wisdom in the heart of the disciple."
//             </blockquote>
//             <p className="text-sm text-gray-600 mb-6">—Swami Ardheshanand Giri Ji</p>

//             <h1 className="text-4xl font-bold text-gray-800 mb-2">
//               Join <em>for</em> Diksha
//             </h1>
//             <p className="text-xl text-gray-700 mb-1">10th July 2025</p>
//             <p className="text-lg text-gray-600 mb-4">Kankhal Ashram, Hardwar</p>

//             <div className="flex items-center gap-2 text-red-600 mb-4">
//               <AlertTriangle size={20} />
//               <span className="text-sm">Please note: This diksha is offered only in person.</span>
//             </div>

//             <Button variant="outline" className="bg-white">
//               <MapPin className="mr-2 h-4 w-4" />
//               Ashram Location on Map
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Registration Form */}
//       <div className="max-w-4xl mx-auto p-6">
//         <Card className="shadow-xl">
//           <CardHeader>
//             <CardTitle className="text-2xl text-gray-800">Registration Form</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//               {/* Personal Details */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Personal Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="fullName">Full Name</Label>
//                     <Input
//                       id="fullName"
//                       {...register("fullName")}
//                       className={errors.fullName ? "border-red-500" : ""}
//                     />
//                     {errors.fullName && (
//                       <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="dateOfBirth">Date of Birth</Label>
//                     <Input
//                       id="dateOfBirth"
//                       type="date"
//                       {...register("dateOfBirth")}
//                       className={errors.dateOfBirth ? "border-red-500" : ""}
//                     />
//                     {errors.dateOfBirth && (
//                       <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="gender">Gender</Label>
//                     <Select onValueChange={(value) => setValue("gender", value)}>
//                       <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
//                         <SelectValue placeholder="Select gender" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Male">Male</SelectItem>
//                         <SelectItem value="Female">Female</SelectItem>
//                         <SelectItem value="Other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     {errors.gender && (
//                       <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="nationality">Nationality</Label>
//                     <Input
//                       id="nationality"
//                       {...register("nationality")}
//                       className={errors.nationality ? "border-red-500" : ""}
//                     />
//                     {errors.nationality && (
//                       <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Contact Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="mobileNumber">Mobile Number (with country code)</Label>
//                     <Input
//                       id="mobileNumber"
//                       placeholder="Mobile Number"
//                       {...register("mobileNumber")}
//                       className={errors.mobileNumber ? "border-red-500" : ""}
//                     />
//                     {errors.mobileNumber && (
//                       <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
//                     <Input
//                       id="aadhaarNumber"
//                       placeholder="Aadhaar Number"
//                       {...register("aadhaarNumber")}
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
//                     <Input
//                       id="whatsappNumber"
//                       placeholder="Email Address"
//                       {...register("whatsappNumber")}
//                     />
//                   </div>

//                   <div>
//                     <Label>Upload Aadhaar</Label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                       <input
//                         type="file"
//                         accept="image/*,.pdf"
//                         onChange={(e) => {
//                           const file = e.target.files && e.target.files[0];
//                           if (file) handleFileUpload(file, "aadhaarDocument");
//                         }}
//                         className="hidden"
//                         id="aadhaar-upload"
//                       />
//                       <label htmlFor="aadhaar-upload" className="cursor-pointer">
//                         <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//                         <span className="text-sm text-gray-600">Upload (T/d.Lo image)</span>
//                       </label>
//                       {fileUploads.aadhaarDocument && (
//                         <p className="text-green-600 text-sm mt-2">✓ File uploaded</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Spiritual Intent */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Spiritual Intent</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="spiritualIntent">
//                       Why do you wish to receive Mantra Diksha?
//                     </Label>
//                     <Textarea
//                       id="spiritualIntent"
//                       {...register("spiritualIntent")}
//                       className={errors.spiritualIntent ? "border-red-500" : ""}
//                       rows={3}
//                     />
//                     {errors.spiritualIntent && (
//                       <p className="text-red-500 text-sm mt-1">{errors.spiritualIntent.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <Label htmlFor="spiritualPath">Do you follow a spiritual path or Guru?</Label>
//                     <Textarea id="spiritualPath" {...register("spiritualPath")} rows={3} />
//                   </div>

//                   <div>
//                     <Label htmlFor="previousDiksha">Have you received diksha before?</Label>
//                     <Textarea id="previousDiksha" {...register("previousDiksha")} rows={3} />
//                   </div>
//                 </div>
//               </div>

//               {/* Optional Uploads */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-700">Optional Uploads</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Upload Recent Photo</Label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                           const file = e.target.files && e.target.files[0];
//                           if (file) handleFileUpload(file, "recentPhoto");
//                         }}
//                         className="hidden"
//                         id="photo-upload"
//                       />
//                       <label htmlFor="photo-upload" className="cursor-pointer">
//                         <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//                         <span className="text-sm text-gray-600">Upload (PF A000)</span>
//                       </label>
//                       {fileUploads.recentPhoto && (
//                         <p className="text-green-600 text-sm mt-2">✓ Photo uploaded</p>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Upload Any Reference Letter (if any)</Label>
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                       <input
//                         type="file"
//                         accept=".pdf,.doc,.docx,image/*"
//                         onChange={(e) => {
//                           const file = e.target.files && e.target.files[0];
//                           if (file) handleFileUpload(file, "referenceLetter");
//                         }}
//                         className="hidden"
//                         id="reference-upload"
//                       />
//                       <label htmlFor="reference-upload" className="cursor-pointer">
//                         <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//                         <span className="text-sm text-gray-600">Choose file</span>
//                       </label>
//                       {fileUploads.referenceLetter && (
//                         <p className="text-green-600 text-sm mt-2">✓ Reference uploaded</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
