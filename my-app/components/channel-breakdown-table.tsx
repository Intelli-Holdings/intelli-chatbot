import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ChannelData {
  number_of_conversation: number
  number_of_messages: number
  number_of_escalations: {
    channel: number
    total: number
  }
  number_of_app: number
}

interface ChannelBreakdownTableProps {
  data: Record<string, ChannelData>
}

export function ChannelBreakdownTable({ data }: ChannelBreakdownTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Conversations</TableHead>
          <TableHead>Messages</TableHead>
          <TableHead>Escalations</TableHead>
          <TableHead>Apps</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(data).map(([channel, channelData]) => (
          <TableRow key={channel}>
            <TableCell className="font-medium">{channel}</TableCell>
            <TableCell>{channelData.number_of_conversation}</TableCell>
            <TableCell>{channelData.number_of_messages}</TableCell>
            <TableCell>{channelData.number_of_escalations.total}</TableCell>
            <TableCell>{channelData.number_of_app}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

