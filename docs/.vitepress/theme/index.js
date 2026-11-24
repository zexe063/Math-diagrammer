import DefaultTheme from "vitepress/theme-without-fonts";
import DiagramExample from "../components/DiagramExample.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DiagramExample", DiagramExample);
  },
};
