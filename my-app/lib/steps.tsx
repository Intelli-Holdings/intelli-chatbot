export const steps: any = [
    // Getting Started with Intelli
    {
        icon: <>💬</>,
        title: "Welcome to Intelli!",
        content: <>Get started by learning how to create your first virtual assistant.</>,
        selector: "#step-create-assistant",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📱</>,
        title: "Navigation Overview",
        content: <>Your complete assistant management toolkit is accessible through the sidebar navigation.</>,
        selector: ".sidenav",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>💻</>,
        title: "Command Center",
        content: <>The Command Center is your main dashboard where you can monitor key metrics and overall performance.</>,
        selector: "#command-center-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📊</>,
        title: "Analytics Dashboard",
        content: <>Access detailed analytics and insights about your assistants&apos; performance, user engagement, and conversation metrics.</>,
        selector: "#analytics-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🤖</>,
        title: "Assistants Management",
        content: <>Create, configure, and manage all your virtual assistants from this central hub.</>,
        selector: "#assistants-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>💬</>,
        title: "Conversations Overview",
        content: <>Monitor and manage all conversations between your assistants and users in real-time.</>,
        selector: "#conversations-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🔔</>,
        title: "Notifications Center",
        content: <>Stay informed with real-time alerts about your assistants&apos; activities and important updates.</>,
        selector: "#notifications-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🏢</>,
        title: "Organization Settings",
        content: <>Manage your organization&apos;s preferences, team access, and global configurations.</>,
        selector: "#organization-link",
        side: "right",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🤖</>,
        title: "Active Assistants Overview",
        content: <>View the total number of assistants deployed across your organization.</>,
        selector: "#total-assistants-card",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📊</>,
        title: "Conversation Metrics",
        content: <>Track the total number of interactions between your assistants and users.</>,
        selector: "#total-conversations-card",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>👥</>,
        title: "Lead Generation",
        content: <>Monitor the number of qualified leads generated through assistant interactions.</>,
        selector: "#total-leads-card",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🛠️</>,
        title: "Customize your Assistant",
        content: (
            <>
              Personalize your assistant with a name, description, and greeting message.
              This makes your assistant unique to your brand.
            </>
        ),
        selector: "#step-customize-assistant",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📄</>,
        title: "Add Information Sources",
        content: (
            <>
              Upload documents (PDFs, DOCs) or website links for your assistant to learn from.
              This will help it provide accurate responses to your customers.
            </>
        ),
        selector: "#step-add-sources",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🤖</>,
        title: "Test Your Assistant",
        content: <>Test your assistant’s responses on the dashboard by simulating conversations.</>,
        selector: "#step-test-assistant",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🌐</>,
        title: "Website Widget Integration",
        content: (
            <>
              Learn how to integrate the assistant into your website with a custom widget.
              Just copy the provided snippet and paste it into your site.
            </>
        ),
        selector: "#step-website-widget",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📊</>,
        title: "Monitor Conversations",
        content: <>Keep track of user interactions and insights through the analytics dashboard.</>,
        selector: "#step-monitor-conversations",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🚀</>,
        title: "Deploy Your Assistant",
        content: (
            <>
              Once you’re satisfied, deploy your assistant and make it live on your
              site or communication channels (WhatsApp, Facebook, etc.).
            </>
        ),
        selector: "#step-deploy-assistant",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>⚙️</>,
        title: "Advanced Settings",
        content: (
            <>
              Explore advanced settings for fine-tuning your assistant’s behavior, 
              including custom response flows and fallback logic.
            </>
        ),
        selector: "#step-advanced-settings",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>📈</>,
        title: "Analytics Overview",
        content: (
            <>
              Understand key metrics, including conversation volumes, user satisfaction,
              and response accuracy in the analytics dashboard.
            </>
        ),
        selector: "#step-analytics-overview",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
        nextRoute: "/analytics",
    },
    {
        icon: <>⭐</>,
        title: "Help & Support",
        content: <>Need assistance? Check our documentation or contact support at any time.</>,
        selector: "#step-help-support",
        side: "top",
        showControls: true,
        pointerPadding: -1,
        pointerRadius: 24,
    },
    {
        icon: <>🚀</>,
        title: "Get Started!",
        content: <>You&apos;re ready to start using Intelli. Let&apos;s create your first assistant!</>,
        selector: "#step-get-started",
        side: "bottom",
        showControls: true,
        pointerPadding: 5,
        pointerRadius: 10,
        prevRoute: "/dashboard",
    },
];
