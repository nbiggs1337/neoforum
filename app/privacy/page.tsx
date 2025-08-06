import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, Eye, Database, Cookie, Mail } from 'lucide-react'

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-black" />
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Privacy Policy
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your privacy is important to us. This policy explains how we collect, use, and protect your personal
          information on NeoForum.
        </p>
        <p className="text-sm text-gray-500 mt-2">Last updated: March 20, 2024</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Information We Collect */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-2">Account Information</h4>
              <p className="text-gray-300 mb-3">
                When you create an account, we collect information such as your username, email address, and password.
                This information is necessary to provide you with access to our services and to communicate with you
                about your account.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Content and Activity</h4>
              <p className="text-gray-300 mb-3">
                We collect the content you post, including forum posts, comments, and messages. We also track your
                activity on the platform, such as which forums you visit, posts you interact with, and your voting
                patterns to improve your experience.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Technical Information</h4>
              <p className="text-gray-300 mb-3">
                We automatically collect certain technical information when you use our services, including your IP
                address, browser type, device information, and usage patterns. This helps us maintain security and
                improve our platform.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Cookies and Tracking</h4>
              <p className="text-gray-300">
                We use cookies and similar technologies to enhance your experience, remember your preferences, and
                analyze how our platform is used. You can control cookie settings through your browser preferences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Service Provision</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Maintain and operate the platform</li>
                  <li>• Process your forum interactions</li>
                  <li>• Provide customer support</li>
                  <li>• Enable community features</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Communication</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Send important account notifications</li>
                  <li>• Respond to your inquiries</li>
                  <li>• Share platform updates</li>
                  <li>• Moderate content and enforce rules</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Improvement</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Analyze usage patterns</li>
                  <li>• Develop new features</li>
                  <li>• Optimize performance</li>
                  <li>• Personalize your experience</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Security</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Detect and prevent fraud</li>
                  <li>• Protect against spam and abuse</li>
                  <li>• Maintain platform security</li>
                  <li>• Comply with legal requirements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-400">Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except in the following circumstances:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Service Providers</h4>
                <p className="text-gray-300 text-sm">
                  We may share information with trusted third-party service providers who assist us in operating our
                  platform, such as hosting services, analytics providers, and email services.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Legal Requirements</h4>
                <p className="text-gray-300 text-sm">
                  We may disclose information when required by law, court order, or government request, or when
                  necessary to protect our rights, property, or safety.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Business Transfers</h4>
                <p className="text-gray-300 text-sm">
                  In the event of a merger, acquisition, or sale of assets, user information may be transferred as
                  part of the business transaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Technical Safeguards</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• SSL/TLS encryption for data transmission</li>
                  <li>• Encrypted data storage</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and authentication</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Organizational Measures</h4>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Limited access to personal data</li>
                  <li>• Employee training on data protection</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular policy reviews and updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-400">Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              You have certain rights regarding your personal information. Depending on your location, these may
              include:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Access</h5>
                  <p className="text-gray-400 text-xs">Request access to your personal information</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Correction</h5>
                  <p className="text-gray-400 text-xs">Update or correct inaccurate information</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Deletion</h5>
                  <p className="text-gray-400 text-xs">Request deletion of your personal information</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Portability</h5>
                  <p className="text-gray-400 text-xs">Export your data in a portable format</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Restriction</h5>
                  <p className="text-gray-400 text-xs">Limit how we process your information</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <h5 className="text-white font-medium text-sm">Objection</h5>
                  <p className="text-gray-400 text-xs">Object to certain types of processing</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
              <p className="text-blue-300 text-sm">
                To exercise these rights, please contact us at{" "}
                <Link href="mailto:privacy@neoforum.com" className="text-blue-400 hover:text-blue-300 underline">
                  privacy@neoforum.com
                </Link>
                . We will respond to your request within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="bg-black/50 border-yellow-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Cookie className="w-5 h-5 mr-2" />
              Cookies and Tracking Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              We use cookies and similar technologies to enhance your experience on our platform. Here's how we use
              them:
            </p>

            <div className="space-y-3">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Essential Cookies</h4>
                <p className="text-gray-300 text-sm">
                  Required for the platform to function properly, including authentication, security, and basic
                  functionality.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Functional Cookies</h4>
                <p className="text-gray-300 text-sm">
                  Remember your preferences and settings to provide a personalized experience.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Analytics Cookies</h4>
                <p className="text-gray-300 text-sm">
                  Help us understand how users interact with our platform to improve performance and user experience.
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              You can control cookie settings through your browser preferences. Note that disabling certain cookies
              may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Email</h4>
                <Link href="mailto:privacy@neoforum.com" className="text-cyan-400 hover:text-cyan-300 underline">
                  privacy@neoforum.com
                </Link>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Support</h4>
                <Link href="/support" className="text-cyan-400 hover:text-cyan-300 underline">
                  Visit Support Center
                </Link>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-sm">
                <strong>Data Protection Officer:</strong> For EU residents, you can contact our Data Protection
                Officer at{" "}
                <Link href="mailto:dpo@neoforum.com" className="text-purple-400 hover:text-purple-300 underline">
                  dpo@neoforum.com
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="bg-black/50 border-red-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-400">Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal
              requirements. When we make significant changes, we will:
            </p>

            <ul className="text-gray-300 space-y-2 mb-4">
              <li>• Post the updated policy on this page</li>
              <li>• Update the "Last updated" date</li>
              <li>• Notify you via email for material changes</li>
              <li>• Provide notice on our platform</li>
            </ul>

            <p className="text-gray-400 text-sm">
              Your continued use of NeoForum after any changes indicates your acceptance of the updated Privacy
              Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)
}
