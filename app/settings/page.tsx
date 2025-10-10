"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { Globe, Save } from "lucide-react"

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const [hasChanges, setHasChanges] = useState(false)

  const handleLanguageChange = (newLanguage: "uz" | "ru") => {
    setLanguage(newLanguage)
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
    // In a real app, you might want to save to backend
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t("settings")}</h1>
            <p className="text-muted-foreground">Manage your application preferences and settings</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("language")} Settings
                </CardTitle>
                <CardDescription>Choose your preferred language for the interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language-select">{t("language")}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uz">O'zbek tili (Uzbek)</SelectItem>
                      <SelectItem value="ru">Русский язык (Russian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  The interface language will change immediately after selection.
                </div>
              </CardContent>
            </Card>

            {/* Application Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>General application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Admin Panel Version</Label>
                  <div className="text-sm text-muted-foreground">v1.0.0</div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-sm text-muted-foreground">Green (#16A34A)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <div className="text-sm text-muted-foreground">Light Mode (Fixed)</div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Connected</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cache Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Storage Usage</Label>
                  <div className="text-sm text-muted-foreground">2.4 GB / 10 GB used</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-center">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                {t("save")} Changes
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
