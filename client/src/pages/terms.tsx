import { Link } from "wouter";
import { ArrowLeft, Shield, FileText, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#090C11]">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#090C11]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-700 text-white hover:border-[#FFD300]/50 hover:bg-slate-800/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FFD300]" />
              <h1 className="text-xl font-bold text-white">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-[#FFD300]" />
              <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed mb-4">
              Welcome to FitTracker. These Terms of Service ("Terms") govern your use of our fitness tracking application and services.
            </p>
            <p className="text-slate-500 text-sm">
              Last updated: January 22, 2024
            </p>
          </div>

          {/* Agreement to Terms */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FFD300]" />
              1. Agreement to Terms
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                By accessing and using FitTracker, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </div>

          {/* Use License */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FFD300]" />
              2. Use License
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                Permission is granted to temporarily use FitTracker for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained in FitTracker</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
              <p>
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#FFD300]" />
              3. User Accounts
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times.
              </p>
              <p>
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p>
                You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
              </p>
            </div>
          </div>

          {/* Prohibited Uses */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FFD300]" />
              4. Prohibited Uses
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                You may not use our service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the service</li>
              </ul>
            </div>
          </div>

          {/* Content */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">5. Content</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
              </p>
              <p>
                You are responsible for the Content that you post to the service, including its legality, reliability, and appropriateness.
              </p>
              <p>
                By posting Content to the service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the service.
              </p>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">6. Privacy Policy</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
              <Link href="/privacy-policy" className="text-[#FFD300] hover:text-[#FFD300]/80 transition-colors">
                View our Privacy Policy →
              </Link>
            </div>
          </div>

          {/* Termination */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">7. Termination</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the service will cease immediately. If you wish to terminate your account, you may simply discontinue using the service.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">8. Disclaimer</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                The information on this application is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>excludes all representations and warranties relating to this application and its contents</li>
                <li>excludes all liability for damages arising out of or in connection with your use of this application</li>
              </ul>
            </div>
          </div>

          {/* Limitations */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">9. Limitations</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                In no event shall FitTracker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FitTracker, even if FitTracker or a FitTracker authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">10. Governing Law</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">12. Contact Information</h3>
            <div className="space-y-4 text-slate-400">
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/30">
                <p className="text-white font-medium mb-2">FitTracker Support</p>
                <p className="text-slate-400">Email: support@fittracker.app</p>
                <p className="text-slate-400">Website: www.fittracker.app</p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button size="lg" className="px-8 py-3 bg-[#FFD300] text-[#090C11] font-semibold hover:bg-[#FFD300]/90 transition-all duration-200 rounded-xl">
                Back to FitTracker
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
