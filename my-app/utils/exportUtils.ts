import { Conversation } from '@/app/dashboard/conversations/components/types';
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportToPDF = (conversation: Conversation) => {
  const doc = new jsPDF()
  const tableColumn = ["Timestamp", "Sender", "Message"]
  const tableRows: string[][] = []
  const customerName = conversation.customer_name || 'Unknown'

  // Add customer details section
  doc.text(`Customer Details:`, 14, 15)
  doc.text(`Name: ${customerName}`, 14, 25)
  doc.text(`Phone: ${conversation.customer_number}`, 14, 35)

  conversation.messages.forEach(message => {
    const messageRow = [
      new Date(message.created_at).toLocaleString(),
      message.content ? 'Customer' : (message.sender === 'ai' ? 'AI' : 'Human'),
      message.content || message.answer || ''
    ]
    tableRows.push(messageRow)
  })

  // Start message table below customer details
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
  })

  doc.save(`conversation_${customerName}_${conversation.customer_number}.pdf`)
}

export const exportToCSV = (conversation: Conversation) => {
  const customerName = conversation.customer_name || 'Unknown'
  const csvContent = "data:text/csv;charset=utf-8," 
    + `Customer Name: ${customerName}\n`
    + `Customer Number: ${conversation.customer_number}\n\n`
    + "Timestamp,Sender,Message\n"
    + conversation.messages.map(message => {
        return `${new Date(message.created_at).toLocaleString()},${message.content ? 'Customer' : (message.sender === 'ai' ? 'AI' : 'Human')},"${message.content || message.answer || ''}"`
      }).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `conversation_${customerName}_${conversation.customer_number}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


export const exportContactsToPDF = (conversations: Conversation[]) => {
  const doc = new jsPDF()
  const tableColumn = ["Name", "Phone Number", "Last Active"]
  const tableRows = conversations.map(conversation => [
    conversation.customer_name || 'Unknown',
    conversation.customer_number,
    new Date(conversation.updated_at).toLocaleString()
  ])

  // Set custom fonts and colors
  doc.setFont("helvetica", "bold")
  doc.setTextColor(44, 62, 80) // Dark blue color

  // Add a header
  doc.setFontSize(20)
  doc.text("All Contacts", 14, 15)
  
  // Add a horizontal line
  doc.setLineWidth(0.5)
  doc.line(14, 20, 196, 20)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255 }, // Blue header
    alternateRowStyles: { fillColor: [236, 240, 241] }, // Light gray for alternate rows
  })

  doc.save("all_contacts.pdf")
}


export const exportContactsToCSV = (conversations: Conversation[]) => {
  const csvContent = "data:text/csv;charset=utf-8,"
    + "Name,Phone Number,Last Active\n"
    + conversations.map(conversation => {
      return `"${conversation.customer_name || 'Unknown'}",${conversation.customer_number},"${new Date(conversation.updated_at).toLocaleString()}"`
    }).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "all_contacts.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
