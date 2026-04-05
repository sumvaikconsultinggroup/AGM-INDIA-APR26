import mongoose, { Schema, models, Document } from "mongoose";

export interface IFaceImageDocument extends Document {
  public_id: string;
  name: string;
  url: string;
  format: string;
  size: number;
  face_token: string;

}

const FaceImageSchema = new Schema<IFaceImageDocument>(
  {
    public_id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    format: { type: String, required: true },
    size: { type: Number, required: true },
    face_token: { type: String, required: true },
  },   
  { timestamps: true }
);

export default models.FaceImage || mongoose.model<IFaceImageDocument>("FaceImage", FaceImageSchema);

