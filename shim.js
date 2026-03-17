// =============================================================
// shim.js — Obsidian Web Port: Node/Electron API shim layer
// Injected before all other scripts in index.html
// =============================================================

// ────────────────────────────────────────────────────────────
// 1. process global
// ────────────────────────────────────────────────────────────
window.process = {
  platform: "linux",
  arch: "x64",
  versions: { electron: "28.0.0", node: "20.0.0" },
  env: { OBSIDIAN_DISABLE_GPU: "" },
  argv: [],
  cwd: () => "/vault",
};

// ────────────────────────────────────────────────────────────
// 2. Minimal path implementation (path-browserify subset)
// ────────────────────────────────────────────────────────────
const pathShim = (() => {
  const sep = "/";

  function normalize(p) {
    if (!p) return ".";
    const abs = p.startsWith("/");
    const parts = p.split(/[\/]+/).filter(Boolean);
    const out = [];
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") { if (out.length && out[out.length-1] !== "..") out.pop(); else if (!abs) out.push(".."); }
      else out.push(part);
    }
    const result = (abs ? "/" : "") + out.join("/");
    return result || ".";
  }

  function join(...args) {
    return normalize(args.filter(a => a != null).join("/"));
  }

  function dirname(p) {
    if (!p) return ".";
    const norm = normalize(p);
    const idx = norm.lastIndexOf("/");
    if (idx === -1) return ".";
    if (idx === 0) return "/";
    return norm.slice(0, idx);
  }

  function basename(p, ext) {
    const norm = normalize(p);
    let base = norm.slice(norm.lastIndexOf("/") + 1);
    if (ext && base.endsWith(ext)) base = base.slice(0, base.length - ext.length);
    return base;
  }

  function extname(p) {
    const base = basename(p);
    const dot = base.lastIndexOf(".");
    if (dot <= 0) return "";
    return base.slice(dot);
  }

  function resolve(...args) {
    let resolved = "/vault";
    for (const arg of args) {
      if (arg.startsWith("/")) resolved = arg;
      else resolved = join(resolved, arg);
    }
    return normalize(resolved);
  }

  function relative(from, to) {
    const fromParts = normalize(from).split("/").filter(Boolean);
    const toParts = normalize(to).split("/").filter(Boolean);
    let i = 0;
    while (i < fromParts.length && fromParts[i] === toParts[i]) i++;
    return [...fromParts.slice(i).map(() => ".."), ...toParts.slice(i)].join("/") || ".";
  }

  return { sep, join, normalize, dirname, basename, extname, resolve, relative, toLowerCase: () => pathShim };
})();

// ────────────────────────────────────────────────────────────
// 3. Virtual Filesystem (in-memory)
// ────────────────────────────────────────────────────────────
const VFS = (() => {
  // files: path → string content
  // dirs: set of known directory paths
  const files = {
  "/vault/Adventurer/From plain-text note-taking.md": "Obsidian is similar to plain-text based note-taking apps in the sense that [[Vault is just a local folder|a vault is just a local folder]].\n\nHaving already taken the unconventional route of plain-text note-taking, chances are you’re already familiar with the benefit of it. Obsidian has the same benefits, plus we have our secret sauce that can make Obsidian really special for you.\n\n→ [[Plugins make Obsidian special for you|Tell me more about that secret sauce!]]\n\n→ [[Get started with Obsidian|Say no more. How do I get started?]]",
  "/vault/Adventurer/From standard note-taking.md": "Great, that means you should already be familiar with taking notes!\n\nBut hold on a second. There’s no silver bullet solution that works perfectly for everyone. Obsidian works best if you care about what we care about.\n\nDo you have any of the following concerns below?\n\n→ [[Vault is just a local folder|I don’t want my notes to been seen by others]]\n\n→ [[Vault is just a local folder|I don’t want my notes to be inaccessible someday]]\n\n→ [[Plugins make Obsidian special for you|I feel like the previous note-taking apps I used didn’t suit me well]]\n\n→ [[Get started with Obsidian|Just let me get started already]]\n",
  "/vault/Adventurer/No prior experience.md": "There are plenty of note-taking apps out there, so congratulations on finding Obsidian! You may have heard that Obsidian is really hard to use, but we assure you the basics are easy to learn!\n\nThere’s no silver bullet solution that works perfectly for everyone. Obsidian works best if you care about what we care about.\n\nDo you have any of the following concerns below?\n\n→ [[Vault is just a local folder|I don’t want my notes to been seen by others]]\n\n→ [[Vault is just a local folder|I don’t want my notes to be inaccessible someday]]\n\n→ [[Plugins make Obsidian special for you|I have special needs that most note-taking apps might not meet]]\n\n→ [[Get started with Obsidian|Just let me get started already]]\n\n\n",
  "/vault/Formatting/Blockquote.md": "```md\n> Human beings face ever more complex and urgent problems, and their effectiveness in dealing with these problems is a matter that is critical to the stability and continued progress of society.\n\n\\- Doug Engelbart, 1961\n```\n\n> Human beings face ever more complex and urgent problems, and their effectiveness in dealing with these problems is a matter that is critical to the stability and continued progress of society.\n\n\\- Doug Engelbart, 1961",
  "/vault/Formatting/Callout.md": "As of v0.14.0, Obsidian supports callout blocks, sometimes called \"admonitions\". Callout blocks are written as a blockquote, inspired by the \"alert\" syntax from Microsoft Docs.\n\nCallouts are also supported natively on Obsidian Publish.\n\n> [!NOTE]\n> For compatibility reasons, if you're also using the Admonitions plugin, you should update it to at least v8.0.0 to avoid problems with the new callout system.\n\nUse the following syntax to denote a callout block: `> [!INFO]`.\n\n```markdown\n> [!INFO]\n> Here's a callout block.\n> It supports **markdown** and [[Internal link|wikilinks]].\n```\n\nIt will show up like this:\n> [!INFO]\n> Here's a callout block.\n> It supports **markdown** and [[Internal link|wikilinks]].\n\n### Types\n\nBy default, there are 12 distinct callout types, each with several aliases. Each type comes with a different background color and icon.\n\nTo use these default styles, replace `INFO` in the examples with any of these types. Any unrecognized type will default to the \"note\" type, unless they are [[#Customizations|customized]]. The type identifier is case insensitive.\n\n- note\n- abstract, summary, tldr\n- info, todo\n- tip, hint, important\n- success, check, done\n- question, help, faq\n- warning, caution, attention\n- failure, fail, missing\n- danger, error\n- bug\n- example\n- quote, cite\n\n### Title and body\n\nYou can define the title of the callout block, and you can also have a callout without body content.\n\n```markdown\n> [!TIP] Callouts can have custom titles, which also supports **markdown**!\n```\n\n### Folding\n\nAdditionally, you can create a folding callout by adding `+` (default expanded) or `-` (default collapsed) after the block.\n\n```markdown\n> [!FAQ]- Are callouts foldable?\n> Yes! In a foldable callout, the contents are hidden until it is expanded.\n```\n\nWill show up as:\n\n> [!FAQ]- Are callouts foldable?\n> Yes! In a foldable callout, the contents are hidden until it is expanded.\n\n### Customizations\n\nSnippets and plugins can define custom callouts too, or overwrite the default options. Callout types and icons are defined in CSS, where the color is an `r, g, b` tuple and the icon is the icon ID from any internally supported icon (like `lucide-info`). Alternatively, you can specify an SVG icon as a string.\n\n```CSS\n.callout[data-callout=\"my-callout-type\"] {\n    --callout-color: 0, 0, 0;\n    --callout-icon: icon-id;\n    --callout-icon: '<svg>...custom svg...</svg>';\n}\n```\n",
  "/vault/Formatting/Code block.md": "Syntax highlight is supported with the language specified after the first set of backticks. We use prismjs for syntax highlighting, a list of supported languages can be found [at their site](https://prismjs.com/#supported-languages)\n\n<pre><code>```js\nfunction fancyAlert(arg) {\n  if(arg) {\n    $.facebox({div:'#foo'})\n  }\n}\n```</code></pre>\n\n```js\nfunction fancyAlert(arg) {\n  if(arg) {\n    $.facebox({div:'#foo'})\n  }\n}\n```\n    \n\t\n```md\n    Text indented with a tab is formatted like this, and will also look like a code block in preview. \n```\n\n    Text indented with a tab is formatted like this, and will also look like a code block in preview. ",
  "/vault/Formatting/Comment.md": "Use `%%` to enclose comments, which will be parsed as Markdown, but will not show up in the preview.\n\n```md\nHere is an inline comment: %%You can't see this text%% (can't see it in preview)\n\nHere is a block comment: (can't see it in preview either)\n%%\nIt can span\nmultiple lines\n%%\n```\n\nHere is an inline comment: %%You can't see this text%% (can't see it in preview)\n\nHere is a block comment: (can't see it in preview either)\n%%\nIt can span\nmultiple lines\n%%\n\n> [!note]\n> For ease of editing, comments remain visible in the Live Preview mode.\n",
  "/vault/Formatting/Diagram.md": "Obsidian uses [Mermaid](https://mermaid-js.github.io/) to render diagrams and charts. Mermaid also provides [a helpful live editor](https://mermaid-js.github.io/mermaid-live-editor).\n\n<pre><code>```mermaid\nsequenceDiagram\n    Alice->>+John: Hello John, how are you?\n    Alice->>+John: John, can you hear me?\n    John-->>-Alice: Hi Alice, I can hear you!\n    John-->>-Alice: I feel great!\n```</code></pre>\n\n```mermaid\nsequenceDiagram\n    Alice->>+John: Hello John, how are you?\n    Alice->>+John: John, can you hear me?\n    John-->>-Alice: Hi Alice, I can hear you!\n    John-->>-Alice: I feel great!\n```\n\nObsidian supports linking to notes in Mermaid:\n<pre><code>```mermaid\ngraph TD\n\nBiology --> Chemistry\n\nclass Biology,Chemistry internal-link;\n```</code></pre>\n\nAn easier way to do it is the following: ^376b9d\n<pre><code>```mermaid\ngraph TD\n\nA[Biology]\nB[Chemistry]\n\nA --> B\n\nclass A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z internal-link;\n```</code></pre>\n\nThis way, all the note names (at least until `Z[note name]`) are all automatically assigned the class `internal-link` when you use this snippet.\n\nIf you use special characters in your note names, you need to put the note name in double quotes.\n`\"⨳ special character\"`\nIt looks like this if you follow the [[Format your notes#^376b9d|second option]]:\n`A[\"⨳ special character\"]`",
  "/vault/Formatting/Embeds.md": "Embed another file (read more about [[Embeds]]). Here's an embedded section:\n\n```md\n![[Plugins makes Obsidian special for you]]\n```\n\n![[Plugins make Obsidian special for you]]",
  "/vault/Formatting/Emphasis.md": "```md\n*This text will be italic*\n_This will also be italic_\n```\n\n*This text will be italic*\n_This will also be italic_\n\n```md\n**This text will be bold**\n__This will also be bold__\n```\n\n**This text will be bold**\n__This will also be bold__\n\n```md\n_You **can** combine them_\n```\n\n_You **can** combine them_",
  "/vault/Formatting/Footnote.md": "```md\nHere's a simple footnote,[^1] and here's a longer one.[^bignote]\n\n[^1]: meaningful!\n\n[^bignote]: Here's one with multiple paragraphs and code.\n\n    Indent paragraphs to include them in the footnote.\n\n    `{ my code }`\n\n    Add as many paragraphs as you like.\n```\n\nHere's a simple footnote,[^1] and here's a longer one.[^bignote]\n\n[^1]: meaningful!\n\n[^bignote]: Here's one with multiple paragraphs and code.\n\n    Indent paragraphs to include them in the footnote.\n\n    `{ my code }`\n\n    Add as many paragraphs as you like.\n\t\n```md\nYou can also use inline footnotes. ^[notice that the carat goes outside of the brackets on this one.]\n```\n\nYou can also use inline footnotes. ^[notice that the carat goes outside of the brackets on this one.]",
  "/vault/Formatting/Format your notes.md": "Obsidian is a Markdown-based note-taking and knowledge base app. \n\nWe currently support the formats below:\n\n![[Internal link]]\n\n![[Embeds]]\n\n![[Heading]]\n\n![[Emphasis]]\n\n![[Lists]]\n\n![[Images]]\n\n![[Links]]\n\n![[Blockquote]]\n\n![[Inline code]]\n\n![[Code block]]\n\n![[Task]]\n\n![[Table]]\n\n![[Strikethrough]]\n\n![[Highlighting]]\n\n![[Horizontal divider]]\n\n![[Footnote]]\n\n![[Math]]\n\n![[Comment]]\n\n![[Callout]]\n\n![[Diagram]]\n\n",
  "/vault/Formatting/Heading.md": "```md\n# This is a heading 1\n## This is a heading 2\n### This is a heading 3 \n#### This is a heading 4\n##### This is a heading 5\n###### This is a heading 6\n```\n\n# This is a heading 1\n## This is a heading 2\n### This is a heading 3 \n#### This is a heading 4\n##### This is a heading 5\n###### This is a heading 6",
  "/vault/Formatting/Highlighting.md": "```md\nUse two equal signs to ==highlight text==.\n```\n\nUse two equal signs to ==highlight text==.",
  "/vault/Formatting/Horizontal divider.md": "```md\nUse three stars ***, minuses ---, or underscores ___ in a new line to produce an horizontal bar.\n```\n\n---",
  "/vault/Formatting/Images.md": "```md\n![Obsidian](https://obsidian.md/images/banner.png)\n```\n\n![Obsidian](https://obsidian.md/images/banner.png)\n\n#### Resizing images\n\nExample of this above image resized to 200 pixels wide:\n\n```md\n![Obsidian|200](https://obsidian.md/images/banner.png)\n```\n\n![Obsidian|200](https://obsidian.md/images/banner.png)\n",
  "/vault/Formatting/Inline code.md": "```md\nText inside `backticks` on a line will be formatted like code.\n```\n\nText inside `backticks` on a line will be formatted like code. ",
  "/vault/Formatting/Internal link.md": "```md\nLink to a page: [[Embeds]].\n```\n\nLink to a page: [[Embeds]].",
  "/vault/Formatting/Links.md": "#### External links\n\nMarkdown style links can be used to refer to either external objects, such as web pages, or an internal page or image.\n\n```md\nhttp://obsidian.md - automatic!\n[Obsidian](http://obsidian.md)\n```\n\nhttp://obsidian.md - automatic!\n[Obsidian](http://obsidian.md)\n\n#### Obsidian URI links\n\nObsidian URI links can be used to open notes in Obsidian either from another Obsidian vault or another program.\n\nFor example, you can link to a file in a vault like so (please note the required encoding):\n\n```md\n[Link to note](obsidian://open?path=D:%2Fpath%2Fto%2Ffile.md)\n```\n\n[Link to note](obsidian://open?path=D:%2Fpath%2Fto%2Ffile.md)\n\nYou can link to a note by its vault name and file name instead of path as well:\n\n```md\n[Link to note](obsidian://open?vault=MainVault&file=MyNote.md)\n```\n\n[Link to note](obsidian://open?vault=MainVault&file=MyNote.md)\n\n#### Escaping\n\nIf there are spaces in the url, they can be escaped by either using `%20` as a space, such as:\n\n```md\n[Format your notes](Format%20your%20notes)\n```\n\n[Format your notes](Format your notes.md)\n\nOr you can enclose the target in `<>`, such as:\n\n```md\n[Format your notes](<Format your notes>)\n```\n\n[Format your notes](<Format your notes>)\n",
  "/vault/Formatting/Lists.md": "```md\n- Item 1\n- Item 2\n  - Item 2a\n  - Item 2b\n\n1. Item 1\n1. Item 2\n1. Item 3\n   1. Item 3a\n   1. Item 3b\n```\n\n- Item 1\n- Item 2\n  - Item 2a\n  - Item 2b\n\n1. Item 1\n1. Item 2\n1. Item 3\n   1. Item 3a\n   1. Item 3b",
  "/vault/Formatting/Math.md": "```md\n$$\\begin{vmatrix}a & b\\\\\nc & d\n\\end{vmatrix}=ad-bc$$\n```\n\n$$\\begin{vmatrix}a & b\\\\\nc & d\n\\end{vmatrix}=ad-bc$$\n\nYou can also do inline math like $e^{2i\\pi} = 1$ .\n\nObsidian uses [Mathjax](http://docs.mathjax.org/en/latest/basic/mathjax.html). You can check which packages are supported in Mathjax [here](http://docs.mathjax.org/en/latest/input/tex/extensions/index.html).",
  "/vault/Formatting/Strikethrough.md": "```md\nAny word wrapped with two tildes (like ~~this~~) will appear crossed out.\n```\n\nAny word wrapped with two tildes (like ~~this~~) will appear crossed out.",
  "/vault/Formatting/Table.md": "You can create tables by assembling a list of words and dividing them with hyphens `-` (for the first row), and then separating each column with a pipe `|`:\n\n```md\nFirst Header | Second Header\n------------ | ------------\nContent from cell 1 | Content from cell 2\nContent in the first column | Content in the second column\n```\n\nFirst Header | Second Header\n------------ | ------------\nContent from cell 1 | Content from cell 2\nContent in the first column | Content in the second column\n\n---\n\n```md\nTables can be justified with a colon | Another example with a long title\n:----------------|-------------:\nbecause of the `:` | these will be justified\n```\n\nTables can be justified with a colon | Another example with a long title\n:----------------|-------------:\nbecause of the `:` | these will be justified\n\nIf you put links in tables, they will work, but if you use Piped Links, the pipe must be escaped with a `\\` to prevent it being read as a table element.\n\n```md\nFirst Header | Second Header\n------------ | ------------\n[[Format your notes\\|Formatting]]\t|  [[Callouts\\|Callouts]]\n```\n\nFirst Header | Second Header\n------------ | ------------\n[[Format your notes\\|Formatting]]\t|  [[Callout\\|Callouts]]\n",
  "/vault/Formatting/Task.md": "```md\n- [x] #tags, [links](), **formatting** supported\n- [x] list syntax required (any unordered or ordered list supported)\n- [x] this is a complete item\n- [?] this is also a complete item (works with every character)\n- [ ] this is an incomplete item\n- [ ] tasks can be clicked in Preview to be checked off\n```\n\n- [x] #tags, [links](), **formatting** supported\n- [x] list syntax required (any unordered or ordered list supported)\n- [x] this is a complete item\n- [?] this is also a complete item (works with every character)\n- [ ] this is an incomplete item\n- [ ] tasks can be clicked in Preview to be checked off",
  "/vault/Guides/Create a vault.md": "A vault is a folder on your local file system where Obsidian stores your notes. You can keep all your notes in one vault, or create several vaults for each of your different projects.\n\nThe first time you open Obsidian, you'll be asked to add a new vault.\n\nTo create a new empty vault from the vault switcher:\n\n1. To the right of **Create new vault**, click **Create**.\n2. In **Vault name**, enter the name of your vault.\n3. Click **Browse** to select where your new vault will be created.\n4. Click **Create**.\n\nIf you already have a folder that you want to use as your vault:\n\n1. To the right of **Open folder as vault**, click **Open**.\n2. In the file browser, select the folder you want to use as your vault.\n3. Click **Open**.\n\nNow that you've set up your vault, you're ready to [[Create your first note]].",
  "/vault/Guides/Create your first note.md": "Notes in Obsidian are stored as plain text files, which makes them incredibly portable. By writing your notes in plain text, they'll outlive any app—even Obsidian itself. If you plan to keep your notes for a long time, this is great news!\n\n## Create a new note\n\nTo create a new note:\n\n1. Press Ctrl+N (or Cmd+N on macOS) on your keyboard.\n2. Type \"Obsidian\" as the name of your note and press Enter.\n3. Copy and paste the following text into your note:\n\n> Obsidian is a powerful knowledge base on top of a local folder of plain text Markdown files.\n\n## Format your note\n\nObsidian also supports [Markdown](https://en.wikipedia.org/wiki/Markdown)—a markup language for adding formatting to plain text files.\n\n1. Copy and paste the following text at the top of the Obsidian note:\n\n   > \\# A second brain, for you, forever.\n\n   The hashtag (#) turns a row of text into a heading.\n\n2. In your note, select the text \"knowledge base\" and press Ctrl+B (or Cmd+B on macOS) to make it bold.\n\nTo learn more about how to format your notes using Markdown, refer to [[Format your notes]].\n\n## Learn more\n\nLearn how to [[Link notes|link notes]] to create a network of connected thoughts.\n",
  "/vault/Guides/Get started with Obsidian.md": "You may have heard that Obsidian is very complicated to set up.\n\nWe don’t think that’s true—the ideal setup would be complicated, but that’s true for all tools. It just takes lots of trial and error to get something that works well for you. Instead of complicated, we would call that a labor of love.\n\nOkay, enough for how complicated it can get. The good news is how easy it is to get started: just 3 simple steps!\n\n1. Set up a nice place for yourself\n   → [[Create a vault]]\n   \n2. Jot down some notes\n   → [[Create your first note]]\n   \n3. Let your ideas mingle\n   → [[Link notes]]",
  "/vault/Guides/Link notes.md": "While Obsidian is great for taking notes, the true power of Obsidian lies in being able to link your notes together. By understanding how one piece of information relates to another, you can improve your ability to remember them and to form deeper insights. In this guide, you'll learn how to create and navigate links in Obsidian.\n\n## Step 1: Create a link\n\nIn this step, you'll create two notes and link them together using the \\[\\[double bracket syntax\\]\\].\n\n1. [[Create your first note|Create a note]] with the name \"Three laws of motion\":\n\n   > The laws of motion are three laws stated by Isaac Newton, that describe the relationship between the motion of an object, and the forces acting on it.\n\n1. Create another note with the name \"Law of Inertia\" with the following text:\n\n   > The Law of Inertia is one of the\n\n1. At the end of the sentence, press the left square bracket (`[`) twice on your keyboard.\n1. Type \"three\" to find the first note you created.\n1. Press Enter to create a link to the highlighted note.\n\n   > The Law of Inertia is one of the \\[\\[Three laws of motion\\]\\]\n\nOpen the \"Three laws of motion\" note by clicking on the link while pressing Ctrl (or Cmd on macOS).\n\n## Step 2: Create a link to a non-existing note\n\nYou can create links to notes that don't exist yet, for when you want to dive into a topic at a later time.\n\n1. In your \"Three laws of motion\" note, select the text \"Isaac Newton\".\n1. Press the left square bracket (`[`) twice on your keyboard to create a link. The second link has a more muted color to indicate that the note doesn't exist yet.\n1. Create the note by clicking on the link while pressing Ctrl (or Cmd on macOS).\n\n## Step 3: Navigate between notes\n\nAs you've seen in the previous steps, you can click a link while pressing Ctrl (or Cmd on macOS) to go to the linked note.\n\nAnother way to navigate between the notes is through _backlinks_. A backlink lets you navigate in the opposite direction of an existing link.\n\n1. Open the \"Isaac Newton\" note.\n1. In the right side bar, click the **Backlinks** tab.\n1. Under **Linked mentions**, click the mention in \"Three laws of motion\" to go to that note.\n\nAnother way to navigate between your notes is by using a visual representation of how your notes are connected.\n\n1. In the top-right corner of the note, click **More options** (three dots).\n2. Hover over **Open linked view**.\n3. Select **Open local graph**.\n4. Click any of the nodes in the graph to navigate to that note.\n\n## Learn more\n\nUnderstanding how your notes are connected becomes increasingly more difficult as your vault grows. Learn how to use the graph view to gain deeper insights from your knowledge base.\n",
  "/vault/Plugins make Obsidian special for you.md": "We started making Obsidian with plugins in mind because everyone seems to take notes differently. Offering a generic set of tools for a note-taker is like offering only one configuration of kitchen for passionate home cooks.\n\nThere are two types of plugins in Obsidian: core plugins and community plugins.\n\n## Modular core plugins\n\nCore plugins are made by us, and they give Obsidian basic modularity. “Modularity” is just a fancy word for having neat features that can be turned on and off without affecting the other pieces.\n\n## Wild community plugins\n\nPlugins not only provide Obsidian with modularity, but also enhance its extensibility. Extensibility means other people can add features to Obsidian as they see fit.\n\nUnfortunately, you’d need to know some coding to know how to do that. But fortunately, Obsidian has a community plugin store that lets you install these community plugins with one click.\n\nA big shoutout to plugin developers who are generously sharing their own gems with the community!\n\n---\n\nIf you’re convinced Obsidian is worth a try for you, it’s time to get started:\n\n→ [[Get started with Obsidian]]\n",
  "/vault/Start here.md": "Hi, welcome to Obsidian!\n\n---\n\n## I’m interested in Obsidian\n\nFirst of all, tell me a little bit about what's your experience with note-taking apps like?\n\n- [[No prior experience|I have no prior experience]]\n- [[From standard note-taking|I’ve used note-taking apps like Evernote and OneNote]]\n- [[From plain-text note-taking|I have used plain-text based apps]]\n\n---\n\n## Official Help Site\nCheck out the complete [Obsidian documentation](https://help.obsidian.md/) online, available in multiple languages.\n\n---\n\n## What is this place?\n\nThis is a sandbox vault in which you can test various functionalities of Obsidian. \n\n> [!Warning]\n> Your changes will not be saved, so please don't take actual notes in this vault.\n\n> [!Note] Beta vault - contributions are welcome!\n> This sandbox vault is in beta!\n> \n> If you spot a typo or a mistake, feel free to submit a pull request [here](https://github.com/obsidianmd/obsidian-docs/tree/master/Sandbox).\n\n\n",
  "/vault/Vault is just a local folder.md": "Different than most note-taking apps out there, an Obsidian vault is not a notebook on our server or a bundle in a special format on your computer.\n\nIn Obsidian, a vault is a plain folder on your computer. By plain, we mean it's just like a folder you created and put some files in. You can open it with your system explorer or Finder, zip it up, make a copy, or move it around.\n\n> [!SUMMARY] The Point™\n> The point is that you own this folder just like the other folder of camping photos that you created yourself.\n> \n> It’s supposed to be a good thing because you get both **data ownership and privacy** this way. Just keep in mind [[#^0f681f|with great power comes great responsibility]].\n\nNo need to worry about loading your content from our servers. You know, servers can get hacked or be offline or be slow when you need it most.\n\nNo need to worry about exporting or converting if you move away from Obsidian either. The vault is just a folder that sits there—Obsidian is not going to delete any of your vault folders just because you uninstall Obsidian.\n\nFinally, please understand that with great power comes great responsibility. Now that you’re in charge of your data, it’s also your job to back it up and keep it safe. ^0f681f\n\n> [!Note]- A word on moving your vault folder\n> Technically you can freely move your vault folder around just like how you move any other folder. But if you do, Obsidian will be confused, so make sure to open it again at the new location with Obsidian after you moved it.\n\n---\n\nIf you’re convinced Obsidian is worth a try for you, it’s time to get started:\n\n→ [[Get started with Obsidian]]\n"
};

  // Add minimal .obsidian config so Obsidian doesn't reject the vault
  files["/vault/.obsidian/app.json"] = JSON.stringify({});
  files["/vault/.obsidian/workspace.json"] = JSON.stringify({
    main: { id: "main", type: "split", children: [] },
    left: { id: "left", type: "split", children: [], collapsed: true },
    right: { id: "right", type: "split", children: [], collapsed: true }
  });

  // Build directory set from file paths
  const dirs = new Set(["/", "/vault", "/tmp"]);
  for (const p of Object.keys(files)) {
    let cur = pathShim.dirname(p);
    while (cur !== "/" && cur !== ".") {
      dirs.add(cur);
      cur = pathShim.dirname(cur);
    }
    dirs.add("/");
  }

  function normPath(p) {
    if (typeof p !== "string") p = String(p);
    return pathShim.normalize(p.startsWith("/") ? p : "/vault/" + p);
  }

  function existsSync(p) {
    p = normPath(p);
    return p in files || dirs.has(p);
  }

  function readFileSync(p, enc) {
    p = normPath(p);
    if (p in files) return files[p];
    // Directory reads throw EISDIR (not ENOENT) so vault existence check passes
    if (dirs.has(p)) throw Object.assign(new Error("EISDIR: illegal operation on a directory, read '" + p + "'"), { code: "EISDIR", path: p });
    throw Object.assign(new Error("ENOENT: no such file or directory, open '" + p + "'"), { code: "ENOENT", path: p });
  }

  function writeFileSync(p, data) {
    p = normPath(p);
    files[p] = typeof data === "string" ? data : String(data);
    // ensure dir entries
    let cur = pathShim.dirname(p);
    while (cur !== "/" && cur !== ".") { dirs.add(cur); cur = pathShim.dirname(cur); }
  }

  function readdirSync(p) {
    p = normPath(p);
    if (!dirs.has(p)) throw Object.assign(new Error("ENOENT: " + p), { code: "ENOENT" });
    const prefix = p === "/" ? "/" : p + "/";
    const seen = new Set();
    for (const fp of Object.keys(files)) {
      if (fp.startsWith(prefix)) {
        const rest = fp.slice(prefix.length);
        seen.add(rest.split("/")[0]);
      }
    }
    for (const d of dirs) {
      if (d !== p && d.startsWith(prefix)) {
        const rest = d.slice(prefix.length);
        if (!rest.includes("/")) seen.add(rest);
      }
    }
    return [...seen];
  }

  function statSync(p) {
    p = normPath(p);
    const isDir = dirs.has(p);
    const isFile = p in files;
    if (!isFile && !isDir) throw Object.assign(new Error("ENOENT: " + p), { code: "ENOENT" });
    const size = isFile ? files[p].length : 0;
    const now = Date.now();
    return {
      isFile: () => isFile,
      isDirectory: () => isDir,
      isSymbolicLink: () => false,
      size,
      mtimeMs: now, mtime: new Date(now),
      ctimeMs: now, ctime: new Date(now),
      atimeMs: now, atime: new Date(now),
      birthtimeMs: now, birthtime: new Date(now),
      mode: isDir ? 0o755 : 0o644,
      uid: 1000, gid: 1000,
      ino: 0, dev: 0, nlink: 1,
    };
  }

  function mkdirSync(p, opts) {
    p = normPath(p);
    dirs.add(p);
    let cur = pathShim.dirname(p);
    while (cur !== "/" && cur !== ".") { dirs.add(cur); cur = pathShim.dirname(cur); }
  }

  function unlinkSync(p) {
    p = normPath(p);
    delete files[p];
  }

  function renameSync(oldP, newP) {
    oldP = normPath(oldP); newP = normPath(newP);
    if (oldP in files) { files[newP] = files[oldP]; delete files[oldP]; }
  }

  function rmdirSync(p) {
    p = normPath(p);
    dirs.delete(p);
  }

  function rmSync(p, opts) {
    p = normPath(p);
    if (opts && opts.recursive) {
      const prefix = p + "/";
      for (const fp of Object.keys(files)) if (fp.startsWith(prefix) || fp === p) delete files[fp];
      for (const d of [...dirs]) if (d.startsWith(prefix) || d === p) dirs.delete(d);
    } else {
      delete files[p];
    }
  }

  function appendFileSync(p, data) {
    p = normPath(p);
    files[p] = (files[p] || "") + data;
    let cur = pathShim.dirname(p);
    while (cur !== "/" && cur !== ".") { dirs.add(cur); cur = pathShim.dirname(cur); }
  }

  function utimesSync(p) {} // no-op

  function watchSync(p, opts, cb) {
    // Return a dummy watcher
    return { close: () => {}, on: () => {} };
  }

  const constants = { O_RDONLY: 0, O_WRONLY: 1, O_RDWR: 2, O_CREAT: 64, O_TRUNC: 512, F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 };

  const promises = {
    readFile: async (p, enc) => {
      const content = readFileSync(p, enc);
      // No encoding = binary read: return Uint8Array so .buffer/.byteOffset/.byteLength work
      if (enc === undefined || enc === null) return new TextEncoder().encode(content);
      return content;
    },
    writeFile: async (p, data) => writeFileSync(p, data),
    appendFile: async (p, data) => appendFileSync(p, data),
    readdir: async (p, opts) => {
      const entries = readdirSync(p);
      if (opts && opts.withFileTypes) {
        return entries.map(name => ({
          name,
          isFile: () => normPath(p + "/" + name) in files,
          isDirectory: () => dirs.has(normPath(p + "/" + name)),
          isSymbolicLink: () => false,
        }));
      }
      return entries;
    },
    stat: async (p) => statSync(p),
    lstat: async (p) => statSync(p),
    mkdir: async (p, opts) => mkdirSync(p, opts),
    unlink: async (p) => unlinkSync(p),
    rename: async (o, n) => renameSync(o, n),
    rmdir: async (p) => rmdirSync(p),
    rm: async (p, opts) => rmSync(p, opts),
    realpath: async (p) => normPath(p),
    copyFile: async (src, dst) => { src = normPath(src); dst = normPath(dst); files[dst] = files[src]; },
    utimes: async () => {},
    access: async (p, mode) => { if (!existsSync(p)) throw Object.assign(new Error("ENOENT: " + p), { code: "ENOENT" }); },
    watch: watchSync,
  };

  return {
    existsSync, readFileSync, writeFileSync, readdirSync, statSync,
    mkdirSync, unlinkSync, renameSync, rmdirSync, rmSync, appendFileSync,
    utimesSync, watch: watchSync, constants, promises,
    lstatSync: statSync,
    realpathSync: (p) => normPath(p),
    copyFileSync: (s, d) => { files[normPath(d)] = files[normPath(s)]; },
  };
})();

// ────────────────────────────────────────────────────────────
// 4. IPC shim
// ────────────────────────────────────────────────────────────
const VAULT_ID = "sandbox-demo";
const VAULT_PATH = "/vault";

const ipcShim = {
  sendSync(channel, arg) {
    switch (channel) {
      case "is-dev":         return false;
      case "file-url":       return "";
      case "resources":      return "/";
      case "insider-build":  return false;
      case "is-quitting":    return false;
      case "frame":          return "hidden";
      case "version":        return "1.8.0";
      case "vault":          return { id: VAULT_ID, path: VAULT_PATH };
      case "vault-list":     return { [VAULT_ID]: { id: VAULT_ID, path: VAULT_PATH } };
      case "documents-dir":  return "/documents";
      case "desktop-dir":    return "/desktop";
      case "cli":            return "";
      case "adblock-lists":  return [];
      case "adblock-frequency": return 0;
      case "disable-gpu":    return false;
      case "sandbox":        return null;  // no-op; don't close window
      case "starter":        return null;  // no-op; don't close window
      case "help":           return null;
      case "trash":          return null;
      case "update":         return null;
      case "check-update":   return null;
      case "disable-update": return null;
      case "relaunch":       return null;
      default:
        console.warn("[shim] ipcRenderer.sendSync: unhandled channel:", channel, arg);
        return null;
    }
  },
  send(channel, ...args) {
    console.log("[shim] ipcRenderer.send:", channel, ...args);
  },
  on(channel, cb) {
    // no-op — we don't push events from main process
    return ipcShim;
  },
  once(channel, cb) { return ipcShim; },
  removeListener(channel, cb) { return ipcShim; },
  removeAllListeners(channel) { return ipcShim; },
  invoke(channel, ...args) {
    console.log("[shim] ipcRenderer.invoke:", channel);
    return Promise.resolve(null);
  },
};

// ────────────────────────────────────────────────────────────
// 5. Electron shim
// ────────────────────────────────────────────────────────────
const electronShim = {
  ipcRenderer: ipcShim,
  remote: {
    app: {
      getVersion: () => "1.8.0",
      getName: () => "Obsidian",
      getPath: (name) => {
        const map = { userData: "/userdata", appData: "/appdata", temp: "/tmp", documents: "/documents", desktop: "/desktop" };
        return map[name] || "/";
      },
    },
    dialog: {
      showOpenDialogSync: () => null,
      showOpenDialog: () => Promise.resolve({ canceled: true, filePaths: [] }),
      showMessageBoxSync: () => 0,
      showMessageBox: () => Promise.resolve({ response: 0 }),
      showSaveDialogSync: () => null,
      showSaveDialog: () => Promise.resolve({ canceled: true, filePath: null }),
    },
    clipboard: {
      writeText: (text) => navigator.clipboard && navigator.clipboard.writeText(text),
      readText: () => "",
      readImage: () => null,
      writeImage: () => {},
      clear: () => {},
    },
    safeStorage: {
      isEncryptionAvailable: () => false,
      getSelectedStorageBackend: () => "unknown",
      encryptString: (s) => Buffer.from ? Buffer.from(s) : new TextEncoder().encode(s),
      decryptString: (b) => typeof b === "string" ? b : new TextDecoder().decode(b),
    },
    nativeTheme: (() => {
      const nt = {
        shouldUseDarkColors: true,
        themeSource: "dark",
        on(event, cb) { return nt; },
        once(event, cb) { return nt; },
        removeListener(event, cb) { return nt; },
        removeAllListeners(event) { return nt; },
        emit() { return false; },
      };
      return nt;
    })(),
    getCurrentWindow: () => ({
      isFocused: () => document.hasFocus(),
      isMaximized: () => false,
      isMinimized: () => false,
      isFullScreen: () => false,
      maximize: () => {},
      unmaximize: () => {},
      minimize: () => {},
      restore: () => {},
      close: () => {},
      show: () => {},
      hide: () => {},
      focus: () => window.focus(),
      blur: () => {},
      on: () => {},
      once: () => {},
      removeListener: () => {},
      setTitle: () => {},
      setAlwaysOnTop: () => {},
      isAlwaysOnTop: () => false,
      setFullScreen: () => {},
      setFullScreenable: () => {},
      setResizable: () => {},
      setMovable: () => {},
      setMinimizable: () => {},
      setMaximizable: () => {},
      setClosable: () => {},
      setSkipTaskbar: () => {},
      webContents: { setZoomFactor: () => {}, getZoomFactor: () => 1, openDevTools: () => {} },
      getBounds: () => ({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }),
      setBounds: () => {},
    }),
    getCurrentWebContents: () => ({
      setZoomFactor: () => {},
      getZoomFactor: () => 1,
      openDevTools: () => {},
    }),
  },
  shell: {
    openExternal: (url) => { window.open(url, "_blank"); return Promise.resolve(); },
    showItemInFolder: () => {},
    beep: () => {},
  },
  clipboard: {
    writeText: (text) => navigator.clipboard && navigator.clipboard.writeText(text),
    readText: () => "",
  },
};

// ────────────────────────────────────────────────────────────
// 6. OS shim
// ────────────────────────────────────────────────────────────
const osShim = {
  hostname: () => "obsidian-web",
  platform: () => "linux",
  arch: () => "x64",
  version: () => "Linux",
  release: () => "1.0",
  tmpdir: () => "/tmp",
  homedir: () => "/home",
  type: () => "Linux",
};

// ────────────────────────────────────────────────────────────
// 7. Crypto shim (Web Crypto wrapper)
// ────────────────────────────────────────────────────────────
const cryptoShim = {
  // scrypt is called as crypto.scryptSync — wrap Web Crypto
  scryptSync(password, salt, keylen, options) {
    // Synchronous scrypt is not available in Web Crypto.
    // Return a deterministic dummy key — this is only used for vault encryption.
    const arr = new Uint8Array(keylen);
    for (let i = 0; i < keylen; i++) arr[i] = i & 0xff;
    return Buffer ? Buffer.from(arr) : arr;
  },
  randomBytes(size) {
    const arr = new Uint8Array(size);
    crypto.getRandomValues(arr);
    return arr;
  },
  createHash(algo) {
    // Minimal interface — Obsidian uses this to hash vault IDs
    let data = "";
    return {
      update(d) { data += d; return this; },
      digest(enc) {
        // Simple djb2 hash as placeholder
        let h = 5381;
        for (let i = 0; i < data.length; i++) h = ((h << 5) + h) ^ data.charCodeAt(i);
        const hex = (h >>> 0).toString(16).padStart(8, "0").repeat(8).slice(0, 64);
        return enc === "hex" ? hex : hex;
      },
    };
  },
  createHmac(algo, key) {
    let data = "";
    return {
      update(d) { data += d; return this; },
      digest(enc) { return ""; },
    };
  },
  // Pass through to Web Crypto for anything else
  subtle: globalThis.crypto.subtle,
  getRandomValues: (arr) => globalThis.crypto.getRandomValues(arr),
};

// ────────────────────────────────────────────────────────────
// 8. URL shim  
// ────────────────────────────────────────────────────────────
const urlShim = {
  URL: globalThis.URL,
  URLSearchParams: globalThis.URLSearchParams,
  pathToFileURL(p) {
    return new URL("file://" + (p.startsWith("/") ? p : "/" + p));
  },
  fileURLToPath(u) {
    if (typeof u === "string") return u.replace(/^file:\/\//, "");
    return u.pathname;
  },
};

// ────────────────────────────────────────────────────────────
// 9. window.require router
// ────────────────────────────────────────────────────────────
const moduleMap = {
  "original-fs": VFS,
  "fs":           VFS,
  "path":         pathShim,
  "url":          urlShim,
  "electron":     electronShim,
  "btime":        { getBtime: () => Date.now(), getBtimeSync: () => Date.now() },
  "crypto":       cryptoShim,
  "os":           osShim,
  "get-fonts":    { getFonts: async () => [], getFontsSync: () => [] },
};

window.require = function shimRequire(mod) {
  if (mod in moduleMap) return moduleMap[mod];
  console.warn("[shim] unhandled require(\"" + mod + "\")");
  return {};
};

// ────────────────────────────────────────────────────────────
// 10. Other globals Obsidian expects
// ────────────────────────────────────────────────────────────

// Obsidian reads window.electron directly in some places
window.electron = electronShim;

// Prevent window.close() from actually closing the tab (it's a no-op in most
// browsers anyway, but let's be explicit)
const _origClose = window.close.bind(window);
window.close = function () {
  console.warn("[shim] window.close() intercepted — ignoring");
  console.trace("[shim] window.close() call stack");
};

// ────────────────────────────────────────────────────────────
// 3b. Write-through flush wiring
// ────────────────────────────────────────────────────────────
let activeBackend = null;
let _suppressBackendFlush = false;

const _pendingWrites  = new Map();  // normalised path → content
const _pendingDeletes = new Set();
const _pendingRenames = [];         // [{from, to}]
let   _flushTimer     = null;

async function _flush() {
  _flushTimer = null;
  if (!activeBackend) return;
  const writes  = new Map(_pendingWrites);
  const deletes = new Set(_pendingDeletes);
  const renames = [..._pendingRenames];
  _pendingWrites.clear(); _pendingDeletes.clear(); _pendingRenames.length = 0;
  for (const [p, content] of writes)
    await activeBackend.writeFile(p, content).catch(e => console.warn("[shim] backend writeFile failed:", p, e));
  for (const p of deletes)
    await activeBackend.unlink(p).catch(e => console.warn("[shim] backend unlink failed:", p, e));
  for (const {from, to} of renames)
    await activeBackend.rename(from, to).catch(e => console.warn("[shim] backend rename failed:", from, e));
}

function _scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(_flush, 300);
}

// Patch VFS write methods to queue backend flushes
{
  const _origWrite = VFS.writeFileSync;
  VFS.writeFileSync = function(p, data) {
    _origWrite(p, data);
    if (!_suppressBackendFlush && activeBackend) {
      const norm = VFS.realpathSync(p);
      _pendingWrites.set(norm, typeof data === "string" ? data : String(data));
      _pendingDeletes.delete(norm);
      _scheduleFlush();
    }
  };
  VFS.promises.writeFile = async (p, data) => VFS.writeFileSync(p, data);

  const _origUnlink = VFS.unlinkSync;
  VFS.unlinkSync = function(p) {
    const norm = VFS.realpathSync(p);
    _origUnlink(p);
    if (!_suppressBackendFlush && activeBackend) {
      _pendingWrites.delete(norm);
      _pendingDeletes.add(norm);
      _scheduleFlush();
    }
  };
  VFS.promises.unlink = async (p) => VFS.unlinkSync(p);

  const _origRename = VFS.renameSync;
  VFS.renameSync = function(oldP, newP) {
    const normOld = VFS.realpathSync(oldP);
    const normNew = VFS.realpathSync(newP);
    _origRename(oldP, newP);
    if (!_suppressBackendFlush && activeBackend) {
      if (_pendingWrites.has(normOld)) {
        // Not yet flushed — redirect the pending write to the new path
        _pendingWrites.set(normNew, _pendingWrites.get(normOld));
        _pendingWrites.delete(normOld);
        _pendingDeletes.delete(normOld);
      } else {
        // Already in backend — issue a rename
        _pendingRenames.push({from: normOld, to: normNew});
      }
      _scheduleFlush();
    }
  };
  VFS.promises.rename = async (o, n) => VFS.renameSync(o, n);

  const _origAppend = VFS.appendFileSync;
  VFS.appendFileSync = function(p, data) {
    _origAppend(p, data);
    if (!_suppressBackendFlush && activeBackend) {
      const norm = VFS.realpathSync(p);
      try { _pendingWrites.set(norm, VFS.readFileSync(norm)); } catch(e) {}
      _scheduleFlush();
    }
  };
  VFS.promises.appendFile = async (p, data) => VFS.appendFileSync(p, data);
}

// ────────────────────────────────────────────────────────────
// 3c. Storage backends
// ────────────────────────────────────────────────────────────

// Capture sandbox seed files at shim load time, before any backend overwrites VFS
const _sandboxSeed = (() => {
  const result = {};
  function walk(dir) {
    let entries;
    try { entries = VFS.readdirSync(dir); } catch(e) { return; }
    for (const name of entries) {
      const full = dir + "/" + name;
      try {
        const st = VFS.statSync(full);
        if (st.isFile()) result[full] = VFS.readFileSync(full);
        else if (st.isDirectory()) walk(full);
      } catch(e) {}
    }
  }
  walk("/vault");
  return result;
})();

// ─── OPFS Backend ─────────────────────────────────────────────
const OPFSBackend = {
  async _root() {
    return navigator.storage.getDirectory();
  },

  async loadAll() {
    if (!navigator.storage || typeof navigator.storage.getDirectory !== "function") {
      console.warn("[shim] OPFS unavailable, using in-memory only");
      return {};
    }
    const root = await this._root();
    const loaded = {};
    await this._walk(root, "", loaded);
    if (Object.keys(loaded).length === 0) {
      console.log("[shim] OPFS empty — seeding from sandbox (" + Object.keys(_sandboxSeed).length + " files)");
      for (const [p, content] of Object.entries(_sandboxSeed))
        await this.writeFile(p, content);
      return { ..._sandboxSeed };
    }
    console.log("[shim] OPFS loaded " + Object.keys(loaded).length + " files");
    return loaded;
  },

  async _walk(dir, prefix, out) {
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind === "file") {
        out["/vault" + prefix + "/" + name] = await (await handle.getFile()).text();
      } else if (handle.kind === "directory") {
        await this._walk(handle, prefix + "/" + name, out);
      }
    }
  },

  // Returns {dir: DirectoryHandle, name: string} for a file abs path
  async _resolveDir(absPath) {
    const rel = absPath.replace(/^\/vault\/?/, "");
    const parts = rel.split("/").filter(Boolean);
    const fileName = parts.pop();
    let dir = await this._root();
    for (const part of parts)
      dir = await dir.getDirectoryHandle(part, { create: true });
    return { dir, name: fileName };
  },

  async writeFile(absPath, content) {
    try {
      const { dir, name } = await this._resolveDir(absPath);
      const fh = await dir.getFileHandle(name, { create: true });
      const writable = await fh.createWritable();
      await writable.write(content);
      await writable.close();
    } catch(e) {
      console.warn("[shim] OPFS writeFile failed:", absPath, e);
    }
  },

  async unlink(absPath) {
    try {
      const { dir, name } = await this._resolveDir(absPath);
      await dir.removeEntry(name);
    } catch(e) {
      if (e.name !== "NotFoundError") console.warn("[shim] OPFS unlink failed:", absPath, e);
    }
  },

  async rename(oldAbs, newAbs) {
    try {
      const { dir: oldDir, name: oldName } = await this._resolveDir(oldAbs);
      const fh = await oldDir.getFileHandle(oldName, { create: false });
      if (typeof fh.move === "function") {
        // Chrome 109+ native move
        const { dir: newDir, name: newName } = await this._resolveDir(newAbs);
        await fh.move(newDir, newName);
      } else {
        // Fallback: read → write new → delete old
        const content = await (await fh.getFile()).text();
        await this.writeFile(newAbs, content);
        await this.unlink(oldAbs);
      }
    } catch(e) {
      console.warn("[shim] OPFS rename failed:", oldAbs, "->", newAbs, e);
    }
  },

  async mkdir(absPath) {
    try {
      const rel = absPath.replace(/^\/vault\/?/, "");
      let dir = await this._root();
      for (const part of rel.split("/").filter(Boolean))
        dir = await dir.getDirectoryHandle(part, { create: true });
    } catch(e) {
      console.warn("[shim] OPFS mkdir failed:", absPath, e);
    }
  },
};

// ─── HTTP Backend ──────────────────────────────────────────────
const HTTPBackend = {
  baseURL: "",

  async loadAll() {
    try {
      const resp = await fetch(this.baseURL + "/api/vault");
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      console.log("[shim] HTTP backend loaded " + Object.keys(data).length + " files");
      return data;
    } catch(e) {
      console.warn("[shim] HTTP loadAll failed:", e);
      return {};
    }
  },

  async writeFile(absPath, content) {
    try {
      await fetch(this.baseURL + "/api/files" + absPath, {
        method: "PUT",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: content,
      });
    } catch(e) {
      console.warn("[shim] HTTP writeFile failed:", absPath, e);
    }
  },

  async unlink(absPath) {
    try {
      await fetch(this.baseURL + "/api/files" + absPath, { method: "DELETE" });
    } catch(e) {
      console.warn("[shim] HTTP unlink failed:", absPath, e);
    }
  },

  async rename(oldAbs, newAbs) {
    try {
      await fetch(this.baseURL + "/api/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: oldAbs, to: newAbs }),
      });
    } catch(e) {
      console.warn("[shim] HTTP rename failed:", oldAbs, "->", newAbs, e);
    }
  },

  async mkdir(absPath) { /* no-op: server infers dirs from file paths */ },
};

// ─── Backend selection ──────────────────────────────────────────
function _detectBackend() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("backend")
    ?? localStorage.getItem("obsidian-web-backend")
    ?? "opfs";

  if (type === "opfs") {
    localStorage.setItem("obsidian-web-backend", "opfs");
    return OPFSBackend;
  }
  if (type === "http") {
    const url = params.get("url")
      ?? localStorage.getItem("obsidian-web-http-url")
      ?? window.location.origin;
    localStorage.setItem("obsidian-web-backend", "http");
    localStorage.setItem("obsidian-web-http-url", url);
    HTTPBackend.baseURL = url;
    return HTTPBackend;
  }
  return null; // in-memory only
}

// ─── Boot sequence: load backend before Obsidian boots ─────────
let _backendReady = Promise.resolve();

activeBackend = _detectBackend();
if (activeBackend) {
  _backendReady = activeBackend.loadAll().then(loadedFiles => {
    _suppressBackendFlush = true;
    try {
      for (const [p, content] of Object.entries(loadedFiles))
        VFS.writeFileSync(p, content);
    } finally {
      _suppressBackendFlush = false;
    }
  }).catch(e => console.error("[shim] backend loadAll error:", e));
  console.log("[shim] Backend: " + (activeBackend === OPFSBackend ? "OPFS" : "HTTP (" + HTTPBackend.baseURL + ")"));
} else {
  console.log("[shim] Backend: none (in-memory only)");
}

// Intercept window.ready (set by enhance.js, called by app.js) to delay
// Obsidian's boot until the backend has finished populating the VFS cache.
Object.defineProperty(window, "ready", {
  configurable: true,
  set(originalFn) {
    delete window.ready;
    window.ready = function(callback) {
      originalFn(async function() {
        await _backendReady;
        callback();
      });
    };
  },
});

console.log("[shim] Obsidian web shim loaded. Vault: " + VAULT_PATH);
