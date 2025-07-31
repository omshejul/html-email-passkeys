import Link from "next/link";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

// Import version from package.json
import packageJson from "../package.json";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const version = packageJson.version;

  return (
    <footer className=" border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 py-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="text-sm text-muted-foreground">
          © {currentYear} HTML Email{" "}
          <span className="inline-flex items-center rounded-full border border-border bg-transparent px-2 py-0.5 text-xs font-medium">
            v{version}
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com/omshejul"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <FiGithub className="w-4 h-4 stroke-current" />
          </Link>
          <Link
            href="https://twitter.com/omshejul"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Twitter"
          >
            <FiTwitter className="w-4 h-4 stroke-current" />
          </Link>
          <Link
            href="https://linkedin.com/in/omshejul"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <FiLinkedin className="w-4 h-4 stroke-current" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
