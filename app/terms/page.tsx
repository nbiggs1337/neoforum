import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  By accessing and using CyberPunk Forum ("the Service"), you accept and agree to be bound 
                  by the terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our forum platform and constitute 
                  a legally binding agreement between you and CyberPunk Forum.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  CyberPunk Forum is an online community platform that allows users to create forums, 
                  post content, engage in discussions, and interact with other community members. 
                  The Service includes features such as:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Creating and managing forums</li>
                  <li>Posting text content and images</li>
                  <li>Commenting and voting on posts</li>
                  <li>User profiles and messaging</li>
                  <li>Moderation tools and community management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">3. User Accounts and Registration</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Be responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  You must be at least 13 years old to create an account. Users under 18 should have 
                  parental consent before using the Service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">4. User Conduct and Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Post illegal, harmful, threatening, abusive, or defamatory content</li>
                  <li>Harass, intimidate, or discriminate against other users</li>
                  <li>Share spam, advertisements, or unsolicited promotional content</li>
                  <li>Impersonate others or create fake accounts</li>
                  <li>Share copyrighted material without permission</li>
                  <li>Distribute malware, viruses, or harmful code</li>
                  <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                  <li>Engage in any activity that disrupts or interferes with the Service</li>
                </ul>
                <p>
                  We reserve the right to remove content and suspend or terminate accounts that violate 
                  these guidelines.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">5. Content Ownership and Licensing</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Your Content</h4>
                  <p>
                    You retain ownership of the content you post on the Service. However, by posting content, 
                    you grant us a worldwide, non-exclusive, royalty-free license to use, display, reproduce, 
                    and distribute your content in connection with the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Our Content</h4>
                  <p>
                    The Service and its original content, features, and functionality are owned by 
                    CyberPunk Forum and are protected by international copyright, trademark, and other laws.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Third-Party Content</h4>
                  <p>
                    You are responsible for ensuring you have the right to post any third-party content 
                    and that such content does not infringe on others' rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">6. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is 
                  governed by our Privacy Policy, which is incorporated into these Terms by reference. 
                  By using the Service, you consent to the collection and use of information as described 
                  in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">7. Moderation and Content Removal</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We reserve the right, but are not obligated, to monitor, review, and remove content 
                  that violates these Terms or is otherwise objectionable. Forum moderators and 
                  administrators may also moderate content within their respective communities.
                </p>
                <p>
                  Content removal decisions are made at our discretion, and we may not provide advance 
                  notice of removal. Repeated violations may result in account suspension or termination.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">8. Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We respect intellectual property rights and expect our users to do the same. If you 
                  believe your copyrighted work has been infringed, please contact us with:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A description of the copyrighted work</li>
                  <li>Location of the infringing material</li>
                  <li>Your contact information</li>
                  <li>A statement of good faith belief that use is not authorized</li>
                  <li>A statement of accuracy and authority to act on behalf of the copyright owner</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">9. Disclaimers and Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Service Availability</h4>
                  <p>
                    The Service is provided "as is" without warranties of any kind. We do not guarantee 
                    that the Service will be uninterrupted, secure, or error-free.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">User Content</h4>
                  <p>
                    We are not responsible for user-generated content and do not endorse any opinions 
                    expressed by users. Users are solely responsible for their content and interactions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Limitation of Liability</h4>
                  <p>
                    To the maximum extent permitted by law, we shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages arising from your use of the Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">10. Termination</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, 
                  without prior notice, for conduct that we believe violates these Terms or is harmful 
                  to other users, us, or third parties.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or using account 
                  deletion features. Upon termination, your right to use the Service will cease immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">11. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of 
                  material changes by posting the updated Terms on the Service and updating the 
                  "Last updated" date.
                </p>
                <p>
                  Your continued use of the Service after changes become effective constitutes 
                  acceptance of the updated Terms.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">12. Governing Law and Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of 
                  [Your Jurisdiction], without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the Service shall be resolved 
                  through binding arbitration in accordance with the rules of [Arbitration Organization].
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">13. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Through our support system at <a href="/support" className="text-blue-400 hover:underline">/support</a></li>
                  <li>Email: legal@cyberpunkforum.com</li>
                  <li>Mail: [Your Company Address]</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">14. Severability</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining 
                  provisions will remain in full force and effect. The invalid provision will be replaced 
                  with a valid provision that most closely matches the intent of the original provision.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
