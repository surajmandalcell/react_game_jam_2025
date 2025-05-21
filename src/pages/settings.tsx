import React, { useEffect, useState } from "react";
import { Route, router } from "../router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    document.title = "Gorilla vs Men - Settings";

    // Load settings from localStorage
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    const isSoundEnabled = localStorage.getItem("soundEnabled") !== "false";

    setDarkMode(isDarkMode);
    setSoundEnabled(isSoundEnabled);

    // Apply dark mode if needed
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const handleSoundToggle = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem("soundEnabled", newSoundEnabled.toString());
  };

  const handleBack = () => {
    router.navigate(Route.HOME);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-background w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleBack}
              className="mr-2 text-foreground"
            >
              ←
            </Button>
            <CardTitle>Settings</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable game sounds
              </p>
            </div>
            <Switch
              id="sound"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>

          <Separator />

          <div className="pt-2">
            <h3 className="text-sm font-medium mb-2">About</h3>
            <p className="text-xs text-muted-foreground">
              Gorilla vs Men - Version 1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created for React Game Jam 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
