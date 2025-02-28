import { createBrowserRouter } from "react-router-dom";
import Index from "../pages";
import DefaultElement from "../components/DefaultElement";

const Router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "/react-deepseek/",
        index: true,
        element: (
          <DefaultElement element={Index} meta={{ title: "小徐智能体" }} />
        ),
      },
    ],
  },
]);

export default Router;
