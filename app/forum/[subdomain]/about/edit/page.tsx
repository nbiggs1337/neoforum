"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Save, X, Plus, Trash2, BookOpen, Shield, LinkIcon, Award, Settings, Eye } from "lucide-react"

interface EditAboutPageProps {
  params: {
    subdomain: string
  }
}

export default function EditAboutPage({ params }: EditAboutPageProps) {
  const { subdomain } = params

  // Mock current forum data
  const [forumData, setForumData] = useState({
    name: "CyberTech Hub",
    description:
      "The premier destination for cybersecurity professionals, ethical hackers, and technology enthusiasts.",
    longDescription: `Welcome to CyberTech Hub, where the future of cybersecurity unfolds. Our community brings together industry professionals, researchers, students, and enthusiasts who are passionate about protecting the digital world.

Founded in 2024, we've grown to become one of the most trusted sources for cybersecurity discussions, tutorials, and industry insights. Whether you're a seasoned security professional or just starting your journey in cybersecurity, you'll find valuable resources and meaningful connections here.

Our mission is to democratize cybersecurity knowledge and create a safer digital world through education, collaboration, and innovation.`,
    category: "Technology",
    tags: [
      "cybersecurity",
      "ethical-hacking",
      "network-security",
      "cryptography",
      "malware-analysis",
      "digital-forensics",
    ],
  })

  const [rules, setRules] = useState([
    {
      id: 1,
      title: "Respect and Professionalism",
      description: "Treat all members with respect. No harassment, discrimination, or personal attacks.",
    },
    {
      id: 2,
      title: "No Illegal Activities",
      description:
        "Discussion of illegal hacking, malware distribution, or any illegal activities is strictly prohibited.",
    },
    {
      id: 3,
      title: "Quality Content",
      description: "Post relevant, high-quality content. Avoid spam, low-effort posts, or duplicate topics.",
    },
    {
      id: 4,
      title: "Responsible Disclosure",
      description: "Follow responsible disclosure practices when discussing vulnerabilities or security issues.",
    },
    {
      id: 5,
      title: "No Self-Promotion",
      description: "Excessive self-promotion or advertising is not allowed without prior approval from moderators.",
    },
  ])

  const [resources, setResources] = useState([
    {
      id: 1,
      title: "OWASP Top 10",
      description: "The most critical web application security risks",
      url: "https://owasp.org/www-project-top-ten/",
      category: "Security Standards",
      isInternal: false,
    },
    {
      id: 2,
      title: "NIST Cybersecurity Framework",
      description: "Framework for improving critical infrastructure cybersecurity",
      url: "https://www.nist.gov/cyberframework",
      category: "Frameworks",
      isInternal: false,
    },
    {
      id: 3,
      title: "CVE Database",
      description: "Common Vulnerabilities and Exposures database",
      url: "https://cve.mitre.org/",
      category: "Vulnerability Research",
      isInternal: false,
    },
    {
      id: 4,
      title: "Cybersecurity Learning Path",
      description: "Comprehensive guide to learning cybersecurity",
      url: "/forum/cybertech/guides/learning-path",
      category: "Education",
      isInternal: true,
    },
  ])

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Top Security Forum 2024",
      description: "Recognized as the leading cybersecurity community",
      date: "2024-03-01",
      icon: "🏆",
    },
    {
      id: 2,
      title: "10K Members Milestone",
      description: "Reached 10,000 active community members",
      date: "2024-02-15",
      icon: "🎉",
    },
    {
      id: 3,
      title: "Security Research Partnership",
      description: "Official partnership with leading security research institutions",
      date: "2024-01-20",
      icon: "🤝",
    },
  ])

  const [newTag, setNewTag] = useState("")

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      title: "New Rule",
      description: "Enter rule description...",
    }
    setRules([...rules, newRule])
  }

  const updateRule = (id: number, field: string, value: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }

  const deleteRule = (id: number) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const addResource = () => {
    const newResource = {
      id: Date.now(),
      title: "New Resource",
      description: "Enter resource description...",
      url: "https://",
      category: "General",
      isInternal: false,
    }
    setResources([...resources, newResource])
  }

  const updateResource = (id: number, field: string, value: string | boolean) => {
    setResources(resources.map((resource) => (resource.id === id ? { ...resource, [field]: value } : resource)))
  }

  const deleteResource = (id: number) => {
    setResources(resources.filter((resource) => resource.id !== id))
  }

  const addAchievement = () => {
    const newAchievement = {
      id: Date.now(),
      title: "New Achievement",
      description: "Enter achievement description...",
      date: new Date().toISOString().split("T")[0],
      icon: "🎯",
    }
    setAchievements([...achievements, newAchievement])
  }

  const updateAchievement = (id: number, field: string, value: string) => {
    setAchievements(
      achievements.map((achievement) => (achievement.id === id ? { ...achievement, [field]: value } : achievement)),
    )
  }

  const deleteAchievement = (id: number) => {
    setAchievements(achievements.filter((achievement) => achievement.id !== id))
  }

  const addTag = () => {
    if (newTag.trim() && !forumData.tags.includes(newTag.trim().toLowerCase())) {
      setForumData({
        ...forumData,
        tags: [...forumData.tags, newTag.trim().toLowerCase()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setForumData({
      ...forumData,
      tags: forumData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSave = () => {
    // In real app, save to API
    console.log("Saving forum data:", { forumData, rules, resources, achievements })
    // Show success message and redirect
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
            <Link href={`/forum/${subdomain}/about`}>
              <Button variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Link href={`/forum/${subdomain}/about`}>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </nav>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Edit About Page
          </h2>
          <p className="text-gray-400 text-lg">Customize your forum's about page, rules, and resources</p>
        </div>

        {/* Edit Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-black/50 border border-purple-500/30 grid grid-cols-5 w-full">
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Rules
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Forum Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your forum's basic information and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-purple-300">
                    Forum Name
                  </Label>
                  <Input
                    id="name"
                    value={forumData.name}
                    onChange={(e) => setForumData({ ...forumData, name: e.target.value })}
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-purple-300">
                    Short Description
                  </Label>
                  <Textarea
                    id="description"
                    value={forumData.description}
                    onChange={(e) => setForumData({ ...forumData, description: e.target.value })}
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription" className="text-purple-300">
                    Detailed Description
                  </Label>
                  <Textarea
                    id="longDescription"
                    value={forumData.longDescription}
                    onChange={(e) => setForumData({ ...forumData, longDescription: e.target.value })}
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                    rows={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-purple-300">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={forumData.category}
                    onChange={(e) => setForumData({ ...forumData, category: e.target.value })}
                    className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Forum Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {forumData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 cursor-pointer hover:bg-red-500/20"
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                    />
                    <Button
                      onClick={addTag}
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 bg-transparent"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-400">Community Rules</CardTitle>
                    <CardDescription className="text-gray-400">
                      Define the rules and guidelines for your community
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addRule}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium">Rule {index + 1}</h4>
                      <Button
                        onClick={() => deleteRule(rule.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-purple-300 text-sm">Title</Label>
                        <Input
                          value={rule.title}
                          onChange={(e) => updateRule(rule.id, "title", e.target.value)}
                          className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-purple-300 text-sm">Description</Label>
                        <Textarea
                          value={rule.description}
                          onChange={(e) => updateRule(rule.id, "description", e.target.value)}
                          className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-400">Helpful Resources</CardTitle>
                    <CardDescription className="text-gray-400">
                      Add useful links and resources for your community members
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addResource}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">Resource</h4>
                        {resource.isInternal ? (
                          <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">
                            Internal
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                            External
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteResource(resource.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">Title</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(resource.id, "title", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">Category</Label>
                          <Input
                            value={resource.category}
                            onChange={(e) => updateResource(resource.id, "category", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">URL</Label>
                          <Input
                            value={resource.url}
                            onChange={(e) => updateResource(resource.id, "url", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`internal-${resource.id}`}
                            checked={resource.isInternal}
                            onChange={(e) => updateResource(resource.id, "isInternal", e.target.checked)}
                            className="rounded border-purple-500/30"
                          />
                          <Label htmlFor={`internal-${resource.id}`} className="text-purple-300 text-sm">
                            Internal Link
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-purple-300 text-sm">Description</Label>
                      <Textarea
                        value={resource.description}
                        onChange={(e) => updateResource(resource.id, "description", e.target.value)}
                        className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-400">Community Achievements</CardTitle>
                    <CardDescription className="text-gray-400">
                      Showcase your community's milestones and achievements
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addAchievement}
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-medium">Achievement</h4>
                      <Button
                        onClick={() => deleteAchievement(achievement.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-300 hover:bg-red-800 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">Title</Label>
                          <Input
                            value={achievement.title}
                            onChange={(e) => updateAchievement(achievement.id, "title", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">Icon (Emoji)</Label>
                          <Input
                            value={achievement.icon}
                            onChange={(e) => updateAchievement(achievement.id, "icon", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                            placeholder="🏆"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-purple-300 text-sm">Date</Label>
                          <Input
                            type="date"
                            value={achievement.date}
                            onChange={(e) => updateAchievement(achievement.id, "date", e.target.value)}
                            className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-purple-300 text-sm">Description</Label>
                      <Textarea
                        value={achievement.description}
                        onChange={(e) => updateAchievement(achievement.id, "description", e.target.value)}
                        className="bg-black/50 border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">About Page Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure visibility and permissions for your about page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Public About Page</h4>
                    <p className="text-gray-400 text-sm">Allow non-members to view the about page</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-purple-500/30" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Show Member List</h4>
                    <p className="text-gray-400 text-sm">Display moderators and active members</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-purple-500/30" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Show Statistics</h4>
                    <p className="text-gray-400 text-sm">Display forum statistics and metrics</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-purple-500/30" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Allow Resource Suggestions</h4>
                    <p className="text-gray-400 text-sm">Let members suggest new resources</p>
                  </div>
                  <input type="checkbox" className="rounded border-purple-500/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
