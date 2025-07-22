import { Link } from "wouter";
import { ArrowLeft, Shield, Database, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
              <Shield className="h-5 w-5 text-[#FFD300]" />
              <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
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
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed mb-4">
              Your privacy is important to us. This Privacy Policy explains how FitTracker collects, uses, and protects your personal information.
            </p>
            <p className="text-slate-500 text-sm">
              Last updated: January 22, 2024
            </p>
          </div>

          {/* Information We Collect */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#FFD300]" />
              1. Information We Collect
            </h3>
            <div className="space-y-6 text-slate-400">
              <div>
                <h4 className="font-semibold mb-2 text-white">Account Information</h4>
                <p>
                  When you create an account, we collect your email address and basic profile information 
                  provided by your chosen authentication provider (Google, Apple, or email signup).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Workout Data</h4>
                <p>
                  We store your workout logs, exercise data, personal records, and progress tracking 
                  information that you voluntarily provide through the app.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Usage Information</h4>
                <p>
                  We may collect information about how you use our app, including features accessed 
                  and time spent in the application for improving user experience.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#FFD300]" />
              2. How We Use Your Information
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                We use the information we collect to provide and improve our services:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Provide and maintain the FitTracker service</li>
                <li>• Store and sync your workout data across devices</li>
                <li>• Generate progress reports and analytics</li>
                <li>• Improve our app's functionality and user experience</li>
                <li>• Communicate with you about service updates or issues</li>
                <li>• Ensure the security and integrity of our service</li>
              </ul>
            </div>
          </div>

          {/* Data Protection & Security */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#FFD300]" />
              3. Data Protection & Security
            </h3>
            <div className="space-y-6 text-slate-400">
              <div>
                <h4 className="font-semibold mb-2 text-white">Encryption</h4>
                <p>
                  All data is encrypted in transit and at rest using industry-standard encryption protocols. 
                  Your personal information is protected with the same level of security used by financial institutions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Data Access</h4>
                <p>
                  Your workout data is private and only accessible to you. We do not share, sell, 
                  or rent your personal information to third parties for marketing purposes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Data Retention</h4>
                <p>
                  We retain your data for as long as your account is active or as needed to provide services. 
                  You can request data deletion by contacting us or deleting your account.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Services */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              4. Third-Party Services
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                FitTracker integrates with the following trusted third-party services:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• <strong className="text-white">Authentication Providers:</strong> Google OAuth, Apple Sign-In for secure login</li>
                <li>• <strong className="text-white">Database:</strong> Supabase for secure data storage and management</li>
                <li>• <strong className="text-white">Hosting:</strong> Vercel for reliable app hosting and delivery</li>
              </ul>
              <p className="mt-4">
                These services have their own privacy policies and we encourage you to review them. 
                We only share the minimum necessary information required for these services to function.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              5. Your Rights
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                You have the following rights regarding your personal data:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• <strong className="text-white">Access:</strong> Request access to your personal data</li>
                <li>• <strong className="text-white">Correction:</strong> Request correction of inaccurate data</li>
                <li>• <strong className="text-white">Deletion:</strong> Request deletion of your data</li>
                <li>• <strong className="text-white">Export:</strong> Request a copy of your workout data</li>
                <li>• <strong className="text-white">Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us using the information provided below.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              6. Contact Information
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="border border-slate-700 rounded-xl p-6 bg-slate-900/30">
                <p className="font-semibold text-white mb-2">FitTracker Support</p>
                <p className="text-slate-300">Email: onelasttimejuan@gmail.com</p>
                <p className="text-slate-300">Website: https://fittracker.juan-oclock.com</p>
              </div>
            </div>
          </div>

          {/* Changes to This Policy */}
          <div className="border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              7. Changes to This Policy
            </h3>
            <div className="space-y-4 text-slate-400">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
              <p>
                We will notify you of any material changes by posting the new Privacy Policy on this page 
                and updating the "Last updated" date. We encourage you to review this Privacy Policy 
                periodically to stay informed about how we protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}