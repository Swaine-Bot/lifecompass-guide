 import { Link } from 'react-router-dom';
 import { ArrowLeft, Download, Apple, FileText, Image, Settings, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import lifestackLogo from '@/assets/lifestack-logo.png';
 
 const submissionAssets = [
   {
     title: 'App Store Submission Pack',
     description: 'Complete metadata, descriptions, keywords, privacy declarations, and submission checklist.',
     filename: 'APPLE_APP_STORE_SUBMISSION_PACK.md',
     icon: FileText,
     status: 'ready',
   },
   {
     title: 'App Store Icon (1024×1024)',
     description: 'High-resolution app icon for App Store Connect. No transparency, ready for upload.',
     filename: 'app-store-icon-1024.png',
     path: '/icons/',
     icon: Image,
     status: 'ready',
   },
   {
     title: 'iOS Info.plist Additions',
     description: 'Required privacy descriptions and capabilities for Xcode project.',
     filename: 'ios-info-plist-additions.plist',
     path: '/',
     icon: Settings,
     status: 'ready',
   },
 ];
 
 const requirements = [
   { item: 'Apple Developer Account ($99/year)', status: 'pending', note: 'Required for App Store submission' },
   { item: 'App Store Connect Record', status: 'pending', note: 'Create after developer account' },
   { item: 'App Store Metadata', status: 'ready', note: 'Included in submission pack' },
   { item: 'App Store Icon (1024×1024)', status: 'ready', note: 'Generated and ready' },
   { item: 'iPhone Screenshots (3 sizes)', status: 'pending', note: 'Capture from device or simulator' },
   { item: 'iPad Screenshots (optional)', status: 'pending', note: 'If supporting iPad' },
   { item: 'Privacy Policy URL', status: 'ready', note: 'https://lifecompass-guide.lovable.app/privacy' },
   { item: 'Demo Account for Review', status: 'pending', note: 'Create before submission' },
   { item: 'Xcode Project Setup', status: 'pending', note: 'Use Capacitor to generate' },
   { item: 'Info.plist Privacy Descriptions', status: 'ready', note: 'Template provided' },
 ];
 
 export default function AppStoreSubmission() {
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
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
             <Apple className="w-8 h-8 text-primary" />
           </div>
           <h1 className="font-serif text-4xl font-bold mb-4">App Store Submission Pack</h1>
           <p className="text-muted-foreground text-lg">
             Everything you need to submit LifeStack to the Apple App Store
           </p>
           <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
             <CheckCircle2 className="w-4 h-4 text-primary" />
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
                     <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                       <asset.icon className="w-6 h-6 text-primary" />
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
                   <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                   Register for Apple Developer Program
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   Visit <a href="https://developer.apple.com/programs/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developer.apple.com/programs</a> and enroll ($99/year).
                 </p>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                   Export Project to GitHub
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   In Lovable, go to Settings → GitHub and export your project.
                 </p>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
                   Set Up Local Development
                 </h3>
                 <pre className="text-xs bg-secondary/50 p-4 rounded-lg overflow-x-auto ml-8">
 {`git clone [your-repo-url]
 cd [project-folder]
 npm install
 npm run build
 npx cap add ios
 npx cap sync ios
 npx cap open ios`}
                 </pre>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
                   Configure Xcode
                 </h3>
                 <ul className="text-muted-foreground text-sm ml-8 space-y-1">
                   <li>• Select your Apple Developer Team</li>
                   <li>• Add app icons from the downloaded 1024×1024 icon</li>
                   <li>• Add Info.plist entries from the template</li>
                   <li>• Archive and upload to App Store Connect</li>
                 </ul>
               </div>
 
               <div>
                 <h3 className="font-semibold mb-3 flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">5</span>
                   Submit for Review
                 </h3>
                 <p className="text-muted-foreground text-sm ml-8">
                   Use the metadata from the submission pack to fill in App Store Connect, upload screenshots, and submit!
                 </p>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Screenshot Specs */}
         <div>
           <h2 className="font-serif text-2xl font-bold mb-6">📱 Screenshot Requirements</h2>
           <Card variant="glass">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Smartphone className="w-5 h-5" />
                 Required Screenshot Sizes
               </CardTitle>
               <CardDescription>
                 Capture screenshots on these device sizes (or use a simulator)
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid md:grid-cols-2 gap-4">
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">iPhone 6.7"</h4>
                   <p className="text-sm text-muted-foreground">1290 × 2796 pixels</p>
                   <p className="text-xs text-muted-foreground">iPhone 15 Pro Max, 14 Pro Max</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">iPhone 6.5"</h4>
                   <p className="text-sm text-muted-foreground">1284 × 2778 pixels</p>
                   <p className="text-xs text-muted-foreground">iPhone 14 Plus, 13 Pro Max</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">iPhone 5.5"</h4>
                   <p className="text-sm text-muted-foreground">1242 × 2208 pixels</p>
                   <p className="text-xs text-muted-foreground">iPhone 8 Plus, 7 Plus</p>
                 </div>
                 <div className="p-4 bg-secondary/30 rounded-lg">
                   <h4 className="font-medium mb-2">iPad Pro 12.9"</h4>
                   <p className="text-sm text-muted-foreground">2048 × 2732 pixels</p>
                   <p className="text-xs text-muted-foreground">Optional but recommended</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
       </main>
     </div>
   );
 }