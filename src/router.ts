export enum Route {
  HOME = "/home",
  LOBBY = "/lobby",
  SETTINGS = "/settings",
  GAME = "/game",
  END = "/end",
}

export class Router {
  private static instance: Router;
  private currentRoute: Route = Route.HOME;
  private listeners: ((route: Route) => void)[] = [];

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  private constructor() {
    const savedRoute = localStorage.getItem("currentRoute");
    if (savedRoute && Object.values(Route).includes(savedRoute as Route)) {
      this.currentRoute = savedRoute as Route;
    } else {
      this.currentRoute = Route.LOBBY;
    }
  }

  public getCurrentRoute(): Route {
    return this.currentRoute;
  }

  public navigate(route: Route): void {
    this.currentRoute = route;
    localStorage.setItem("currentRoute", route);

    this.notifyListeners();
  }

  public addListener(listener: (route: Route) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (route: Route) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentRoute));
  }
}

export const router = Router.getInstance();
