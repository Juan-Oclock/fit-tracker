import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Database, Eye, Lock } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#090C11' }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-white hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: '#262B32' }}>
                <Shield className="h-8 w-8" style={{ color: '#FFD300' }} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-6">
          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5" style={{ color: '#FFD300' }} />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Account Information</h4>
                <p className="text-slate-300">
                  When you create an account, we collect your email address and basic profile information 
                  provided by your chosen authentication provider (Google, Apple, or email signup).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Workout Data</h4>
                <p className="text-slate-300">
                  We store your workout logs, exercise data, personal records, and progress tracking 
                  information that you voluntarily provide through the app.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Usage Information</h4>
                <p className="text-slate-300">
                  We may collect information about how you use our app, including features accessed 
                  and time spent in the application for improving user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" style={{ color: '#FFD300' }} />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-slate-300">
                <li>• Provide and maintain the FitTracker service</li>
                <li>• Store and sync your workout data across devices</li>
                <li>• Generate progress reports and analytics</li>
                <li>• Improve our app's functionality and user experience</li>
                <li>• Communicate with you about service updates or issues</li>
                <li>• Ensure the security and integrity of our service</li>
              </ul>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" style={{ color: '#FFD300' }} />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Data Security</h4>
                <p className="text-slate-300">
                  We implement industry-standard security measures to protect your personal information. 
                  Your data is encrypted in transit and at rest using secure protocols.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Data Access</h4>
                <p className="text-slate-300">
                  Your workout data is private and only accessible to you. We do not share, sell, 
                  or rent your personal information to third parties.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Data Retention</h4>
                <p className="text-slate-300">
                  We retain your data for as long as your account is active. You can request 
                  data deletion by contacting us or deleting your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="text-white">Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                FitTracker uses the following third-party services:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong className="text-white">Authentication Providers:</strong> Google OAuth, Apple Sign-In for secure login</li>
                <li>• <strong className="text-white">Database:</strong> Supabase for secure data storage and management</li>
                <li>• <strong className="text-white">Hosting:</strong> Vercel for reliable app hosting and delivery</li>
              </ul>
              <p className="text-slate-300 mt-4">
                These services have their own privacy policies and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="text-white">Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate data</li>
                <li>• Request deletion of your data</li>
                <li>• Export your workout data</li>
                <li>• Withdraw consent for data processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#090C11' }}>
                <p className="font-medium text-white">FitTracker Support</p>
                <p className="text-slate-300">Email: onelasttimejuan@gmail.com</p>
                <p className="text-slate-300">Website: https://fittracker.juan-oclock.com</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#262B32', borderColor: '#3a3f47' }}>
            <CardHeader>
              <CardTitle className="text-white">Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" 
                date at the top of this policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}