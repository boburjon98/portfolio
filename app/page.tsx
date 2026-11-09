import { portfolioMarkup } from "../lib/portfolioMarkup";

/** SEO-visible, fully server-rendered content. Interactivity is progressive enhancement. */
export default function HomePage() {
  return <div dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}
