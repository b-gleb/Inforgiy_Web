import "@/styles/App.css";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },

  initialGlobals: {
    theme: "light"
  },

  globalTypes: {
    theme: {
      name: "Theme",
      description: "Light or dark color scheme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circle", title: "Light" },
          { value: "dark", icon: "circlehollow", title: "Dark" }
        ],
        dynamicTitle: true
      }
    }
  },

  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as "light" | "dark";
      return (
        <div className={theme}>
          <Story />
        </div>
      );
    }
  ]
};

export default preview;
