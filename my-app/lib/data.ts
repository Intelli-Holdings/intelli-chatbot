import type { Email } from "@/lib/types"

const names = [
  "Alex Johnson",
  "Taylor Smith",
  "Jordan Williams",
  "Casey Brown",
  "Morgan Davis",
  "Riley Wilson",
  "Avery Miller",
  "Quinn Moore",
  "Reese Taylor",
  "Jamie Anderson",
]

const domains = ["gmail.com", "outlook.com", "company.com", "example.org", "mail.co"]

const subjects = [
  "Project Update: Q2 Goals",
  "Meeting Invitation: Strategy Discussion",
  "Important: Security Update Required",
  "Follow-up from yesterday's call",
  "Weekly Newsletter",
  "Your account statement",
  "Invitation to speak at conference",
  "Product launch announcement",
  "Feedback request",
  "Holiday schedule update",
]

const bodyTemplates = [
  "Hi there,\n\nI wanted to follow up on our discussion about {topic}. I think we should move forward with the plan outlined. Let me know your thoughts.\n\nBest regards,\n{sender}",
  "Hello,\n\nI'm writing to invite you a meeting on {topic} scheduled for next week. Please let me know if you're available.\n\nThanks,\n{sender}",
  "Dear team,\n\nI'm sharing the latest updates on our {topic} project. We've made significant progress in last sprint and are track to meet deadlines.\n\nRegards,\n{sender}",
  "Hi,\n\nJust a quick reminder about the upcoming deadline for {topic}. Please ensure all deliverables are submitted by end of day Friday.\n\nThank you,\n{sender}",
  "Hello everyone,\n\nI'm excited to announce that we've reached a major milestone in our {topic} initiative. This wouldn't have been possible without everyone's hard work and dedication.\n\nCheers,\n{sender}",
]

const topics = [
  "the new website design",
  "our marketing strategy",
  "the client presentation",
  "budget planning",
  "team restructuring",
  "product development",
  "customer feedback analysis",
  "the upcoming conference",
  "performance reviews",
  "the new office space",
]

const labels = ["Work", "Personal", "Important", "Urgent", "Follow-up", "Project A", "Project B"]

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateRandomEmail(id: string, folder = "inbox"): Email {
  const senderName = randomElement(names)
  const senderEmail = `${senderName.toLowerCase().replace("", ".")}@${randomElement(domains)}`
  const recipientEmail = "you@example.com"
  const subject = randomElement(subjects)
  const topic = randomElement(topics)
  const bodyTemplate = randomElement(bodyTemplates)
  const body = bodyTemplate.replace("{topic}", topic).replace("{sender}", senderName)
  const date = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
  const read = Math.random() > 0.3

  const hasLabels = Math.random() > 0.7
  const labelCount = hasLabels ? Math.floor(Math.random() * 3) + 1 : 0
  const emailLabels = labelCount > 0 ? randomElements(labels, labelCount) : undefined

  const hasAttachments = Math.random() > 0.8
  let attachments

  if (hasAttachments) {
    const attachmentTypes = ["PDF", "DOCX", "XLSX", "JPG", "PNG"]
    const attachmentNames = [
      "report",
      "document",
      "presentation",
      "image",
      "spreadsheet",
      "analysis",
      "proposal",
      "contract",
      "invoice",
      "screenshot",
    ]

    const attachmentCount = Math.floor(Math.random() * 3) + 1
    attachments = Array.from({ length: attachmentCount }, () => {
      const type = randomElement(attachmentTypes)
      const name = `${randomElement(attachmentNames)}_${Math.floor(Math.random() * 1000)}.${type.toLowerCase()}`
      const sizeMB = (Math.random() * 5).toFixed(1)
      return {
        name,
        type,
        size: `${sizeMB} MB`,
      }
    })
  }

  return {
    id,
    from: {
      name: senderName,
      email: senderEmail,
      avatar: `/placeholder.svg?height=40&width=40&text=${senderName.charAt(0)}`,
    },
    to: [recipientEmail],
    subject,
    body,
    date,
    read,
    folder: folder as any,
    labels: emailLabels,
    attachments,
  }
}

export function generateEmails(count: number): Email[] {
  const emails: Email[] = []

  // Generate inbox emails
  for (let i = 0; i < Math.floor(count * 0.6); i++) {
    emails.push(generateRandomEmail(`inbox-${i}`, "inbox"))
  }

  // Generate starred emails
  for (let i = 0; i < Math.floor(count * 0.1); i++) {
    emails.push(generateRandomEmail(`starred-${i}`, "starred"))
  }

  // Generate sent emails
  for (let i = 0; i < Math.floor(count * 0.2); i++) {
    const email = generateRandomEmail(`sent-${i}`, "sent")
    email.from = {
      name: "Me",
      email: "you@example.com",
      avatar: "/placeholder.svg?height=40&width=40&text=M",
    }
    email.to = [`${randomElement(names).toLowerCase().replace("", ".")}@${randomElement(domains)}`]
    email.read = true
    emails.push(email)
  }

  // Generate drafts
  for (let i = 0; i < Math.floor(count * 0.05); i++) {
    const email = generateRandomEmail(`draft-${i}`, "drafts")
    email.from = {
      name: "Me",
      email: "you@example.com",
      avatar: "/placeholder.svg?height=40&width=40&text=M",
    }
    email.to = [`${randomElement(names).toLowerCase().replace("", ".")}@${randomElement(domains)}`]
    email.read = true
    emails.push(email)
  }

  // Generate spam
  for (let i = 0; i < Math.floor(count * 0.05); i++) {
    emails.push(generateRandomEmail(`spam-${i}`, "spam"))
  }

  return emails
}

