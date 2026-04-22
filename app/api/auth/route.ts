import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";


export const runtime = "nodejs";

// ✅ SIGNUP
export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password, goal } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      goal,
    });

    const token = generateToken(user._id.toString());

    return Response.json({ user, token });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}

// ✅ LOGIN
export async function PUT(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user._id.toString());

    return Response.json({ user, token });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}