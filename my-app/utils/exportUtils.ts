import { Conversation } from '@/app/dashboard/conversations/components/types';
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportToPDF = (conversation: Conversation) => {
  const doc = new jsPDF()
  const tableColumn = ["Timestamp", "Sender", "Message"]
  const tableRows: string[][] = []

  conversation.messages.forEach(message => {
    const messageRow = [
      new Date(message.created_at).toLocaleString(),
      message.content ? 'Customer' : (message.sender === 'ai' ? 'AI' : 'Human'),
      message.content || message.answer || ''
    ]
    tableRows.push(messageRow)
  })

  doc.text(`Conversation with ${conversation.customer_number}`, 14, 15)
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  })

  doc.save(`conversation_${conversation.customer_number}.pdf`)
}

export const exportToCSV = (conversation: Conversation) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Timestamp,Sender,Message\n"
    + conversation.messages.map(message => {
        return `${new Date(message.created_at).toLocaleString()},${message.content ? 'Customer' : (message.sender === 'ai' ? 'AI' : 'Human')},"${message.content || message.answer || ''}"`
      }).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `conversation_${conversation.customer_number}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToXLS = (conversation: Conversation) => {
  const ws = XLSX.utils.json_to_sheet(conversation.messages.map(message => ({
    Timestamp: new Date(message.created_at).toLocaleString(),
    Sender: message.content ? 'Customer' : (message.sender === 'ai' ? 'AI' : 'Human'),
    Message: message.content || message.answer || ''
  })))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Conversation")
  XLSX.writeFile(wb, `conversation_${conversation.customer_number}.xlsx`)
}

export const exportContacts = (conversations: Conversation[]) => {
  const contacts = conversations.map(conversation => ({
    'Phone Number': conversation.customer_number,
    'Last Active': new Date(conversation.updated_at).toLocaleString()
  }))

  const ws = XLSX.utils.json_to_sheet(contacts)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Contacts")
  XLSX.writeFile(wb, 'all_contacts.xlsx')
}

