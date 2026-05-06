import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { communityRepository } from "../repositories/CommunityRepository";
import { friendshipRepository } from "../repositories/FriendshipRepository";

export class CommunityController {
  async getFeed(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const friendIds = await friendshipRepository.getFriendIds(decoded.userId);
      const feed = await communityRepository.getFeed(decoded.userId, friendIds);
      return NextResponse.json({ success: true, data: feed });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async createPost(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const post = await communityRepository.createPost({
        userId: decoded.userId,
        ...body
      });
      return NextResponse.json({ success: true, data: post });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async deletePost(req: NextRequest, { params }: { params: { id: string } }) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      await communityRepository.deletePost(params.id, decoded.userId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async likePost(req: NextRequest, { params }: { params: { id: string } }) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { unlike } = await req.json();
      if (unlike) {
        await communityRepository.unlikePost(params.id, decoded.userId);
      } else {
        await communityRepository.likePost(params.id, decoded.userId);
      }
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async addComment(req: NextRequest, { params }: { params: { id: string } }) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { content } = await req.json();
      const comment = await communityRepository.addComment(params.id, decoded.userId, content);
      return NextResponse.json({ success: true, data: comment });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getComments(req: NextRequest, { params }: { params: { id: string } }) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const post = await communityRepository.getPostById(params.id);
      return NextResponse.json({ success: true, data: post?.comments || [] });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const communityController = new CommunityController();
