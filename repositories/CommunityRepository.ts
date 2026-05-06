import { prisma } from "../lib/prisma";
import { MediaType, PostPrivacy, Prisma } from "@prisma/client";

export class CommunityRepository {
  async createPost(data: {
    userId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: MediaType;
    privacy?: PostPrivacy;
  }) {
    return await prisma.communityPost.create({
      data: {
        userId: data.userId,
        content: data.content,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || "TEXT",
        privacy: data.privacy || "PUBLIC",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getFeed(userId: string, friendIds: string[]) {
    return await prisma.communityPost.findMany({
      where: {
        OR: [
          { privacy: "PUBLIC" },
          { 
            AND: [
              { privacy: "PRIVATE" },
              { userId: { in: [userId, ...friendIds] } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPostById(postId: string) {
    return await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, name: true }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  async deletePost(postId: string, userId: string) {
    return await prisma.communityPost.delete({
      where: { id: postId, userId },
    });
  }

  async likePost(postId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const like = await tx.postLike.create({
        data: { postId, userId }
      });
      await tx.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
      return like;
    });
  }

  async unlikePost(postId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.postLike.delete({
        where: { postId_userId: { postId, userId } }
      });
      await tx.communityPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
    });
  }

  async addComment(postId: string, userId: string, content: string) {
    return await prisma.$transaction(async (tx) => {
      const comment = await tx.postComment.create({
        data: { postId, userId, content }
      });
      await tx.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });
      return comment;
    });
  }
}

export const communityRepository = new CommunityRepository();
