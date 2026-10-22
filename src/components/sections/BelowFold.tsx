import { About } from "./About";
import { Skills } from "./Skills";
import { Experience } from "./Experience";
import { Projects } from "./Projects";
import { Education } from "./Education";
import { Contact } from "./Contact";

/** Everything under the hero, split into its own chunk so the first screen needs less JavaScript. */
export default function BelowFold() {
  return (
    <>
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Contact />
    </>
  );
}
