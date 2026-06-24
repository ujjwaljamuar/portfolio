import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({ content }) => (
  <div className="markdownBody">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ children, ...props }) => (
          <a target="_blank" rel="noreferrer" {...props}>
            {children}
          </a>
        ),
      }}
    >
      {content || ""}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;
