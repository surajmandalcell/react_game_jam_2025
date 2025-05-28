import React, { useEffect } from "react";
import { Route, router } from "../router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bomb, Crosshair, Users } from "lucide-react";

export function Home() {
  useEffect(() => {
    document.title = "Gorilla vs Men";
  }, []);

  const handlePlay = () => {
    router.navigate(Route.LOBBY);
  };

  const handleSettings = () => {
    router.navigate(Route.SETTINGS);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gradient-to-b from-background to-muted/30 w-full overflow-y-auto">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-2 bg-amber-600 hover:bg-amber-700">
            React Game Jam 2025
          </Badge>
          <CardTitle className="text-3xl font-bold">Gorilla vs Men</CardTitle>
          <CardDescription className="text-lg italic">
            "Trust No One"
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                👨
              </div>
              <span className="text-sm font-medium">Men</span>
            </div>
            <span className="text-xl font-bold text-red-500">vs</span>
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2 bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                🦍
              </div>
              <span className="text-sm font-medium">Gorilla</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center mb-6 space-y-4">
            <h3 className="text-lg font-semibold">A Game of Deception</h3>

            <div className="flex items-center gap-2 justify-center">
              <Bomb className="h-4 w-4 text-red-500" />
              <p className="text-sm">Hidden mines, hidden motives</p>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Crosshair className="h-4 w-4 text-green-500" />
              <p className="text-sm">
                Reveal safe paths or spring deadly traps
              </p>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm">Trust no one, not even your allies</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={handlePlay}
          >
            Play Now
          </Button>
          <Button
            variant="outline"
            className="w-full text-foreground"
            onClick={handleSettings}
          >
            Settings
          </Button>
        </CardFooter>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Made with React & Rune SDK for React Game Jam 2025
      </p>
    </div>
  );
}

export default Home;
