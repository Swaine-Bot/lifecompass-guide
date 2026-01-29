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
  Sparkles, Star, Lightbulb, HandHeart, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Friend {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  status: 'pending' | 'accepted';
  is_requester: boolean;
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
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
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
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
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
        const { data: profileData } = await supabase
          .from('profiles')
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
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('user_id', post.user_id)
          .single();

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

        return {
          ...post,
          media_urls: (post.media_urls as string[]) || [],
          user_name: profileData?.name || 'Unknown',
          user_avatar: profileData?.avatar_url,
          reactions_count: reactionsCount || 0,
          comments_count: commentsCount || 0,
          user_reaction: userReaction?.reaction || null
        };
      }));

      setPosts(postsWithDetails);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !searchEmail) return;
    setLoading(true);

    // Find user by email in profiles (we need to look up via auth)
    // For now, we'll search by name
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .ilike('name', `%${searchEmail}%`)
      .neq('user_id', user.id)
      .limit(5);

    if (!profiles || profiles.length === 0) {
      toast.error('No users found with that name');
      setLoading(false);
      return;
    }

    const targetUser = profiles[0];

    const { error } = await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: targetUser.user_id,
      status: 'pending'
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Friend request already sent');
      } else {
        toast.error('Failed to send friend request');
      }
    } else {
      toast.success(`Friend request sent to ${targetUser.name}!`);
      setSearchEmail('');
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
        const { data: urlData } = supabase.storage
          .from('user-media')
          .getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
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

  const createPost = async () => {
    if (!user || (!newPostContent && selectedFiles.length === 0)) return;
    setLoading(true);

    try {
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadMedia(selectedFiles);
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPostContent,
        media_urls: mediaUrls,
        visibility: newPostVisibility
      });

      if (error) throw error;

      toast.success('Post created!');
      setNewPostContent('');
      setSelectedFiles([]);
      setShowNewPost(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
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
        const { data: profileData } = await supabase
          .from('profiles')
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{post.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(post.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      
                      {post.content && (
                        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                      )}
                      
                      {post.media_urls.length > 0 && (
                        <div className={`grid gap-2 mb-3 ${post.media_urls.length > 1 ? 'grid-cols-2' : ''}`}>
                          {post.media_urls.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt=""
                              className="rounded-lg w-full object-cover max-h-64"
                            />
                          ))}
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
          {/* Add Friend */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Friend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="gold" onClick={sendFriendRequest} disabled={loading || !searchEmail}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
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
                
                <Button variant="gold" onClick={createPost} disabled={loading || (!newPostContent && selectedFiles.length === 0)}>
                  Post
                </Button>
              </div>
            </div>
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
    </div>
  );
}
