 import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string) => {
  console.log("SIGN SECRET:", JWT_SECRET);
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    console.log("VERIFY SECRET:", JWT_SECRET);   
    console.log("TOKEN:", token);                

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("DECODED:", decoded);          

    return decoded;
  } catch (err: any) {
    console.log("JWT ERROR:", err.message);     
    return null;
  }
};