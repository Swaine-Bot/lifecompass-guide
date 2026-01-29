import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, UserPlus, Heart, MessageCircle, Share2, Send, Image, 
  Video, MoreHorizontal, X, Check, Clock, Search, ThumbsUp,
  Sparkles, Star, Lightbulb, HandHeart, Trophy, Bot, ExternalLink,
  AlertTriangle, Loader2, Trash2, ChevronUp, ChevronDown, Edit, Pencil, Mail
} from 'lucide-react';
import { InviteFriends } from '@/components/community/InviteFriends';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Friend {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  status: 'pending' | 'accepted';
  is_requester: boolean;
}

interface SearchResult {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  life_phase: string | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  visibility: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  reactions_count: number;
  comments_count: number;
  user_reaction?: string | null;
  // AI analysis stored with the post
  ai_feedback?: PostAnalysis | null;
  // Whether this user allows friends to see AI insights
  show_ai_insights_to_friends?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

interface OpportunitySuggestion {
  category: string;
  title: string;
  description: string;
  searchQuery: string;
}

interface PostAnalysis {
  approved: boolean;
  mentorComment: string;
  opportunities: OpportunitySuggestion[];
  flagReason?: string;
}

const REACTION_TYPES = [
  { type: 'like', icon: ThumbsUp, label: 'Like' },
  { type: 'love', icon: Heart, label: 'Love' },
  { type: 'celebrate', icon: Trophy, label: 'Celebrate' },
  { type: 'support', icon: HandHeart, label: 'Support' },
  { type: 'insightful', icon: Lightbulb, label: 'Insightful' },
];

export default function Community() {
  const { user, profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postAnalysis, setPostAnalysis] = useState<PostAnalysis | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostVisibility, setEditPostVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false);
  const [expandedFeedbackPostId, setExpandedFeedbackPostId] = useState<string | null>(null);
  const [loadingFeedbackPostId, setLoadingFeedbackPostId] = useState<string | null>(null);
  const [postFeedbacks, setPostFeedbacks] = useState<Record<string, PostAnalysis>>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPosts();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        status
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (data) {
      const friendPromises = data.map(async (f) => {
        const friendUserId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        // Use profiles_public view to protect sensitive data (location, etc.)
        const { data: profileData } = await supabase
          .from('profiles_public')
          .select('name, avatar_url')
          .eq('user_id', friendUserId)
          .single();

        return {
          id: f.id,
          user_id: friendUserId,
          name: profileData?.name || 'Unknown',
          avatar_url: profileData?.avatar_url,
          status: f.status as 'pending' | 'accepted',
          is_requester: f.requester_id === user.id
        };
      });

      const friendsList = await Promise.all(friendPromises);
      setFriends(friendsList);
    }
  };

  const fetchPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const postsWithDetails = await Promise.all(data.map(async (post) => {
        // Use profiles_public view to protect sensitive data (location, etc.)
        const { data: profileData } = await supabase
          .from('profiles_public')
          .select('name, avatar_url')
          .eq('user_id', post.user_id)
          .single();

        // Check if user allows AI insights to be shown to friends
        const { data: privacyData } = await supabase
          .from('privacy_settings')
          .select('show_ai_insights_to_friends')
          .eq('user_id', post.user_id)
          .maybeSingle();

        const { count: reactionsCount } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { data: userReaction } = await supabase
          .from('reactions')
          .select('reaction')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle();

        // Generate signed URLs for media (handles private bucket)
        const rawMediaUrls = (post.media_urls as string[]) || [];
        const signedMediaUrls = await generateSignedUrls(rawMediaUrls);

        return {
          ...post,
          media_urls: signedMediaUrls,
          user_name: profileData?.name || 'Unknown',
          user_avatar: profileData?.avatar_url,
          reactions_count: reactionsCount || 0,
          comments_count: commentsCount || 0,
          user_reaction: userReaction?.reaction || null,
          show_ai_insights_to_friends: privacyData?.show_ai_insights_to_friends ?? true
        };
      }));

      setPosts(postsWithDetails);
    }
  };

  // Generate signed URLs for private bucket media
  const generateSignedUrls = async (urls: string[]): Promise<string[]> => {
    if (urls.length === 0) return [];
    
    const signedUrls: string[] = [];
    
    for (const url of urls) {
      // Check if this is a Supabase storage URL
      if (url.includes('/storage/v1/') && url.includes('user-media')) {
        try {
          // Extract the file path from the URL
          const pathMatch = url.match(/user-media\/([^?]+)/);
          if (pathMatch) {
            const filePath = decodeURIComponent(pathMatch[1]);
            const { data, error } = await supabase.storage
              .from('user-media')
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            if (!error && data) {
              signedUrls.push(data.signedUrl);
              continue;
            }
          }
        } catch (e) {
          console.error('Error creating signed URL:', e);
        }
      }
      // If not a storage URL or signing failed, use original
      signedUrls.push(url);
    }
    
    return signedUrls;
  };

  // Live search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!user || searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      
      // Get existing friendships to exclude
      const { data: existingFriendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const excludedIds = new Set<string>([user.id]);
      existingFriendships?.forEach(f => {
        excludedIds.add(f.requester_id);
        excludedIds.add(f.addressee_id);
      });

      // Broad case-insensitive search - search for any part of the name
      // Use profiles_searchable view which bypasses RLS for friend discovery
      const searchTerm = searchQuery.trim().toLowerCase();
      const { data: profiles } = await supabase
        .from('profiles_searchable')
        .select('user_id, name, avatar_url, life_phase')
        .ilike('name', `%${searchTerm}%`)
        .limit(20);

      if (profiles) {
        const filtered = profiles.filter(p => p.user_id && !excludedIds.has(p.user_id));
        setSearchResults(filtered as SearchResult[]);
        setShowSearchResults(filtered.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }

      setIsSearching(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectUserForRequest = (userResult: SearchResult) => {
    setSelectedUser(userResult);
    setSearchQuery(userResult.name || '');
    setShowSearchResults(false);
  };

  const sendFriendRequest = async () => {
    if (!user || !selectedUser) return;
    setLoading(true);

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: selectedUser.user_id,
      status: 'pending'
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Friend request already sent');
      } else {
        toast.error('Failed to send friend request');
      }
    } else {
      toast.success(`Friend request sent to ${selectedUser.name}!`);
      setSearchQuery('');
      setSelectedUser(null);
      fetchFriends();
    }

    setLoading(false);
  };

  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    const status = accept ? 'accepted' : 'declined';
    
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);

    if (error) {
      toast.error('Failed to respond to request');
    } else {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
      fetchFriends();
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // First delete related reactions
      await supabase.from('reactions').delete().eq('post_id', postId);
      
      // Delete related comments
      await supabase.from('comments').delete().eq('post_id', postId);
      
      // Delete the post
      const { error } = await supabase.from('posts').delete().eq('id', postId);

      if (error) {
        throw error;
      }

      toast.success('Post deleted successfully');
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const openEditPost = (post: Post) => {
    setEditingPost(post);
    setEditPostContent(post.content || '');
    setEditPostVisibility(post.visibility as 'public' | 'friends' | 'private');
  };

  const saveEditedPost = async () => {
    if (!editingPost || !user) return;
    setIsSavingPostEdit(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: editPostContent,
          visibility: editPostVisibility,
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      toast.success('Post updated');
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update post');
    } finally {
      setIsSavingPostEdit(false);
    }
  };

  // File upload validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total per post
  const MAX_FILES_PER_POST = 10;
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ];
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File "${file.name}" exceeds 10MB limit` };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: `File "${file.name}" has unsupported format. Allowed: images and videos` };
    }

    // Validate extension (defense in depth)
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, error: `File "${file.name}" has invalid extension` };
    }

    return { valid: true };
  };

  const sanitizeFileName = (fileName: string): string => {
    // Extract extension safely
    const parts = fileName.split('.');
    const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
    
    // Only allow safe extensions
    const safeExtension = ALLOWED_EXTENSIONS.includes(extension || '') ? extension : 'bin';
    
    return safeExtension || 'bin';
  };

  const uploadMedia = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    // Validate total number of files
    if (files.length > MAX_FILES_PER_POST) {
      toast.error(`Maximum ${MAX_FILES_PER_POST} files allowed per post`);
      return [];
    }

    // Validate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error('Total file size exceeds 50MB limit');
      return [];
    }

    // Validate each file
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return [];
      }
    }
    
    for (const file of files) {
      const safeExtension = sanitizeFileName(file.name);
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${safeExtension}`;
      
      const { error, data } = await supabase.storage
        .from('user-media')
        .upload(fileName, file);

      if (!error && data) {
        // Use signed URL for private bucket (1 hour expiry)
        const { data: urlData, error: urlError } = await supabase.storage
          .from('user-media')
          .createSignedUrl(data.path, 3600);
        
        if (!urlError && urlData) {
          urls.push(urlData.signedUrl);
        }
      } else if (error) {
        // Handle storage-level validation errors
        if (error.message?.includes('mime') || error.message?.includes('type')) {
          toast.error(`File type not allowed: ${file.name}`);
        } else if (error.message?.includes('size')) {
          toast.error(`File too large: ${file.name}`);
        } else {
          toast.error(`Failed to upload: ${file.name}`);
        }
        console.error('Upload error:', error);
      }
    }
    
    return urls;
  };


  // Analyze post content with AI before posting
  const analyzePostContent = async (content: string, mediaUrls: string[]): Promise<PostAnalysis | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-post-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            content,
            mediaUrls,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error('AI analysis rate limited. Please try again in a moment.');
          return null;
        }
        throw new Error(errorData.error || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Post analysis error:', error);
      // Don't block posting if analysis fails - just skip it
      return {
        approved: true,
        mentorComment: '',
        opportunities: []
      };
    }
  };

  const createPost = async () => {
    if (!user || (!newPostContent && selectedFiles.length === 0)) return;
    setLoading(true);
    setIsAnalyzing(true);

    try {
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadMedia(selectedFiles);
        if (mediaUrls.length === 0 && selectedFiles.length > 0) {
          // Upload failed
          setLoading(false);
          setIsAnalyzing(false);
          return;
        }
      }

      // Analyze content with AI
      const analysis = await analyzePostContent(newPostContent, mediaUrls);
      setIsAnalyzing(false);

      if (analysis) {
        if (!analysis.approved) {
          // Content was flagged
          setPostAnalysis(analysis);
          setShowAnalysisResult(true);
          setLoading(false);
          return;
        }

        // Store analysis for display
        setPostAnalysis(analysis);
      }

      // Create the post
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPostContent,
        media_urls: mediaUrls,
        visibility: newPostVisibility
      });

      if (error) throw error;

      // Show success with mentor comment if available
      if (analysis?.mentorComment) {
        setShowAnalysisResult(true);
      } else {
        toast.success('Post created!');
        resetPostForm();
      }

      fetchPosts();
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error('Failed to create post');
      resetPostForm();
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const resetPostForm = () => {
    setNewPostContent('');
    setSelectedFiles([]);
    setShowNewPost(false);
    setPostAnalysis(null);
    setShowAnalysisResult(false);
  };

  const closeAnalysisAndReset = () => {
    if (postAnalysis?.approved) {
      resetPostForm();
    } else {
      setShowAnalysisResult(false);
      setPostAnalysis(null);
    }
  };

  // Fetch or toggle AI feedback for a post when tapping on its image
  const togglePostFeedback = async (post: Post) => {
    // If already expanded, collapse it
    if (expandedFeedbackPostId === post.id) {
      setExpandedFeedbackPostId(null);
      return;
    }

    // Check if the post owner allows AI insights for friends (always allow for own posts)
    const isOwnPost = post.user_id === user?.id;
    if (!isOwnPost && !post.show_ai_insights_to_friends) {
      toast.info('This user has disabled AI insights sharing');
      return;
    }

    // If we already have feedback cached, just expand
    if (postFeedbacks[post.id]) {
      setExpandedFeedbackPostId(post.id);
      return;
    }

    // Fetch AI feedback for this post
    setLoadingFeedbackPostId(post.id);
    setExpandedFeedbackPostId(post.id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      // Generate signed URLs for media to send to AI
      const signedUrls = await generateSignedUrls(post.media_urls);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-post-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            content: post.content,
            mediaUrls: signedUrls,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysis: PostAnalysis = await response.json();
      
      // Cache the feedback
      setPostFeedbacks(prev => ({
        ...prev,
        [post.id]: analysis
      }));
    } catch (error) {
      console.error('Failed to get AI feedback:', error);
      toast.error('Failed to load AI feedback');
      setExpandedFeedbackPostId(null);
    } finally {
      setLoadingFeedbackPostId(null);
    }
  };

  const toggleReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const validReaction = reactionType as 'like' | 'love' | 'celebrate' | 'support' | 'insightful';
    
    if (post.user_reaction === reactionType) {
      // Remove reaction
      await supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', user.id);
    } else if (post.user_reaction) {
      // Update reaction
      await supabase.from('reactions').update({ reaction: validReaction }).eq('post_id', postId).eq('user_id', user.id);
    } else {
      // Add reaction
      await supabase.from('reactions').insert([{
        post_id: postId,
        user_id: user.id,
        reaction: validReaction
      }]);
    }

    fetchPosts();
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      const commentsWithUsers = await Promise.all(data.map(async (comment) => {
        // Use profiles_public view to protect sensitive data (location, etc.)
        const { data: profileData } = await supabase
          .from('profiles_public')
          .select('name, avatar_url')
          .eq('user_id', comment.user_id)
          .single();

        return {
          ...comment,
          user_name: profileData?.name || 'Unknown',
          user_avatar: profileData?.avatar_url
        };
      }));
      setComments(commentsWithUsers);
    }
  };

  const addComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      post_id: selectedPost.id,
      user_id: user.id,
      content: newComment.trim()
    });

    if (!error) {
      setNewComment('');
      fetchComments(selectedPost.id);
      fetchPosts();
    }
  };

  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.is_requester);
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Community</h1>
          <p className="text-muted-foreground">Connect with friends and family</p>
        </div>
        <Button variant="gold" onClick={() => setShowNewPost(true)}>
          <Share2 className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="friends" className="relative">
            Friends
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          {posts.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with friends and start sharing your journey
                </p>
                <Button variant="gold" onClick={() => setShowNewPost(true)}>
                  Create your first post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} variant="glass">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.user_avatar || undefined} />
                      <AvatarFallback>{post.user_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        
                        {post.user_id === user?.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => openEditPost(post)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setPostToDelete(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {post.content && (
                        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                      )}
                      
                      {post.media_urls.length > 0 && (
                        <div className="mb-3">
                          <div 
                            className={`grid gap-2 cursor-pointer ${post.media_urls.length > 1 ? 'grid-cols-2' : ''}`}
                            onClick={() => togglePostFeedback(post)}
                          >
                            {post.media_urls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={url}
                                  alt=""
                                  className="rounded-lg w-full object-cover max-h-64 transition-all group-hover:opacity-90"
                                />
                                {/* Always visible overlay prompt */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                                    <Bot className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">Tap for AI insights</span>
                                  </div>
                                </div>
                                {/* Small badge indicator always visible */}
                                <div className="absolute bottom-2 right-2">
                                  <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs shadow-sm">
                                    <Bot className="w-3 h-3 text-primary" />
                                    <Sparkles className="w-3 h-3 text-primary" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Inline AI Feedback Expansion */}
                          {expandedFeedbackPostId === post.id && (
                            <div className="mt-3 animate-fade-in">
                              {loadingFeedbackPostId === post.id ? (
                                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">Analyzing content...</span>
                                </div>
                              ) : postFeedbacks[post.id] ? (
                                <Collapsible open={true}>
                                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                                    {/* Mentor Comment */}
                                    {postFeedbacks[post.id].mentorComment && (
                                      <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                          <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-medium text-primary mb-1">AI Mentor</p>
                                          <p className="text-sm">{postFeedbacks[post.id].mentorComment}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Opportunities */}
                                    {postFeedbacks[post.id].opportunities?.length > 0 && (
                                      <CollapsibleContent className="space-y-2 pt-2 border-t border-border/30">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                          <Lightbulb className="w-3 h-3" />
                                          Opportunities Spotted
                                        </div>
                                        {postFeedbacks[post.id].opportunities.map((opp, idx) => (
                                          <div key={idx} className="p-3 bg-background/50 rounded-lg">
                                            <div className="flex items-start justify-between gap-2">
                                              <div>
                                                <p className="text-sm font-medium">{opp.title}</p>
                                                <p className="text-xs text-muted-foreground">{opp.description}</p>
                                              </div>
                                              <a
                                                href={`https://www.google.com/search?q=${encodeURIComponent(opp.searchQuery)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            </div>
                                          </div>
                                        ))}
                                      </CollapsibleContent>
                                    )}
                                    
                                    {/* Collapse Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedFeedbackPostId(null);
                                      }}
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center pt-2"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                      Hide AI feedback
                                    </button>
                                  </div>
                                </Collapsible>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1">
                          {REACTION_TYPES.map(({ type, icon: Icon }) => (
                            <button
                              key={type}
                              onClick={() => toggleReaction(post.id, type)}
                              className={`p-1.5 rounded-full transition-colors ${
                                post.user_reaction === type 
                                  ? 'bg-primary/20 text-primary' 
                                  : 'hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                          {post.reactions_count > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              {post.reactions_count}
                            </span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => {
                            setSelectedPost(post);
                            fetchComments(post.id);
                          }}
                          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{post.comments_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          {/* Invite Friends - Not on the app yet */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Invite Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Know someone who would love LifeStack? Invite them via email or WhatsApp!
              </p>
              <InviteFriends userName={profile?.name || 'A friend'} />
            </CardContent>
          </Card>

          {/* Add Friend - Already on the app */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Find Friends on LifeStack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1" ref={searchContainerRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                        setShowSearchResults(true);
                      }
                    }}
                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                    className="pl-9"
                  />
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-fade-in">
                      {isSearching ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <button
                            key={result.user_id}
                            onClick={() => selectUserForRequest(result)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={result.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {result.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{result.name || 'Unknown'}</p>
                              {result.life_phase && (
                                <p className="text-xs text-muted-foreground capitalize">
                                  {result.life_phase.replace(/_/g, ' ')}
                                </p>
                              )}
                            </div>
                            <UserPlus className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ))
                      ) : searchQuery.length >= 2 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No users found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  disabled={isSearching || searchQuery.trim().length < 2}
                  className="shrink-0"
                >
                  <Search className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="gold" 
                  onClick={sendFriendRequest} 
                  disabled={loading || !selectedUser}
                  className="shrink-0"
                >
                  {selectedUser ? <Send className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Selected User Indicator */}
              {selectedUser && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-primary/10 rounded-lg animate-fade-in">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm font-medium">{selectedUser.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedUser(null);
                      setSearchQuery('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{friend.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{friend.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="gold" onClick={() => respondToRequest(friend.id, true)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => respondToRequest(friend.id, false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Friends ({acceptedFriends.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedFriends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No friends yet. Start by sending a friend request!
                </p>
              ) : (
                <div className="space-y-3">
                  {acceptedFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>{friend.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{friend.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Share something with your community</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={newPostVisibility} onValueChange={(v) => setNewPostVisibility(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="gold" 
                  onClick={createPost} 
                  disabled={loading || isAnalyzing || (!newPostContent && selectedFiles.length === 0)}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Result Dialog */}
      <Dialog open={showAnalysisResult} onOpenChange={closeAnalysisAndReset}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {postAnalysis?.approved ? (
                  <>
                    <Bot className="w-5 h-5 text-primary" />
                    AI Mentor Feedback
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Content Not Approved
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              {postAnalysis?.approved 
                ? "Your post has been shared! Here's what the AI Mentor noticed."
                : "This content couldn't be posted."}
            </DialogDescription>
          </DialogHeader>
          
          <Collapsible open={feedbackExpanded} onOpenChange={setFeedbackExpanded}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {feedbackExpanded ? 'Mentor feedback & suggestions' : 'Click to expand feedback'}
              </span>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  {feedbackExpanded ? (
                    <>Hide <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Show <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-4">
              {!postAnalysis?.approved && postAnalysis?.flagReason && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{postAnalysis.flagReason}</AlertDescription>
                </Alert>
              )}
              
              {postAnalysis?.mentorComment && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-primary mb-1">AI Mentor says:</p>
                      <p className="text-sm">{postAnalysis.mentorComment}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {postAnalysis?.opportunities && postAnalysis.opportunities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Opportunities Spotted
                  </h4>
                  {postAnalysis.opportunities.map((opp, idx) => (
                    <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{opp.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {opp.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/search?q=${encodeURIComponent(opp.searchQuery)}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Find {opp.category} Near You
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          <div className="flex justify-end pt-2">
            <Button variant="gold" onClick={closeAnalysisAndReset}>
              {postAnalysis?.approved ? 'Done' : 'Edit Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>View and add comments</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user_avatar || undefined} />
                    <AvatarFallback>{comment.user_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/30 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-border/30">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
            />
            <Button variant="gold" onClick={addComment} disabled={!newComment.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && deletePost(postToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Update your post content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              rows={4}
            />
            <div>
              <Label>Visibility</Label>
              <Select value={editPostVisibility} onValueChange={(v) => setEditPostVisibility(v as 'public' | 'friends' | 'private')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
            <Button onClick={saveEditedPost} disabled={isSavingPostEdit}>
              {isSavingPostEdit ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
