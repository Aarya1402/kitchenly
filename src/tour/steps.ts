import { Step } from "react-joyride";

/**
 * TourStep extends Joyride Step
 * data field contains route navigation info
 */
export type TourStep = Step & {
  controlled?: boolean;
  data?: {
    next?: string;
    previous?: string;
  };
};

export const TOUR_STEPS: TourStep[] = [
  {
    target: "body",
    placement: "center",
    content:
      "Welcome! This quick tour will show you how to add recipes and create smart shopping lists.",
    data: { next: "/" },
    disableBeacon: true,
  },
  {
    target: '[data-tour="dashboard-recent-recipes"]',
    content:
      "Here you'll see your recently added recipes in a carousel for quick access.",
    data: { next: "/my-recipes" },
    disableBeacon: true,
  },
  {
    target: '[data-tour="recipe-card"]',
    content:
      "Click on any recipe card to view its details, ingredients, and steps.",
    data: { previous: "/", next: "/my-recipes" },
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-recipe-button"]',
    content: "Use this button to add a new recipe.",
    disableBeacon: true,
    data: { previous: "/my-recipes", next: "/my-recipes" },
  },

  {
    target: '[data-tour="recipe-select-checkbox"]',
    content:
      "Select one or more recipes using these checkboxes to create a shopping list.",
    disableBeacon: true,
    data: { previous: "/my-recipes", next: "/my-recipes" },
  },
  {
    target: '[data-tour="navbar-lists"]',
    content: "Click here to view all your shopping lists.",

    data: { previous: "/my-recipes", next: "/shopping-lists" },
    disableBeacon: true,
  },
  {
    target: '[data-tour="add-list-button"]',
    content: "Create a new shopping list from your selected recipes.",
    disableBeacon: true,
    data: { previous: "/my-recipes", next: "/shopping-lists" },
  },
  {
    target: '[data-tour="list-card"]',
    content: "Click on a list card to view and manage its items.",
    disableBeacon: true,
    data: { previous: "/shopping-lists", next: "/shopping-lists/:id" },
  },
  {
    target: '[data-tour="list-item-checkbox"]',
    content:
      "Check off items as you shop. Your progress is saved automatically.",
    data: { previous: "/shopping-lists" },
    disableBeacon: true,
  },
];
