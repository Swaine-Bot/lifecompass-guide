import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, Download, Copy, Check, Film, FileText, Layout, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logoWhite from '@/assets/lifestack-logo-white-bg.png';

// Morgan Freeman-style narration script
const narrationScript = `
[OPENING - Soft piano, heartbeat sound]

(Warm, deep voice - measured pace)

"From the moment we draw our first breath...
life begins its extraordinary journey."

[SCENE: Infant birth - golden morning light]

"A tiny hand reaches out... 
grasping for a world full of infinite possibility."

[SCENE: Childhood wonder - diverse children learning]

"We stumble. We fall. We rise again.
Each scraped knee... a lesson.
Each new word... a victory."

[MUSIC BUILDS - Strings enter]

[SCENE: School years - graduation caps flying]

"The halls of learning echo with our dreams.
Late nights studying. Early mornings hoping.
And then... that moment of triumph."

[LIQUID GLASS POPUP: "🎓 Goal Complete: Graduate with Honors"]

[SCENE: Young professional - first day at work]

"The first paycheck. The first apartment.
The weight of responsibility...
balanced by the wings of independence."

[LIQUID GLASS POPUP: "💡 Mentor Nudge: Start your emergency fund today"]

[MUSIC: Full orchestra, emotional crescendo]

[SCENE: Love and family - wedding, first home]

"Love finds us when we least expect it.
A partner. A home. A family.
These are not burdens...
they are the treasures we build brick by brick."

[LIQUID GLASS POPUP: "🏠 Milestone: First Home Purchase"]

[SCENE: Middle age - career success, children growing]

"The years teach us what the days never could.
That success is not measured in currency alone...
but in the lives we touch,
the wisdom we share,
the legacy we build."

[LIQUID GLASS POPUP: "📈 Financial Goal: Retirement fund on track"]

[MUSIC: Gentle, reflective - piano returns]

[SCENE: Elder years - sharing wisdom with grandchildren]

"And when the sun begins its gentle descent...
we look back not with regret,
but with the quiet satisfaction of a life fully lived."

[SCENE: Diverse montage - all cultures, all ages]

"Every habit tracked. Every goal achieved.
Every moment captured.
From first steps to final chapters..."

[LOGO REVEAL - LifeStack logo with ethereal glow]

"LifeStack.
Your AI life companion.
Your legacy builder."

[TAGLINE APPEARS]

(Voice deepens with gravitas)

"From your first job...
to your last breath."

[FADE TO BLACK - Logo remains]

[END]
`;

// Complete storyboard
const storyboardScenes = [
  {
    id: 1,
    timestamp: "0:00 - 0:05",
    title: "The First Breath",
    visual: "Extreme close-up: Newborn baby's face in warm golden hospital light. First cry, first breath. Mother's tearful smile in soft focus background.",
    audio: "Soft heartbeat fading into gentle piano. Ambient hospital sounds, muffled.",
    overlay: null,
    emotionalTone: "Wonder, new beginnings",
    cameraWork: "Slow zoom out, shallow DOF, handheld intimacy",
    colorGrade: "Warm golden tones, slight desaturation for timelessness"
  },
  {
    id: 2,
    timestamp: "0:05 - 0:12",
    title: "Childhood Wonder",
    visual: "Montage: Diverse children across cultures - African child learning to read, Asian child painting, Latin American child playing soccer, European child in classroom.",
    audio: "Piano builds, soft strings enter. Children's laughter mixed low.",
    overlay: null,
    emotionalTone: "Innocence, curiosity, global unity",
    cameraWork: "Quick cuts, 2-3 seconds each. Mix of handheld and stabilized.",
    colorGrade: "Bright, saturated colors reflecting childhood vibrancy"
  },
  {
    id: 3,
    timestamp: "0:12 - 0:20",
    title: "The Learning Years",
    visual: "Time-lapse style: Student growing through grades. Books stacking higher. Late night studying. Friends at library. Graduation cap toss in slow motion.",
    audio: "Strings fully enter, building momentum. Crowd cheering fades in.",
    overlay: {
      type: "liquid-glass",
      content: "🎓 Goal Complete: Graduate with Honors",
      position: "center-right",
      timing: "0:18"
    },
    emotionalTone: "Achievement, perseverance, triumph",
    cameraWork: "Dynamic tracking shots, time-lapse, slow-mo for cap toss",
    colorGrade: "Academic warmth, institutional lighting giving way to golden outdoor"
  },
  {
    id: 4,
    timestamp: "0:20 - 0:28",
    title: "First Steps into the World",
    visual: "Young professional: First interview handshake, walking into office building, setting up first desk, receiving first paycheck, moving into first apartment.",
    audio: "Orchestra builds, urban ambience underneath. Hopeful melody.",
    overlay: {
      type: "liquid-glass",
      content: "💡 Mentor Nudge: Start your emergency fund today",
      position: "bottom-left",
      timing: "0:25"
    },
    emotionalTone: "Independence, hope, nervous excitement",
    cameraWork: "Following shots, elevator rising, window reflections of city",
    colorGrade: "Modern, clean, slightly cool shifting to warm in apartment"
  },
  {
    id: 5,
    timestamp: "0:28 - 0:38",
    title: "Love and Legacy",
    visual: "Wedding ceremony (multicultural: Indian, Western, African traditions shown). First home keys. Pregnancy announcement. Baby's first steps. Family dinner table.",
    audio: "Full emotional crescendo. Wedding music blends into tender home themes.",
    overlay: {
      type: "liquid-glass",
      content: "🏠 Milestone: First Home Purchase",
      position: "center",
      timing: "0:33"
    },
    emotionalTone: "Love, commitment, family, continuity",
    cameraWork: "Intimate ceremony shots, warm domestic scenes, circular dolly around dinner table",
    colorGrade: "Rich, warm, romantic golds and soft candlelight"
  },
  {
    id: 6,
    timestamp: "0:38 - 0:48",
    title: "The Building Years",
    visual: "Career success: Corner office, team leadership, mentoring younger colleagues. Children growing: soccer games, recitals, graduations. Financial planning.",
    audio: "Confident, triumphant orchestral. Reflects accumulated wisdom.",
    overlay: {
      type: "liquid-glass",
      content: "📈 Financial Goal: Retirement fund on track",
      position: "top-right",
      timing: "0:44"
    },
    emotionalTone: "Accomplishment, wisdom, guidance",
    cameraWork: "Wider establishing shots, steady confident movement",
    colorGrade: "Mature, rich colors, autumnal warmth"
  },
  {
    id: 7,
    timestamp: "0:48 - 0:55",
    title: "Passing the Torch",
    visual: "Elder sharing wisdom: Grandparent teaching grandchild to fish, reading bedtime stories, walking through family estate, looking at old photos together.",
    audio: "Piano returns, gentle and reflective. Soft strings support.",
    overlay: null,
    emotionalTone: "Legacy, peace, fulfillment",
    cameraWork: "Gentle, reverent movement. Long takes. Golden hour light.",
    colorGrade: "Soft, nostalgic, warm sepia undertones"
  },
  {
    id: 8,
    timestamp: "0:55 - 1:00",
    title: "Logo Reveal & Tagline",
    visual: "LifeStack logo emerges from light particles, coalescing into solid form. Tagline appears below. Subtle background: constellation of life moments.",
    audio: "Final chord resolves. Moment of silence. Deep voice delivers tagline.",
    overlay: {
      type: "tagline",
      content: "From your first job to your last breath",
      position: "center",
      timing: "0:57"
    },
    emotionalTone: "Powerful, reassuring, eternal",
    cameraWork: "Slow push into logo, then hold",
    colorGrade: "Clean, bright, brand colors emerge from warmth"
  }
];

// Free TTS services info
const freeTTSServices = [
  {
    name: "Microsoft Edge TTS",
    url: "https://ttsmp3.com/",
    voiceRecommendation: "Guy (US) or William (UK) - deep, warm voices",
    quality: "High",
    notes: "Free, no signup required. Export as MP3."
  },
  {
    name: "Natural Readers",
    url: "https://www.naturalreaders.com/online/",
    voiceRecommendation: "Mike or James - mature male voices",
    quality: "High",
    notes: "Free tier available. Good for longer scripts."
  },
  {
    name: "TTSReader",
    url: "https://ttsreader.com/",
    voiceRecommendation: "English (US) - Male voices",
    quality: "Medium-High",
    notes: "Browser-based, instant playback."
  },
  {
    name: "Uberduck (AI Voices)",
    url: "https://uberduck.ai/",
    voiceRecommendation: "Deep narrator voices",
    quality: "High",
    notes: "Free tier with watermark. AI-generated voices."
  }
];

export default function LaunchVideo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState("video");

  const copyScript = async () => {
    await navigator.clipboard.writeText(narrationScript);
    setCopiedScript(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([narrationScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifestack-launch-narration.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Script downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <img src={logoWhite} alt="LifeStack" className="h-8 w-auto" />
            <span className="font-serif font-bold text-lg">Launch Video</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Production Ready
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
              LifeStack Launch Video
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Complete production package with cinematic teaser, Morgan Freeman-style narration, 
              and scene-by-scene storyboard for viral multicultural appeal.
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="video" className="gap-2">
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="script" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Script</span>
              </TabsTrigger>
              <TabsTrigger value="storyboard" className="gap-2">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Storyboard</span>
              </TabsTrigger>
              <TabsTrigger value="tts" className="gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Voice</span>
              </TabsTrigger>
            </TabsList>

            {/* Video Tab */}
            <TabsContent value="video">
              <Card className="overflow-hidden border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-amber-500/5">
                  <CardTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    Cinematic Teaser (10 seconds)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black">
                    <video
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      poster="/videos/intro-poster.jpg"
                    >
                      <source src="/videos/launch-teaser.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-6 bg-muted/30">
                    <h3 className="font-semibold mb-2">Usage Notes</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• This 10-second teaser showcases the life journey concept</li>
                      <li>• Use as hero video on landing page or social media teaser</li>
                      <li>• Combine with narration and music in video editor for full production</li>
                      <li>• Recommended: Add liquid glass overlays in After Effects or DaVinci Resolve</li>
                    </ul>
                    <Button 
                      variant="gold" 
                      className="mt-4"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = '/videos/launch-teaser.mp4';
                        a.download = 'lifestack-teaser.mp4';
                        a.click();
                        toast.success("Video download started!");
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Teaser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Script Tab */}
            <TabsContent value="script">
              <Card className="border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-amber-500/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Morgan Freeman-Style Narration
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyScript}>
                        {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="ml-2">{copiedScript ? "Copied!" : "Copy"}</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadScript}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] rounded-lg border bg-muted/30 p-6">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {narrationScript}
                    </pre>
                  </ScrollArea>
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      🎙️ Voice Direction Notes
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pace: Slow, deliberate, 90-100 words per minute</li>
                      <li>• Tone: Warm, wise, reassuring - like a trusted grandfather</li>
                      <li>• Emphasis: Let silence breathe between major statements</li>
                      <li>• The tagline should land with gravitas and finality</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Storyboard Tab */}
            <TabsContent value="storyboard">
              <div className="space-y-6">
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-amber-500/5">
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-primary" />
                      Complete Scene-by-Scene Storyboard
                    </CardTitle>
                  </CardHeader>
                </Card>

                {storyboardScenes.map((scene, index) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              Scene {scene.id} | {scene.timestamp}
                            </Badge>
                            <CardTitle className="text-xl">{scene.title}</CardTitle>
                          </div>
                          <Badge 
                            className="bg-gradient-to-r from-primary/20 to-amber-500/20 text-primary border-none"
                          >
                            {scene.emotionalTone}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                                Visual
                              </h4>
                              <p className="text-sm">{scene.visual}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                                Audio
                              </h4>
                              <p className="text-sm">{scene.audio}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                                Camera Work
                              </h4>
                              <p className="text-sm">{scene.cameraWork}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-1">
                                Color Grade
                              </h4>
                              <p className="text-sm">{scene.colorGrade}</p>
                            </div>
                          </div>
                        </div>

                        {scene.overlay && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-lg border border-primary/20">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              Liquid Glass Overlay @ {scene.overlay.timing}
                            </h4>
                            <div className="inline-block px-4 py-2 bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg">
                              <span className="text-sm font-medium">{scene.overlay.content}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Position: {scene.overlay.position}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* TTS Tab */}
            <TabsContent value="tts">
              <Card className="border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-amber-500/5">
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-primary" />
                    Free Text-to-Speech Services
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-2">
                    Use these free services to generate the Morgan Freeman-style voiceover
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {freeTTSServices.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Recommended: <span className="text-foreground">{service.voiceRecommendation}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">{service.notes}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{service.quality} Quality</Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(service.url, '_blank')}
                              >
                                Open
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Quick Production Workflow</h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Copy the narration script from the Script tab</li>
                      <li>Paste into one of the TTS services above</li>
                      <li>Select a deep, mature male voice</li>
                      <li>Export as MP3 or WAV</li>
                      <li>Import into video editor with the teaser clip</li>
                      <li>Add royalty-free emotional music (try Artlist.io or Epidemic Sound)</li>
                      <li>Create liquid glass overlays as motion graphics</li>
                      <li>Export final video in 4K for maximum quality</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tagline Section */}
          <motion.div
            className="mt-16 text-center py-12 border-t border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <img src={logoWhite} alt="LifeStack" className="h-16 mx-auto mb-6" />
            <p className="font-serif text-3xl md:text-4xl font-bold text-foreground/90 italic">
              "From your first job to your last breath"
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
