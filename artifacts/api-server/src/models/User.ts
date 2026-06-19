import mongoose, { type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "student" | "faculty" | "maintenance" | "admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: UserRole;
  email?: string;
  passwordHash?: string;
  enrollmentNumber?: string;
  collegeName?: string;
  department?: string;
  semester?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  findByEnrollment(enrollmentNumber: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["student", "faculty", "maintenance", "admin"],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    passwordHash: { type: String, select: false },
    enrollmentNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    collegeName: { type: String, trim: true },
    department: { type: String, trim: true },
    semester: { type: Number, min: 1, max: 12 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ enrollmentNumber: 1 }, { sparse: true });
userSchema.index({ role: 1 });

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.findByEnrollment = function (enrollmentNumber: string) {
  return this.findOne({ enrollmentNumber, isActive: true });
};

export function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    email: user.email ?? null,
    enrollmentNumber: user.enrollmentNumber ?? null,
    department: user.department ?? null,
    collegeName: user.collegeName ?? null,
    semester: user.semester ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
