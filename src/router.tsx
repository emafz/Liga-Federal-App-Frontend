import { createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";

import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import CreateUser from "@/pages/CreateUser/CreateUser";

const rootRoute = createRootRoute({
  component: Outlet,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const createUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-user",
  component: CreateUser,
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute, createUserRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
