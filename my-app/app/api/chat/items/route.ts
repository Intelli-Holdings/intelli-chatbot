export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const res = await fetch(`https://intelli-python-backend.onrender.com/dashboard/reservations/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const reservations = await res.json()
   
    return Response.json({ reservations })
  }