 import { Link } from 'react-router-dom';
 import { ArrowLeft, Download, FileText, Image, Settings, CheckCircle2, AlertCircle, Smartphone, PlayCircle } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import lifestackLogo from '@/assets/lifestack-logo.png';
 
 const submissionAssets = [
   {
     title: 'Play Store Submission Pack',
     description: 'Complete metadata, descriptions, data safety declarations, and submission checklist.',
     filename: 'GOOGLE_PLAY_STORE_SUBMISSION_PACK.md',
     icon: FileText,
     status: 'ready',
   },
   {
     title: 'Play Store Icon (512×512)',
     description: 'High-resolution app icon for Google Play Console. No transparency, ready for upload.',
     filename: 'play-store-icon-512.png',
     path: '/icons/',
     icon: Image,
     status: 'ready',
   },
 ];
 
 const requirements = [
   { item: 'Google Play Developer Account ($25 one-time)', status: 'pending', note: 'Required for Play Store submission' },
   { item: 'Play Console App Record', status: 'pending', note: 'Create after developer account' },
   { item: 'Store Listing Metadata', status: 'ready', note: 'Included in submission pack' },
   { item: 'Play Store Icon (512×512)', status: 'ready', note: 'Generated and ready' },
   { item: 'Feature Graphic (1024×500)', status: 'pending', note: 'Create promotional banner' },
   { item: 'Phone Screenshots (2-8)', status: 'pending', note: 'Capture from device or emulator' },
   { item: 'Content Rating Questionnaire', status: 'ready', note: 'Answers in submission pack' },
   { item: 'Data Safety Declaration', status: 'ready', note: 'Template in submission pack' },
   { item: 'Privacy Policy URL', status: 'ready', note: 'https://lifecompass-guide.lovable.app/privacy' },
   { item: 'Demo Account for Review', status: 'pending', note: 'Create before submission' },
   { item: 'Signed AAB Bundle', status: 'pending', note: 'Build in Android Studio' },
 ];
 
 export default function PlayStoreSubmission() {
   const handleDownload = (filename: string, path = '/downloads/') => {
     const link = document.createElement('a');
     link.href = `${path}${filename}`;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 
   const readyCount = requirements.filter(r => r.status === 'ready').length;
   const totalCount = requirements.length;
 
   return (
     <div className="min-h-screen bg-background">
       <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
         <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
           <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="flex items-center gap-2">
             <img src={lifestackLogo} alt="LifeStack" className="w-8 h-8" />
             <span className="font-serif text-xl font-semibold">LifeStack</span>
           </div>
         </div>
       </header>
 
       <main className="container max-w-4xl mx-auto px-4 py-12">
         <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
             <PlayCircle className="w-8 h-8 text-green-500" />
           </div>
           <h1 className="font-serif text-4xl font-bold mb-4">Play Store Submission Pack</h1>
           <p className="text-muted-foreground text-lg">
             Everything you need to submit LifeStack to Google Play Store
           </p>
           <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
             <CheckCircle2 className="w-4 h-4 text-green-500" />
             <span className="text-sm font-medium">{readyCount} of {totalCount} requirements ready</span>
           </div>
         </div>
 
         {/* Download Assets */}
         <div className="mb-12">
           <h2 className="font-serif text-2xl font-bold mb-6">📦 Download Assets</h2>
           <div className="space-y-4">
             {submissionAssets.map((asset) => (
               <Card key={asset.filename} variant="glass" className="hover-lift">
                 <CardContent className="p-6">
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                       <asset.icon className="w-6 h-6 text-green-500" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-semibold text-lg">{asset.title}</h3>
                         <Badge variant="outline" className="text-green-500 border-green-500/30">Ready</Badge>
                       </div>
                       <p className="text-sm text-muted-foreground mb-2">{asset.description}</p>
                       <p className="text-xs text-muted-foreground font-mono">{asset.filename}</p>
                     </div>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => handleDownload(asset.filename, asset.path || '/downloads/')}
                     >
                       <Download className="w-4 h-4 mr-2" />
                       Download
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
 
         {/* Requirements Checklist */}
         <div className="mb-12">
           <h2 className="font-serif text-2xl font-bold mb-6">✅ Submission Checklist</h2>
           <Card variant="glass">
             <CardContent className="p-6">
               <div className="space-y-4">
                 {requirements.map((req, index) => (
                   <div key={index} className="flex items-start gap-3 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                     {req.status === 'ready' ? (
                       <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                     ) : (
                       <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                     )}
                     <div className="flex-1">
                       <p className="font-medium">{req.item}</p>
                       <p className="text-sm text-muted-foreground">{req.note}</p>
                     </div>
                     <Badge 
                       variant="outline" 
                       className={req.status === 'ready' 
                         ? 'text-green-500 border-green-500/30' 
                         : 'text-amber-500 border-amber-500/30'
                       }
                     >
                       {req.status === 'ready' ? 'Ready' : 'Pending'}
                     </Badge>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Quick Start Guide */}
         <div className="mb-12">
           <h2 className="font-serif text-2xl font-bold mb-6">🚀 Quick Start Guide</h2>
           <Card variant="glass">
             <CardContent className="p-6 space-y-6">
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">1</span>
                   Register for Google Play Developer Account
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   Visit <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">play.google.com/console</a> and pay the $25 one-time fee.
                 </p>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">2</span>
                   Export Project to GitHub
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   In Lovable, go to Settings → GitHub and export your project.
                 </p>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">3</span>
                   Set Up Local Development
                 </h3>
                 <pre className="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto ml-8">
 {`git clone [your-repo-url]
 cd [project-folder]
 npm install
 npm run build
 npx cap add android
 npx cap sync android
 npx cap open android`}
                 </pre>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">4</span>
                   Configure Android Studio
                 </h3>
                 <ul className="text-muted-foreground text-sm ml-8 space-y-1">
                   <li>• Update versionCode and versionName in build.gradle</li>
                   <li>• Add app icons to res/mipmap-* folders</li>
                   <li>• Verify permissions in AndroidManifest.xml</li>
                   <li>• Build → Generate Signed Bundle (AAB)</li>
                 </ul>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">5</span>
                   Submit for Review
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   Upload your signed AAB to Play Console, complete store listing, data safety, and submit!
                 </p>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Screenshot Specs */}
         <div className="mb-12">
           <h2 className="font-serif text-2xl font-bold mb-6">📱 Screenshot Requirements</h2>
           <Card variant="glass">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Smartphone className="w-5 h-5" />
                 Required Screenshot Sizes
               </CardTitle>
               <CardDescription>
                 Capture screenshots on these device sizes (or use an emulator)
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid md:grid-cols-2 gap-4">
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">Phone (16:9)</h4>
                   <p className="text-sm text-muted-foreground">1080 × 1920 to 1440 × 2560</p>
                   <p className="text-xs text-muted-foreground">Min 2, Max 8 screenshots</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">Feature Graphic</h4>
                   <p className="text-sm text-muted-foreground">1024 × 500 pixels</p>
                   <p className="text-xs text-muted-foreground">Required for store listing</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">7" Tablet (Optional)</h4>
                   <p className="text-sm text-muted-foreground">1024 × 600 to 1920 × 1200</p>
                   <p className="text-xs text-muted-foreground">Recommended for visibility</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">10" Tablet (Optional)</h4>
                   <p className="text-sm text-muted-foreground">1280 × 800 to 2560 × 1600</p>
                   <p className="text-xs text-muted-foreground">For larger tablets</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Comparison with Apple */}
         <div>
           <h2 className="font-serif text-2xl font-bold mb-6">📊 Google Play vs Apple Differences</h2>
           <Card variant="glass">
             <CardContent className="p-6">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="border-b border-border/30">
                       <th className="text-left py-3 font-medium">Aspect</th>
                       <th className="text-left py-3 font-medium text-green-500">Google Play</th>
                       <th className="text-left py-3 font-medium text-primary">Apple</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/30">
                     <tr>
                       <td className="py-3">Developer Fee</td>
                       <td className="py-3 text-green-500">$25 one-time</td>
                       <td className="py-3">$99/year</td>
                     </tr>
                     <tr>
                       <td className="py-3">Review Time</td>
                       <td className="py-3 text-green-500">Hours to days</td>
                       <td className="py-3">1-3 days</td>
                     </tr>
                     <tr>
                       <td className="py-3">Icon Size</td>
                       <td className="py-3">512×512</td>
                       <td className="py-3">1024×1024</td>
                     </tr>
                     <tr>
                       <td className="py-3">Feature Graphic</td>
                       <td className="py-3">1024×500 (required)</td>
                       <td className="py-3">Not required</td>
                     </tr>
                     <tr>
                       <td className="py-3">App Format</td>
                       <td className="py-3">AAB (recommended)</td>
                       <td className="py-3">IPA</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
         </div>
       </main>
     </div>
   );
 }