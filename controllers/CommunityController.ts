import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { communityRepository } from "../repositories/CommunityRepository";
import { friendshipRepository } from "../repositories/FriendshipRepository";
import { notificationService } from "../services/NotificationService";

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
        const like = await communityRepository.likePost(params.id, decoded.userId);
        const post = await communityRepository.getPostById(params.id);
        
        if (post && post.userId !== decoded.userId) {
          await notificationService.triggerSocialNotification({
            receiverId: post.userId,
            senderName: decoded.name || "A user",
            type: "POST_LIKE",
            relatedId: post.id
          });
        }
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
      const post = await communityRepository.getPostById(params.id);

      if (post && post.userId !== decoded.userId) {
        await notificationService.triggerSocialNotification({
          receiverId: post.userId,
          senderName: decoded.name || "A user",
          type: "POST_COMMENT",
          relatedId: post.id,
          extraText: content
        });
      }

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

  async searchHashtags(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    if (!tag) return NextResponse.json({ error: "Tag is required" }, { status: 400 });

    try {
      const posts = await communityRepository.searchByHashtag(tag, decoded.userId);
      return NextResponse.json({ success: true, data: posts });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async getTrending(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const trending = await communityRepository.getTrendingHashtags();
      return NextResponse.json({ success: true, data: trending });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  // --- Story Handlers ---

  async getStories(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const friendIds = await friendshipRepository.getFriendIds(decoded.userId);
      const stories = await communityRepository.getStories(decoded.userId, friendIds);
      return NextResponse.json({ success: true, data: stories });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async createStory(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { mediaUrl, mediaType } = await req.json();
      const story = await communityRepository.createStory(decoded.userId, mediaUrl, mediaType);
      return NextResponse.json({ success: true, data: story });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const communityController = new CommunityController();
