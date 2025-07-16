import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Database, Eye, Lock } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  When you create an account, we collect your email address and basic profile information 
                  provided by your chosen authentication provider (Google, Apple, or email signup).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Workout Data</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  We store your workout logs, exercise data, personal records, and progress tracking 
                  information that you voluntarily provide through the app.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  We may collect information about how you use our app, including features accessed 
                  and time spent in the application for improving user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Provide and maintain the FitTracker service</li>
                <li>• Store and sync your workout data across devices</li>
                <li>• Generate progress reports and analytics</li>
                <li>• Improve our app's functionality and user experience</li>
                <li>• Communicate with you about service updates or issues</li>
                <li>• Ensure the security and integrity of our service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Security</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  We implement industry-standard security measures to protect your personal information. 
                  Your data is encrypted in transit and at rest using secure protocols.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Access</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Your workout data is private and only accessible to you. We do not share, sell, 
                  or rent your personal information to third parties.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Retention</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  We retain your data for as long as your account is active. You can request 
                  data deletion by contacting us or deleting your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                FitTracker uses the following third-party services:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• <strong>Authentication Providers:</strong> Google OAuth, Apple Sign-In for secure login</li>
                <li>• <strong>Database:</strong> Supabase for secure data storage and management</li>
                <li>• <strong>Hosting:</strong> Vercel for reliable app hosting and delivery</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                These services have their own privacy policies and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate data</li>
                <li>• Request deletion of your data</li>
                <li>• Export your workout data</li>
                <li>• Withdraw consent for data processing</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-medium">FitTracker Support</p>
                <p className="text-slate-600 dark:text-slate-300">Email: onelasttimejuan@gmail.com</p>
                <p className="text-slate-600 dark:text-slate-300">Website: https://fittracker.juan-oclock.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
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