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
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-background w-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Gorilla vs Men</CardTitle>
          <CardDescription>A strategic multiplayer game</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">👨</span>
              <span className="text-sm">Men</span>
            </div>
            <span className="text-xl">vs</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">🦍</span>
              <span className="text-sm">Gorilla</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="text-center mb-6">
            <h3 className="text-lg font-medium mb-2">How to Play</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Men place mines to trap the gorilla.
            </p>
            <p className="text-sm text-muted-foreground">
              The gorilla tries to reveal all cells without hitting mines.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handlePlay}>
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

      <p className="mt-4 text-xs text-muted-foreground">Made with Rune SDK</p>
    </div>
  );
}

export default Home;
