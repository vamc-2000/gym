import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/auth";


export const runtime = "nodejs";

// ✅ GET PROFILE
export async function GET(req: Request) {
  try {
    console.log("AUTH HEADER:", req.headers.get("authorization"));
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return Response.json({ message: "No token" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(decoded.userId).select("-password");

    return Response.json({ user });
  } catch (error) {
    return Response.json({ message: "Error", error }, { status: 500 });
  }
}