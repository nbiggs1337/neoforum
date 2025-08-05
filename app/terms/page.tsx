import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, FileText, Shield, AlertTriangle, Users, Gavel, Ban, CheckCircle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated nightscape background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 nightscape-enhanced">
        <div className="absolute inset-0 nightscape-bg"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              NeoForum
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Terms of Service
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            These terms govern your use of NeoForum and outline the rights and responsibilities of all users.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: March 20, 2024</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Acceptance of Terms */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                By accessing or using NeoForum ("the Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-300">
                These Terms apply to all visitors, users, and others who access or use the Service. By using our
                Service, you represent that you are at least 13 years old and have the legal capacity to enter into
                these Terms.
              </p>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Important:</strong> These Terms constitute a legally binding agreement between you and
                  NeoForum. Please read them carefully before using our platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Accounts and Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Account Creation</h4>
                <p className="text-gray-300 mb-3">
                  To access certain features of the Service, you must register for an account. You agree to provide
                  accurate, current, and complete information during registration and to update such information to keep
                  it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Account Security</h4>
                <p className="text-gray-300 mb-3">
                  You are responsible for safeguarding the password and for maintaining the confidentiality of your
                  account. You agree to notify us immediately of any unauthorized use of your account or any other
                  breach of security.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">Account Requirements</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Must be at least 13 years old</li>
                    <li>• Provide accurate information</li>
                    <li>• Use a valid email address</li>
                    <li>• Choose a unique username</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">Account Responsibilities</h5>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Keep login credentials secure</li>
                    <li>• Report unauthorized access</li>
                    <li>• Update information when needed</li>
                    <li>• Follow community guidelines</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not
                to use the Service:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-3">Prohibited Content</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Illegal, harmful, or offensive content</li>
                    <li>• Harassment, bullying, or threats</li>
                    <li>• Spam or unsolicited advertising</li>
                    <li>• Copyrighted material without permission</li>
                    <li>• Personal information of others</li>
                    <li>• Malware or malicious code</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">Prohibited Activities</h4>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Impersonating others</li>
                    <li>• Creating multiple accounts</li>
                    <li>• Circumventing security measures</li>
                    <li>• Automated data collection</li>
                    <li>• Disrupting platform operations</li>
                    <li>• Violating others' rights</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">
                  <strong>Warning:</strong> Violation of these policies may result in content removal, account
                  suspension, or permanent ban from the platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content and Intellectual Property */}
          <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Your Content</h4>
                <p className="text-gray-300 mb-3">
                  You retain ownership of any intellectual property rights that you hold in content you post to the
                  Service. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to
                  use, reproduce, modify, and distribute your content in connection with the Service.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Platform Content</h4>
                <p className="text-gray-300 mb-3">
                  The Service and its original content, features, and functionality are owned by NeoForum and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual property
                  laws.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Content Guidelines</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• You are responsible for your content</li>
                  <li>• Content must comply with applicable laws</li>
                  <li>• We may remove content that violates these Terms</li>
                  <li>• Respect others' intellectual property rights</li>
                  <li>• Report copyright infringement to us</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-400">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                NeoForum is built on the principles of respect, collaboration, and constructive discussion. All users
                are expected to contribute positively to our community.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Be Respectful</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Treat all members with courtesy</li>
                    <li>• Respect diverse opinions and backgrounds</li>
                    <li>• Use constructive language</li>
                    <li>• Avoid personal attacks</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Stay On Topic</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Post relevant content</li>
                    <li>• Use appropriate forums</li>
                    <li>• Search before posting duplicates</li>
                    <li>• Follow forum-specific rules</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Quality Content</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Provide valuable contributions</li>
                    <li>• Use clear, readable formatting</li>
                    <li>• Cite sources when appropriate</li>
                    <li>• Avoid low-effort posts</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Help Others</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Share knowledge and expertise</li>
                    <li>• Answer questions helpfully</li>
                    <li>• Welcome new members</li>
                    <li>• Report rule violations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation and Enforcement */}
          <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Gavel className="w-5 h-5 mr-2" />
                Moderation and Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                We reserve the right to monitor, review, and moderate content and user behavior on the platform. We may
                take action against users or content that violates these Terms.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Warnings
                  </h4>
                  <p className="text-gray-300 text-sm">
                    First-time or minor violations may result in a warning and content removal.
                  </p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="text-orange-400 font-semibold mb-2 flex items-center">
                    <Ban className="w-4 h-4 mr-2" />
                    Suspension
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Repeated violations may result in temporary account suspension.
                  </p>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-semibold mb-2 flex items-center">
                    <Ban className="w-4 h-4 mr-2" />
                    Permanent Ban
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Serious or repeated violations may result in permanent account termination.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Appeal Process</h4>
                <p className="text-gray-300 text-sm">
                  If you believe a moderation action was taken in error, you may appeal by contacting our support team
                  within 30 days of the action. We will review your appeal and respond within a reasonable timeframe.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers and Limitations */}
          <Card className="bg-black/50 border-gray-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-400">Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Service Availability</h4>
                <p className="text-gray-300 text-sm">
                  We strive to maintain high availability but cannot guarantee uninterrupted service. The Service is
                  provided "as is" without warranties of any kind.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">User Content</h4>
                <p className="text-gray-300 text-sm">
                  We are not responsible for user-generated content. Users are solely responsible for their posts and
                  interactions on the platform.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Third-Party Links</h4>
                <p className="text-gray-300 text-sm">
                  Our Service may contain links to third-party websites. We are not responsible for the content or
                  practices of these external sites.
                </p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, NeoForum shall not
                  be liable for any indirect, incidental, special, consequential, or punitive damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="bg-black/50 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days notice prior to any new terms taking effect.
              </p>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Notification Methods</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Email notification to registered users</li>
                  <li>• Prominent notice on the platform</li>
                  <li>• Updated "Last modified" date</li>
                  <li>• Announcement in community forums</li>
                </ul>
              </div>

              <p className="text-gray-400 text-sm">
                Your continued use of the Service after any changes indicates your acceptance of the new Terms of
                Service.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Legal Inquiries</h4>
                  <Link href="mailto:legal@neoforum.com" className="text-cyan-400 hover:text-cyan-300 underline">
                    legal@neoforum.com
                  </Link>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">General Support</h4>
                  <Link href="/support" className="text-cyan-400 hover:text-cyan-300 underline">
                    Visit Support Center
                  </Link>
                </div>
              </div>

              <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-sm">
                  <strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the
                  laws of [Jurisdiction], without regard to its conflict of law provisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
