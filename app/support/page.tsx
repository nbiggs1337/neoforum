"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Zap,
  HelpCircle,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  Book,
  Users,
  Shield,
  Settings,
  Bug,
  CreditCard,
} from "lucide-react"

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })

  // Mock FAQ data
  const faqs = [
    {
      id: 1,
      category: "Account",
      question: "How do I create an account on NeoForum?",
      answer: `Creating an account on NeoForum is simple and free:

1. Click the "Sign Up" button in the top right corner of any page
2. Fill in your desired username, email address, and password
3. Verify your email address by clicking the link we send you
4. Complete your profile setup and you're ready to start participating!

Your username will be visible to other users, so choose something you're comfortable with. You can always update your profile information later in your account settings.`,
    },
    {
      id: 2,
      category: "Forums",
      question: "How do I create my own forum?",
      answer: `To create your own forum community:

1. Log in to your NeoForum account
2. Go to your Dashboard
3. Click "Create New Forum"
4. Choose a unique subdomain (this will be your forum's URL)
5. Add a name, description, and category for your forum
6. Customize your forum settings and rules
7. Publish your forum and start inviting members!

Remember that as a forum owner, you'll be responsible for moderating content and maintaining community guidelines.`,
    },
    {
      id: 3,
      category: "Posting",
      question: "What are the rules for posting content?",
      answer: `All posts must follow our community guidelines:

• Be respectful and constructive in your discussions
• Stay on-topic for the specific forum you're posting in
• No spam, self-promotion, or duplicate posts
• Respect intellectual property and cite sources when appropriate
• No illegal, harmful, or offensive content
• Use clear, readable formatting and proper grammar

Violating these rules may result in post removal, warnings, or account suspension. Each forum may also have additional specific rules set by the forum moderators.`,
    },
    {
      id: 4,
      category: "Moderation",
      question: "How do I report inappropriate content or users?",
      answer: `If you encounter content or behavior that violates our guidelines:

1. Click the "Report" button (flag icon) on the post or comment
2. Select the reason for reporting from the dropdown menu
3. Provide additional details if necessary
4. Submit the report

Our moderation team reviews all reports within 24 hours. You can also report users directly from their profile page. For urgent safety concerns, contact us immediately at safety@neoforum.com.`,
    },
    {
      id: 5,
      category: "Technical",
      question: "I'm having trouble accessing my account. What should I do?",
      answer: `If you can't access your account, try these steps:

1. **Forgot Password**: Use the "Forgot Password" link on the login page
2. **Email Issues**: Check your spam folder for verification emails
3. **Browser Problems**: Clear your browser cache and cookies
4. **Two-Factor Authentication**: Use your backup codes if you can't access your authenticator

If these steps don't work, contact our support team with your username and the email address associated with your account. We'll help you regain access safely.`,
    },
    {
      id: 6,
      category: "Privacy",
      question: "How is my personal information protected?",
      answer: `We take your privacy seriously and implement multiple security measures:

• All data transmission is encrypted using SSL/TLS
• Passwords are hashed and never stored in plain text
• We follow industry-standard security practices
• Regular security audits and updates
• Limited access to personal data by staff
• Compliance with GDPR and other privacy regulations

You can review our full Privacy Policy for detailed information about how we collect, use, and protect your data. You also have control over your privacy settings in your account dashboard.`,
    },
  ]

  const categories = ["All", "Account", "Forums", "Posting", "Moderation", "Technical", "Privacy", "Billing"]

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqs

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contact form submitted:", contactForm)
    // Show success message and reset form
    setContactForm({ name: "", email: "", subject: "", category: "", message: "" })
  }

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
              <HelpCircle className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Support Center
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get help with your NeoForum experience. Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/60 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Book className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Getting Started</h3>
              <p className="text-gray-400 text-sm">Learn the basics of using NeoForum</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/60 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Community Guidelines</h3>
              <p className="text-gray-400 text-sm">Understand our community rules</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm hover:border-green-500/60 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Safety & Privacy</h3>
              <p className="text-gray-400 text-sm">Keep your account secure</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm hover:border-orange-500/60 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Account Settings</h3>
              <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Support Content */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="bg-black/50 border border-purple-500/30 grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Book className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id} className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">{faq.question}</h3>
                      </div>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6 border-t border-gray-800">
                        <div className="pt-4 text-gray-300 whitespace-pre-line leading-relaxed">{faq.answer}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <Card className="bg-black/50 border-gray-500/30 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No results found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search terms or{" "}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      view all FAQs
                    </button>
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400">Send us a message</CardTitle>
                  <CardDescription className="text-gray-400">
                    Can't find what you're looking for? Get in touch with our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-purple-300">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-purple-300">
                        Category
                      </Label>
                      <select
                        id="category"
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full bg-black/50 border border-purple-500/30 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:outline-none"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="account">Account Issues</option>
                        <option value="technical">Technical Problems</option>
                        <option value="billing">Billing Questions</option>
                        <option value="content">Content Moderation</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-purple-300">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-purple-300">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                        rows={6}
                        placeholder="Please describe your issue or question in detail..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Options */}
              <div className="space-y-6">
                <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">Other ways to reach us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-cyan-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold">Email Support</h4>
                        <p className="text-gray-400 text-sm mb-1">General inquiries and support</p>
                        <Link
                          href="mailto:support@neoforum.com"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          support@neoforum.com
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Bug className="w-5 h-5 text-red-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold">Bug Reports</h4>
                        <p className="text-gray-400 text-sm mb-1">Technical issues and bugs</p>
                        <Link href="mailto:bugs@neoforum.com" className="text-red-400 hover:text-red-300 underline">
                          bugs@neoforum.com
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-orange-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold">Safety & Abuse</h4>
                        <p className="text-gray-400 text-sm mb-1">Report safety concerns</p>
                        <Link
                          href="mailto:safety@neoforum.com"
                          className="text-orange-400 hover:text-orange-300 underline"
                        >
                          safety@neoforum.com
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CreditCard className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold">Billing Support</h4>
                        <p className="text-gray-400 text-sm mb-1">Payment and subscription issues</p>
                        <Link
                          href="mailto:billing@neoforum.com"
                          className="text-green-400 hover:text-green-300 underline"
                        >
                          billing@neoforum.com
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">General Support</span>
                      <span className="text-white">24-48 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Technical Issues</span>
                      <span className="text-white">12-24 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Safety Concerns</span>
                      <span className="text-green-400">2-6 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Billing Issues</span>
                      <span className="text-white">24-48 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-purple-400">Documentation</CardTitle>
                    <CardDescription className="text-gray-400">Comprehensive guides and tutorials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      href="/docs/getting-started"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Getting Started Guide</h4>
                      <p className="text-gray-400 text-sm">Learn the basics of using NeoForum</p>
                    </Link>
                    <Link
                      href="/docs/forum-creation"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Creating Forums</h4>
                      <p className="text-gray-400 text-sm">Step-by-step forum creation guide</p>
                    </Link>
                    <Link
                      href="/docs/moderation"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Moderation Tools</h4>
                      <p className="text-gray-400 text-sm">Managing your community effectively</p>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-cyan-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">Community</CardTitle>
                    <CardDescription className="text-gray-400">Connect with other users and get help</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link
                      href="/forum/neoforum-support"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Official Support Forum</h4>
                      <p className="text-gray-400 text-sm">Get help from the community</p>
                    </Link>
                    <Link
                      href="/forum/feature-requests"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Feature Requests</h4>
                      <p className="text-gray-400 text-sm">Suggest new features and improvements</p>
                    </Link>
                    <Link
                      href="/forum/announcements"
                      className="block p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-1">Announcements</h4>
                      <p className="text-gray-400 text-sm">Stay updated with platform news</p>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-black/50 border-green-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-green-400">Status & Updates</CardTitle>
                    <CardDescription className="text-gray-400">
                      Platform status and maintenance information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div>
                        <h4 className="text-white font-medium">All Systems Operational</h4>
                        <p className="text-gray-400 text-sm">Last updated: 2 minutes ago</p>
                      </div>
                    </div>
                    <Link href="/status" className="text-green-400 hover:text-green-300 underline text-sm">
                      View detailed status page →
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-orange-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-orange-400">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/privacy" className="block text-orange-400 hover:text-orange-300 underline">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="block text-orange-400 hover:text-orange-300 underline">
                      Terms of Service
                    </Link>
                    <Link href="/guidelines" className="block text-orange-400 hover:text-orange-300 underline">
                      Community Guidelines
                    </Link>
                    <Link href="/api-docs" className="block text-orange-400 hover:text-orange-300 underline">
                      API Documentation
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
