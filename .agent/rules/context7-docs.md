---
trigger: manual
---

# Context7 Documentation Rule

Always use the Context7 MCP server when I ask for code generation, setup steps, or API implementation involving external libraries, frameworks, or SDKs. 

Do not rely on your training data for APIs. Instead, follow this exact two-step process:
1. First, use `resolve-library-id` to find the exact Context7-compatible ID for the requested framework/library.
2. Second, use `query-docs` with that ID to fetch the up-to-date documentation and code examples.
3. Finally, write the code based strictly on the retrieved documentation. 

If I explicitly provide a library ID in my prompt (e.g., "use library /vercel/next.js"), skip step 1 and immediately use `query-docs`.