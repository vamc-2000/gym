import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export class CommunityRepository {
  async createPost(data: {
    userId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    privacy?: string;
  }) {
    return await prisma.communityPost.create({
      data: {
        userId: data.userId,
        content: data.content,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || "none",
        privacy: data.privacy || "public",
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
          { privacy: "public" },
          { 
            AND: [
              { privacy: "private" },
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
        data: { postId, userId, content },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      await tx.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });
      return comment;
    });
  }

  async searchByHashtag(tag: string, userId: string) {
    return await prisma.communityPost.findMany({
      where: {
        content: { contains: tag },
        OR: [
          { privacy: "public" },
          { userId }
        ]
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getTrendingHashtags() {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const posts = await prisma.communityPost.findMany({
      where: { createdAt: { gte: lastWeek } },
      select: { content: true }
    });

    const tags: Record<string, number> = {};
    posts.forEach(post => {
      const found = post.content.match(/#[a-zA-Z0-9]+/g);
      if (found) {
        found.forEach(tag => {
          const t = tag.toLowerCase();
          tags[t] = (tags[t] || 0) + 1;
        });
      }
    });

    return Object.entries(tags)
      .map(([tag, count]) => ({ tag: tag.replace("#", ""), posts: count }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 10);
  }

  // --- Story Methods ---

  async createStory(userId: string, mediaUrl: string, mediaType: string = "image") {
    return await prisma.story.create({
      data: {
        userId,
        mediaUrl,
        mediaType,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async getStories(userId: string, friendIds: string[]) {
    return await prisma.story.findMany({
      where: {
        OR: [
          { userId },
          { userId: { in: friendIds } }
        ],
        expiresAt: { gte: new Date() }
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            userProfile: {
              select: { avatar: true, username: true }
            } 
          }
        },
        views: {
          where: { userId }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async markStoryViewed(storyId: string, userId: string) {
    try {
      return await prisma.storyView.upsert({
        where: {
          storyId_userId: { storyId, userId }
        },
        update: {},
        create: { storyId, userId }
      });
    } catch (e) {
      // Ignore if it already exists or errors
      return null;
    }
  }

  async deleteStory(storyId: string, userId: string) {
    // Only the user who created the story can delete it
    return await prisma.story.delete({
      where: { 
        id: storyId,
        userId: userId
      },
    });
  }
}

export const communityRepository = new CommunityRepository();
