import { create } from 'zustand';

export interface StoryUser {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  user?: StoryUser;
  views?: any[];
}

export interface GroupedStories {
  userId: string;
  user: StoryUser;
  stories: Story[];
  hasUnseen: boolean;
}

interface StoryStoreState {
  isOpen: boolean;
  groupedStories: GroupedStories[];
  initialUserIndex: number;
  initialStoryIndex: number;
  openViewer: (userIndex: number, storyIndex?: number) => void;
  closeViewer: () => void;
  setGroupedStories: (groups: GroupedStories[]) => void;
  addStory: (story: Story, currentUser: any) => void;
  removeStory: (storyId: string) => void;
  markGroupAsSeen: (userIndex: number) => void;
}

export const useStoryStore = create<StoryStoreState>((set: any) => ({
  isOpen: false,
  groupedStories: [],
  initialUserIndex: 0,
  initialStoryIndex: 0,
  openViewer: (userIndex: number, storyIndex = 0) => set({
    isOpen: true,
    initialUserIndex: userIndex,
    initialStoryIndex: storyIndex
  }),
  closeViewer: () => set({ isOpen: false }),
  setGroupedStories: (groups: GroupedStories[]) => set({ groupedStories: groups }),
  addStory: (story: Story, currentUser: any) => set((state: StoryStoreState) => {
    const newGroups = [...state.groupedStories];
    const userIndex = newGroups.findIndex(g => g.userId === currentUser.id);
    
    if (userIndex >= 0) {
      // Add to existing group
      newGroups[userIndex].stories.push(story);
      newGroups[userIndex].hasUnseen = false; // It's their own story
      
      // Move this user's group to the front since it's the newest
      const group = newGroups.splice(userIndex, 1)[0];
      newGroups.unshift(group);
    } else {
      // Create new group
      newGroups.unshift({
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          name: currentUser.name || "You",
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        stories: [story],
        hasUnseen: false
      });
    }
    return { groupedStories: newGroups };
  }),
  removeStory: (storyId: string) => set((state: StoryStoreState) => {
    let newGroups = [...state.groupedStories];
    let userIdxToUpdate = -1;
    
    for (let i = 0; i < newGroups.length; i++) {
      const g = newGroups[i];
      const sIdx = g.stories.findIndex(s => s.id === storyId);
      if (sIdx >= 0) {
        g.stories.splice(sIdx, 1);
        userIdxToUpdate = i;
        break;
      }
    }
    
    // Remove group if empty
    if (userIdxToUpdate >= 0 && newGroups[userIdxToUpdate].stories.length === 0) {
      newGroups.splice(userIdxToUpdate, 1);
    }
    
    return { groupedStories: newGroups };
  }),
  markGroupAsSeen: (userIndex: number) => set((state: StoryStoreState) => {
    const newGroups = [...state.groupedStories];
    if (newGroups[userIndex]) {
      newGroups[userIndex].hasUnseen = false;
    }
    return { groupedStories: newGroups };
  })
}));
