# Intelli

This is the main repository of Intelli concierge, the omnichanel for customer support

# Usecases

## Hotel Inquiry and Reservation Automation

### Overview

3-5 star Hotels in Ghana receive high volumes of inquiries and reservations scattered across email, website, and social media. This overwhelms their inadequate customer support staff leading to delayed and inaccurate responses, and potential revenue loss.

Our solution, an automated web application and intelligent chatbot, aims to handle inquiries and reservations across channels, providing a detailed report of all customer support operations, enhancing customer experience, and increasing revenue.

### Solution Statement

Our solution is a web application and intelligent chatbot that automates responses to inquiries and makes reservations. It collects inquiries from all the channels and displays them in one central source, enhancing customer experience and increasing revenue.

### Value Proposition

Our solution automates the process of handling inquiries and reservations, freeing up time for customer support staff to focus on more complex issues. It provides a detailed report of all customer support operations, enhancing customer experience and increasing revenue.

## Getting Started with the Project

To get started with the project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/SqweyaSqweya-AI/intelli-chatbot.git
```

2. Navigate to the project directory:

```bash
cd my-app
```

3. Install the dependencies: entirely depending on the package manager of your choice

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Creating New Pages 

We are using NextJS 14+ and thus by default using app/ over src/ folder structure:
This means that for every new folder you create within app/ directory it becomes a page or route accessible in the domain.

- If you prefer to not render the folder use [] around it for example [your-folder-name].
- To make the route active, create a file within the created directory or folder and name it page.tsx.
- Import components from @components folder for reusability

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deployment

We are going to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js to deploy our nextJs app; it's the easiest way to do it.

## CI/CD

Ensure you periodically run git fetch command; 
- Stage and Commit your changes with commit messages
- Always run a git fetch before pushing changes
- Push changes to your branch before merging into the main branch
- Rules have been created that won't allow you do otherwise

# That's it Vertices.

Happy Engineering