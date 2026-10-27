import { dashboardController } from "./controllers/dashboard-controller.js";
import { aboutController } from "./controllers/about-controller.js";
import { usersController } from "./controllers/users-controller.js";
import { placesController } from "./controllers/places-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: usersController.index },
  { method: "GET", path: "/signup", config: usersController.showSignup },
  { method: "GET", path: "/login", config: usersController.showLogin },
  { method: "POST", path: "/logout", config: usersController.logout },
  { method: "POST", path: "/register", config: usersController.signup },
  { method: "POST", path: "/authenticate", config: usersController.login },
  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/about", config: aboutController.index },
  { method: "GET", path: "/place/{id}", config: placesController.index },
  { method: "POST", path: "/dashboard/places", config: dashboardController.addPlace },
  { method: "POST", path: "/dashboard/places/{id}/delete", config: dashboardController.deletePlace },
];
